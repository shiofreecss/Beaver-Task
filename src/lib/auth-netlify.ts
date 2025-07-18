import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
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

// Get the base URL for production deployment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use Netlify URL or custom domain
    return process.env.NEXTAUTH_URL || process.env.NETLIFY_URL || 'https://your-app.netlify.app'
  }
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
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
          throw error;
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
      // Handle Netlify deployment redirects
      const productionUrl = getBaseUrl();
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${productionUrl}${url}`;
      }
      
      // Handle same-origin URLs
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(productionUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (e) {
        // If URL parsing fails, use base URL
      }
      
      // Default to base URL
      return productionUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_DEBUG === 'true',
}