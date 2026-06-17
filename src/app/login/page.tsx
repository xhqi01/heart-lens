import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/auth';
import { env } from '@/lib/env';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');
  return <LoginForm registrationOpen={env.registrationMode === 'open'} />;
}
