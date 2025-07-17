"use client";

import { ConvexReactClient } from "convex/react";

// For client components only
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default convex; 