import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { convexHttp } from "@/lib/convex"
import { api } from "../../convex/_generated/api"

type UserWithPassword = {
  _id: string
  email: string
  name: string | null
  password: string
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string | null
  }
}

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
}

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  console.error('Please set these variables in your Netlify environment settings')
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Redirect to login page on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          // Validate Convex URL is available
          if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
            console.error('❌ NEXT_PUBLIC_CONVEX_URL is not set')
            return null
          }

          // Use Convex to get user
          const user = await convexHttp.query(api.users.getUserByEmail, {
            email: credentials.email
          }) as UserWithPassword | null

          if (!user) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          console.log('✅ Authentication successful for user:', credentials.email)
          return {
            id: user._id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email!
        token.name = user.name || null
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | null
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_DEBUG === 'true',
} 