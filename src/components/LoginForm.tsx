'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getT } from '@/lib/i18n';

const t = getT('en');

export default function LoginForm({ registrationOpen }: { registrationOpen: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t.loginError);
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="sidebar-logo" style={{ marginBottom: 18 }}>
          <div className="sidebar-logo-icon">◐</div>
          <div className="sidebar-logo-text" style={{ fontSize: 18 }}>
            Heart<span>Lens</span>
          </div>
        </div>
        <p className="modal-sub">{mode === 'login' ? t.loginSub : 'Create your account.'}</p>

        {error && <div className="error-banner" style={{ margin: '0 0 14px' }}>{error}</div>}

        <div className="form-group">
          <label className="form-label">{t.emailLabel}</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t.passwordLabel}</label>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={busy}>
          {busy ? t.signingIn : mode === 'login' ? t.signIn : t.createArchive}
        </button>

        {registrationOpen && (
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('register')} style={linkStyle}>
                  Register
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('login')} style={linkStyle}>
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </form>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  cursor: 'pointer',
  fontSize: 12,
  padding: 0,
};
