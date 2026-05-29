'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import api from '@/lib/api';

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/jobs/public/${jobId}`).then(r => setJob(r.data)).catch(() => setMessage('Job not found or no longer available.'));
  }, [jobId]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) { setMessage('Please attach your resume PDF.'); return; }
    setStatus('loading'); setMessage('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('jobId', jobId);
      fd.append('resume', resume);
      const { data } = await api.post('/candidates/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Submission failed. Please try again.');
    }
  };

  if (message && !job) return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-center">{message}</div>
      </div>
    </>
  );

  if (status === 'success') return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-2xl font-bold text-white">Application Submitted!</h1>
          <p className="text-gray-400">{message}</p>
          <div className="card text-left text-sm text-gray-400 mt-4 space-y-2">
            <p>What happens next:</p>
            <p>1. 🤖 Our AI will screen your resume within minutes</p>
            <p>2. 📧 If qualified, you'll receive an assessment by email</p>
            <p>3. 📊 Your answers will be evaluated automatically</p>
            <p>4. 🎤 Shortlisted candidates get an AI voice interview link</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
        {job && (
          <div className="text-center">
            <div className="text-indigo-400 text-sm font-medium mb-1">You're applying for</div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <div className="flex gap-3 justify-center text-sm text-gray-400 mt-1">
              {job.department && <span>📁 {job.department}</span>}
              {job.location && <span>📍 {job.location}</span>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-4">
          {message && status === 'error' && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">{message}</div>
          )}

          <div>
            <label className="label">Full Name *</label>
            <input className="input" placeholder="Sarah Johnson" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input className="input" type="email" placeholder="sarah@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="label">Resume (PDF only, max 5MB) *</label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${resume ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:border-gray-500'}`}
              onClick={() => document.getElementById('resume-input')?.click()}>
              <input id="resume-input" type="file" accept=".pdf" className="hidden"
                onChange={e => setResume(e.target.files?.[0] || null)} />
              {resume
                ? <div className="text-indigo-300 text-sm">📄 {resume.name} ({(resume.size / 1024 / 1024).toFixed(1)} MB)</div>
                : <div className="text-gray-500 text-sm">Click to upload your resume PDF</div>
              }
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p>⚡ Applications are processed automatically by AI within minutes</p>
            <p>🔒 Your resume is encrypted and stored securely</p>
          </div>

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3 text-base">
            {status === 'loading' ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
