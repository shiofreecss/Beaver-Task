import { redirect } from "next/navigation";
import { DashboardSimple } from '@/components/dashboard-simple'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-convex';
import { FullScreenLoading } from '@/components/ui/loading-screen';
import { Suspense } from 'react';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Show landing page instead of redirecting
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">Beaver Task</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your all-in-one productivity platform for tasks, projects, habits, and more.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Task Management</h3>
              <p className="text-gray-600">Organize your tasks with Kanban boards and timelines</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Habit Tracking</h3>
              <p className="text-gray-600">Build better habits with daily tracking and analytics</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Pomodoro Timer</h3>
              <p className="text-gray-600">Stay focused with customizable work sessions</p>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/register" 
              className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<FullScreenLoading message="Loading your workspace..." />}>
      <DashboardSimple />
    </Suspense>
  )
} 