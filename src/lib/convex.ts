import { ConvexHttpClient } from "convex/browser";

// For server components and API routes
export const convexHttp = new ConvexHttpClient(process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!);

// For client components only - this should not be imported in server-side code
export const createConvexReactClient = () => {
  const { ConvexReactClient } = require("convex/react");
  return new ConvexReactClient(process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL!);
};

export default convexHttp;