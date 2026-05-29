'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { Candidate } from '@/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-hire-text-main text-sm uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-hire-text-muted">{label}</span>
        <span className="text-hire-text-main font-medium">{Math.round(score)}/{max}</span>
      </div>
      <div className="h-1.5 bg-hire-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STAGE_COLOR: Record<string, string> = {
  APPLIED: 'bg-gray-700 text-gray-200', SCREENING: 'bg-blue-900 text-blue-200',
  SCREENED_OUT: 'bg-red-900 text-red-200', ASSESSMENT: 'bg-yellow-900 text-yellow-200',
  EVALUATING: 'bg-orange-900 text-orange-200', INTERVIEW: 'bg-purple-900 text-purple-200',
  HIRED: 'bg-green-900 text-green-200', REJECTED: 'bg-red-900 text-red-200',
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/candidates/${id}`).then(r => setCandidate(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-hire-text-muted">Loading…</div>;
  if (!candidate) return <div className="p-6 text-red-400">Candidate not found</div>;

  const screening = candidate.screeningData;
  const evaluation = candidate.evaluation;
  const assessment = candidate.assessment;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/candidates" className="text-hire-text-muted hover:text-hire-text-main text-sm">← Candidates</Link>
          <h1 className="text-2xl font-bold text-hire-text-main mt-1">{candidate.name}</h1>
          <div className="flex gap-3 text-sm text-hire-text-muted mt-1">
            <span>✉️ {candidate.email}</span>
            {candidate.phone && <span>📞 {candidate.phone}</span>}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STAGE_COLOR[candidate.stage]}`}>
          {candidate.stage.replace('_', ' ')}
        </span>
      </div>

      {/* Job */}
      <Section title="Applied For">
        <div className="text-hire-text-main">{(candidate as any).job?.title || 'Unknown job'}</div>
        <div className="text-xs text-hire-text-muted">Applied {new Date(candidate.createdAt).toLocaleDateString()}</div>
      </Section>

      {/* Screening */}
      {screening && (
        <Section title="Agent 1 — Resume Screening">
          <ScoreBar label="Screening Score" score={candidate.screeningScore || 0} />
          <p className="text-sm text-hire-text-muted">{screening.reasoning}</p>
          {screening.strengths?.length > 0 && (
            <div>
              <div className="text-xs text-green-400 font-medium mb-1">Strengths</div>
              <ul className="space-y-1">{screening.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-green-500">✓</span>{s}</li>
              ))}</ul>
            </div>
          )}
          {screening.concerns?.length > 0 && (
            <div>
              <div className="text-xs text-red-400 font-medium mb-1">Concerns</div>
              <ul className="space-y-1">{screening.concerns.map((s: string, i: number) => (
                <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-red-500">✗</span>{s}</li>
              ))}</ul>
            </div>
          )}
        </Section>
      )}

      {/* Assessment */}
      {assessment && (
        <Section title="Agent 2 — Assessment">
          <div className="text-sm text-hire-text-muted">
            {assessment.submitted
              ? `✅ Submitted on ${assessment.submittedAt ? new Date(assessment.submittedAt as any).toLocaleDateString() : 'unknown date'}`
              : `⏳ Awaiting submission — Token: ${assessment.token}`}
          </div>
          {assessment.questions && (
            <div className="space-y-3 mt-2">
              {(assessment.questions as any[]).map((q: any, i: number) => {
                const answer = assessment.answers ? (assessment.answers as any[])[i] : null;
                return (
                  <div key={i} className="bg-hire-surface rounded-lg p-3">
                    <div className="text-sm font-medium text-hire-text-main">Q{i+1}: {q.question}</div>
                    {answer && <div className="text-sm text-hire-text-muted mt-1 italic">"{answer.answer}"</div>}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* Evaluation */}
      {evaluation && (
        <Section title="Agent 3 — Evaluation Report">
          <ScoreBar label="Total Evaluation Score" score={evaluation.totalScore} />
          <p className="text-sm text-hire-text-muted mt-2">{evaluation.summary}</p>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {evaluation.strengths?.length > 0 && (
              <div>
                <div className="text-xs text-green-400 font-medium mb-2">Strengths</div>
                <ul className="space-y-1">{evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-green-500">✓</span>{s}</li>
                ))}</ul>
              </div>
            )}
            {evaluation.weaknesses?.length > 0 && (
              <div>
                <div className="text-xs text-red-400 font-medium mb-2">Areas to Improve</div>
                <ul className="space-y-1">{evaluation.weaknesses.map((s, i) => (
                  <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-red-500">△</span>{s}</li>
                ))}</ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Interview */}
      {candidate.interviewToken && (
        <Section title="Agent 4 — Interview">
          <div className="text-sm text-hire-text-muted">Interview link generated.</div>
          {candidate.interviewScore != null && (
            <ScoreBar label="Interview Score" score={candidate.interviewScore} />
          )}
          <a href={`/interview/${candidate.interviewToken}`} target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm inline-block mt-2">
            Open Interview Room →
          </a>
        </Section>
      )}
    </div>
  );
}
