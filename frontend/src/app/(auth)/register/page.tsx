'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { saveAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ companyName: '', companyEmail: '', userName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      saveAuth(data.token, data.user, data.tenantId, form.companyName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-hire-text-main">HireFlow</Link>
          <p className="text-hire-text-muted mt-2">Register your company</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">{error}</div>}
          <div className="border-b border-hire-border pb-4">
            <p className="text-xs text-hire-text-muted uppercase tracking-wider mb-3">Company Details</p>
            <div className="space-y-3">
              <div>
                <label className="label">Company Name</label>
                <input className="input" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} required />
              </div>
              <div>
                <label className="label">Company Email</label>
                <input className="input" type="email" placeholder="contact@acme.com" value={form.companyEmail} onChange={set('companyEmail')} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-hire-text-muted uppercase tracking-wider mb-3">Admin Account</p>
            <div className="space-y-3">
              <div>
                <label className="label">Your Name</label>
                <input className="input" placeholder="Jane Smith" value={form.userName} onChange={set('userName')} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="jane@acme.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-hire-text-muted">
            Already registered? <Link href="/login" className="text-hire-primary hover:text-hire-primary-hover">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
