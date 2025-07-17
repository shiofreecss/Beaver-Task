import { redirect } from "next/navigation";
import { DashboardSimple } from '@/components/dashboard-simple'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <DashboardSimple />
} 