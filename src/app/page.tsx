import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/auth';
import AppShell from '@/components/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <AppShell user={{ email: user.email, isAdmin: user.isAdmin }} />;
}
