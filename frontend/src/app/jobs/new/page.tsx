'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', department: '', location: '', salaryMin: '', salaryMax: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
      };
      await api.post('/jobs', payload);
      router.push('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create job');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/jobs" className="text-gray-400 hover:text-white text-sm">← Back to Jobs</Link>
        <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">{error}</div>}

        <div>
          <label className="label">Job Title *</label>
          <input className="input" placeholder="e.g. Senior Python Developer" value={form.title} onChange={set('title')} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <input className="input" placeholder="Engineering" value={form.department} onChange={set('department')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Remote / New York" value={form.location} onChange={set('location')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Min Salary ($)</label>
            <input className="input" type="number" placeholder="60000" value={form.salaryMin} onChange={set('salaryMin')} />
          </div>
          <div>
            <label className="label">Max Salary ($)</label>
            <input className="input" type="number" placeholder="90000" value={form.salaryMax} onChange={set('salaryMax')} />
          </div>
        </div>

        <div>
          <label className="label">Job Description *</label>
          <textarea className="input min-h-32 resize-none" placeholder="Describe the role, responsibilities, team, and what a typical day looks like…"
            value={form.description} onChange={set('description')} required rows={5} />
        </div>

        <div>
          <label className="label">Requirements *</label>
          <textarea className="input min-h-28 resize-none"
            placeholder="List required skills, years of experience, qualifications…&#10;e.g. 3+ years Python, experience with REST APIs, strong communication skills"
            value={form.requirements} onChange={set('requirements')} required rows={4} />
          <p className="text-xs text-gray-500 mt-1">The AI uses this field to screen resumes — be specific.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Posting…' : 'Post Job'}
          </button>
          <Link href="/jobs" className="btn-secondary px-6">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
