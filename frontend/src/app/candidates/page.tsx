'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Candidate } from '@/types';

const STAGE_COLOR: Record<string, string> = {
  APPLIED: 'bg-gray-700 text-gray-200', SCREENING: 'bg-blue-900 text-blue-200',
  SCREENED_OUT: 'bg-red-900 text-red-200', ASSESSMENT: 'bg-yellow-900 text-yellow-200',
  EVALUATING: 'bg-orange-900 text-orange-200', INTERVIEW: 'bg-purple-900 text-purple-200',
  INTERVIEW_EVALUATING: 'bg-indigo-900 text-indigo-200', FINAL_REVIEW: 'bg-cyan-900 text-cyan-200',
  HIRED: 'bg-green-900 text-green-200', REJECTED: 'bg-red-900 text-red-200',
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/candidates').then(r => setCandidates(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? candidates.filter(c => c.stage === filter) : candidates;

  const stages = ['APPLIED','SCREENING','SCREENED_OUT','ASSESSMENT','EVALUATING','INTERVIEW','INTERVIEW_EVALUATING','FINAL_REVIEW','HIRED','REJECTED'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-hire-text-main">All Candidates</h1>
        <select className="input w-auto text-sm"
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="text-hire-text-muted">Loading…</div> : (
        <div className="card p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-hire-text-muted">No candidates found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-hire-text-muted text-xs border-b border-hire-border">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Job</th>
                  <th className="text-left px-5 py-3">Stage</th>
                  <th className="text-left px-5 py-3">Score</th>
                  <th className="text-left px-5 py-3">Applied</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-hire-border/50 hover:bg-hire-surface-hover transition-colors">
                    <td className="px-5 py-3 font-medium text-hire-text-main">{c.name}</td>
                    <td className="px-5 py-3 text-hire-text-muted text-xs">{c.email}</td>
                    <td className="px-5 py-3 text-hire-text-muted text-xs">{(c as any).job?.title || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLOR[c.stage]}`}>
                        {c.stage.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {c.screeningScore != null
                        ? <span className={`font-bold ${c.screeningScore >= 70 ? 'text-green-400' : c.screeningScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{Math.round(c.screeningScore)}</span>
                        : <span className="text-hire-text-muted">—</span>}
                    </td>
                    <td className="px-5 py-3 text-hire-text-muted text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Link href={`/candidates/${c.id}`} className="text-hire-primary hover:text-hire-primary-hover text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
