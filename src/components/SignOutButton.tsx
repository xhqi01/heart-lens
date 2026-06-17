'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getT } from '@/lib/i18n';

export default function SignOutButton({ lang = 'en' }: { lang?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const t = getT(lang);

  return (
    <button
      className="btn-settings"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
        router.refresh();
      }}
    >
      {t.signOut}
    </button>
  );
}
