'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { Job, Candidate } from '@/types';

const STAGE_COLOR: Record<string, string> = {
  APPLIED: 'bg-gray-700 text-gray-200',
  SCREENING: 'bg-blue-900 text-blue-200',
  SCREENED_OUT: 'bg-red-900 text-red-200',
  ASSESSMENT: 'bg-yellow-900 text-yellow-200',
  EVALUATING: 'bg-orange-900 text-orange-200',
  INTERVIEW: 'bg-purple-900 text-purple-200',
  HIRED: 'bg-green-900 text-green-200',
  REJECTED: 'bg-red-900 text-red-200',
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job & { candidates: Candidate[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const applyLink = `${window.location.origin}/apply/${id}`;
  const copyLink = () => {
    navigator.clipboard.writeText(applyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-6 text-hire-text-muted">Loading…</div>;
  if (!job) return <div className="p-6 text-red-400">Job not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/jobs" className="text-hire-text-muted hover:text-hire-text-main text-sm">← Jobs</Link>
          <h1 className="text-2xl font-bold text-hire-text-main mt-1">{job.title}</h1>
          <div className="flex gap-3 text-sm text-hire-text-muted mt-1">
            {job.department && <span>📁 {job.department}</span>}
            {job.location && <span>📍 {job.location}</span>}
            {job.salaryMin && <span>💰 ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}</span>}
          </div>
        </div>
        <button onClick={copyLink} className="btn-secondary text-sm">
          {copied ? '✓ Copied!' : '🔗 Copy Apply Link'}
        </button>
      </div>

      {/* Apply link banner */}
      <div className="bg-hire-primary/20 border border-hire-primary/50 rounded-lg px-4 py-3 text-sm">
        <span className="text-hire-text-muted">Public apply link: </span>
        <span className="text-hire-primary font-mono text-xs break-all">{applyLink}</span>
      </div>

      {/* Job details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-hire-text-main mb-2">Description</h3>
          <p className="text-sm text-hire-text-muted whitespace-pre-wrap">{job.description}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-hire-text-main mb-2">Requirements</h3>
          <p className="text-sm text-hire-text-muted whitespace-pre-wrap">{job.requirements}</p>
        </div>
      </div>

      {/* Candidates table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-hire-border flex items-center justify-between">
          <h2 className="font-semibold text-hire-text-main">Candidates ({job.candidates?.length || 0})</h2>
        </div>
        {!job.candidates?.length ? (
          <div className="text-center py-10 text-hire-text-muted text-sm">
            No applications yet. Share the apply link above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-hire-text-muted text-xs border-b border-hire-border">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Stage</th>
                <th className="text-left px-5 py-3">Score</th>
                <th className="text-left px-5 py-3">Applied</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {job.candidates.map(c => (
                <tr key={c.id} className="border-b border-hire-border/50 hover:bg-hire-surface-hover transition-colors">
                  <td className="px-5 py-3 font-medium text-hire-text-main">{c.name}</td>
                  <td className="px-5 py-3 text-hire-text-muted">{c.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLOR[c.stage] || ''}`}>
                      {c.stage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {c.screeningScore != null ? (
                      <span className={`font-bold ${c.screeningScore >= 70 ? 'text-green-400' : c.screeningScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(c.screeningScore)}
                      </span>
                    ) : <span className="text-hire-text-muted">—</span>}
                  </td>
                  <td className="px-5 py-3 text-hire-text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Link href={`/candidates/${c.id}`} className="text-hire-primary hover:text-hire-primary-hover text-xs">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
