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

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Redirect to login page on auth errors
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
          console.log("Missing credentials")
          return null
        }

        try {
          console.log("Attempting to authenticate user:", credentials.email);
          
          // Verify Convex connection
          if (!process.env.CONVEX_URL && !process.env.NEXT_PUBLIC_CONVEX_URL) {
            throw new Error("Convex URL not configured");
          }

          // Use Convex to get user
          let user;
          try {
            user = await convexHttp.query(api.users.getUserByEmail, {
              email: credentials.email
            }) as UserWithPassword | null;
          } catch (convexError) {
            console.error("Convex query failed:", convexError);
            throw new Error(`Convex connection failed: ${String(convexError)}`);
          }

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("User authenticated successfully:", user.email);
          return {
            id: user._id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          const errorMessage = error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
          const errorStack = error && typeof error === 'object' && 'stack' in error
            ? String((error as { stack: unknown }).stack)
            : undefined;
          
          console.error("Auth error:", {
            message: errorMessage,
            stack: errorStack,
            convexUrl: process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
          });
          throw error; // Let NextAuth handle the error
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
      // Log redirect information for debugging
      console.log("NextAuth redirect:", { url, baseUrl })
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        console.log("Redirecting to:", redirectUrl)
        return redirectUrl
      }
      
      // Handle same-origin URLs
      if (new URL(url).origin === baseUrl) {
        console.log("Redirecting to same origin:", url)
        return url
      }
      
      // Default to base URL
      console.log("Redirecting to base URL:", baseUrl)
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
} 