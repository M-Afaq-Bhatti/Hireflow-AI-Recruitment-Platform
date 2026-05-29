'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import type { Candidate, Stage } from '@/types';

const COLUMNS: { stage: Stage; label: string; color: string }[] = [
  { stage: 'APPLIED',    label: 'Applied',    color: 'border-gray-600' },
  { stage: 'ASSESSMENT', label: 'Assessment', color: 'border-yellow-600' },
  { stage: 'INTERVIEW',  label: 'Interview',  color: 'border-purple-600' },
  { stage: 'HIRED',      label: 'Hired',      color: 'border-green-600' },
];

const STAGE_DOT: Record<string, string> = {
  APPLIED: 'bg-gray-400', SCREENING: 'bg-blue-400', SCREENED_OUT: 'bg-red-400',
  ASSESSMENT: 'bg-yellow-400', EVALUATING: 'bg-orange-400', INTERVIEW: 'bg-purple-400',
  HIRED: 'bg-green-400', REJECTED: 'bg-red-400',
};

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium stage-${stage}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[stage] || 'bg-gray-400'}`} />
      {stage.replace('_', ' ')}
    </span>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link href={`/candidates/${candidate.id}`}>
      <div className="bg-hire-surface border border-hire-border rounded-lg p-3 hover:border-hire-primary transition-colors cursor-pointer group animate-slide-in">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium text-sm text-hire-text-main group-hover:text-hire-primary transition-colors">{candidate.name}</div>
            <div className="text-xs text-hire-text-muted mt-0.5">{candidate.email}</div>
          </div>
          {candidate.screeningScore != null && (
            <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${candidate.screeningScore >= 70 ? 'text-green-400 bg-green-900/40' : candidate.screeningScore >= 50 ? 'text-yellow-400 bg-yellow-900/40' : 'text-red-400 bg-red-900/40'}`}>
              {Math.round(candidate.screeningScore)}
            </div>
          )}
        </div>
        <div className="mt-2">
          <StageBadge stage={candidate.stage} />
        </div>
        <div className="text-xs text-hire-text-muted mt-2">{candidate.job?.title}</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/candidates'), api.get('/tenants/stats')]);
      setCandidates(cRes.data);
      setStats(sRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdate = useCallback((data: any) => {
    setCandidates(prev => prev.map(c => c.id === data.candidateId ? { ...c, ...data } : c));
  }, []);

  const handleNew = useCallback((data: any) => {
    fetchData();
  }, []);

  useSocket(handleUpdate, handleNew);
  useEffect(() => { fetchData(); }, []);

  const getColumn = (stage: Stage) => candidates.filter(c => {
    if (stage === 'APPLIED') return ['APPLIED', 'SCREENING', 'SCREENED_OUT'].includes(c.stage);
    if (stage === 'ASSESSMENT') return ['ASSESSMENT', 'EVALUATING'].includes(c.stage);
    if (stage === 'INTERVIEW') return c.stage === 'INTERVIEW';
    if (stage === 'HIRED') return ['HIRED', 'REJECTED'].includes(c.stage);
    return false;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hire-text-main">Pipeline Dashboard</h1>
          <p className="text-hire-text-muted text-sm mt-1">Live candidate tracking</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ Post a Job</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs || 0 },
          { label: 'Total Candidates', value: stats.totalCandidates || 0 },
          { label: 'In Assessment', value: (stats.byStage?.ASSESSMENT || 0) + (stats.byStage?.EVALUATING || 0) },
          { label: 'Hired', value: stats.byStage?.HIRED || 0 },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="text-3xl font-bold text-hire-text-main">{s.value}</div>
            <div className="text-sm text-hire-text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="text-center text-hire-text-muted py-16">Loading pipeline…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const cards = getColumn(col.stage);
            return (
              <div key={col.stage} className={`bg-hire-surface/50 border-t-2 ${col.color} rounded-xl`}>
                <div className="p-3 border-b border-hire-border flex items-center justify-between">
                  <span className="font-medium text-sm text-hire-text-main">{col.label}</span>
                  <span className="text-xs bg-hire-surface text-hire-text-muted px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-32">
                  {cards.length === 0
                    ? <div className="text-xs text-hire-text-muted text-center py-4">No candidates</div>
                    : cards.map(c => <CandidateCard key={c.id} candidate={c} />)
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
