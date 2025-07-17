import { redirect } from "next/navigation";
import { DashboardSimple } from '@/components/dashboard-simple'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FullScreenLoading } from '@/components/ui/loading-screen';
import { Suspense } from 'react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<FullScreenLoading message="Loading your workspace..." />}>
      <DashboardSimple />
    </Suspense>
  )
} 