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
  INTERVIEW_EVALUATING: 'bg-indigo-900 text-indigo-200', FINAL_REVIEW: 'bg-cyan-900 text-cyan-200',
  HIRED: 'bg-green-900 text-green-200', REJECTED: 'bg-red-900 text-red-200',
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get(`/candidates/${id}`).then(r => setCandidate(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleHRDecision = async (decision: 'HIRED' | 'REJECTED') => {
    if (!candidate) return;
    setActionLoading(true);
    try {
      const result = await api.post(`/candidates/${candidate.id}/hr-decision`, { decision });
      setCandidate(result.data);
      alert(`Candidate marked as ${decision}`);
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-hire-text-muted">Loading…</div>;
  if (!candidate) return <div className="p-6 text-red-400">Candidate not found</div>;

  const screening = candidate.screeningData;
  const evaluation = candidate.evaluation;
  const assessment = candidate.assessment;
  const interviewReview = candidate.interviewReview;

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

      {/* Final Review Stage with HR Decision */}
      {candidate.stage === 'FINAL_REVIEW' && candidate.finalScore != null && (
        <div className="card border-2 border-cyan-500/50 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-hire-text-main">🎯 Final Review — Ready for HR Decision</h2>
            <ScoreBar label="Final Composite Score" score={candidate.finalScore} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-hire-text-muted font-medium mb-1">Score Breakdown</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Resume:</span><span className="font-medium text-hire-text-main">{Math.round(candidate.screeningScore || 0)}/100</span></div>
                <div className="flex justify-between"><span>Skills Assessment:</span><span className="font-medium text-hire-text-main">{Math.round(evaluation?.totalScore || 0)}/100</span></div>
                <div className="flex justify-between"><span>Interview:</span><span className="font-medium text-hire-text-main">{Math.round(candidate.interviewScore || 0)}/100</span></div>
              </div>
            </div>
          </div>

          {/* HR Decision Buttons */}
          {candidate.hrDecision === 'PENDING' && (
            <div className="border-t border-hire-border pt-4">
              <p className="text-sm text-hire-text-muted mb-3">Make an HR Decision:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleHRDecision('HIRED')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {actionLoading ? '⏳ Processing...' : '✅ Hire Candidate'}
                </button>
                <button
                  onClick={() => handleHRDecision('REJECTED')}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {actionLoading ? '⏳ Processing...' : '❌ Reject Candidate'}
                </button>
              </div>
            </div>
          )}

          {candidate.hrDecision && candidate.hrDecision !== 'PENDING' && (
            <div className={`border-t border-hire-border pt-4 ${candidate.hrDecision === 'HIRED' ? 'bg-green-900/20' : 'bg-red-900/20'} p-3 rounded-lg`}>
              <p className="text-sm font-medium">
                {candidate.hrDecision === 'HIRED' 
                  ? '✅ Candidate has been HIRED and notification email sent' 
                  : '❌ Candidate has been REJECTED and notification email sent'}
              </p>
            </div>
          )}
        </div>
      )}

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
        <Section title="Agent 2 — Skills Assessment">
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
        <Section title="Agent 3 — Skills Evaluation">
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
          <div className="text-sm text-hire-text-muted">Interview completed.</div>
          {candidate.interviewScore != null && (
            <ScoreBar label="Interview Score" score={candidate.interviewScore} />
          )}
        </Section>
      )}

      {/* Interview Review */}
      {interviewReview && (
        <Section title="Agent 5 — Interview Analysis">
          <ScoreBar label="Interview Score" score={interviewReview.score} />
          <p className="text-sm text-hire-text-muted mt-2">{interviewReview.summary}</p>
          <div className="grid md:grid-cols-3 gap-3 mt-2 text-sm">
            {interviewReview.communicationScore != null && (
              <div className="bg-hire-surface rounded p-2">
                <div className="text-xs text-hire-text-muted">Communication</div>
                <div className="font-bold text-hire-text-main">{Math.round(interviewReview.communicationScore)}/100</div>
              </div>
            )}
            {interviewReview.technicalScore != null && (
              <div className="bg-hire-surface rounded p-2">
                <div className="text-xs text-hire-text-muted">Technical</div>
                <div className="font-bold text-hire-text-main">{Math.round(interviewReview.technicalScore)}/100</div>
              </div>
            )}
            {interviewReview.professionalism != null && (
              <div className="bg-hire-surface rounded p-2">
                <div className="text-xs text-hire-text-muted">Professionalism</div>
                <div className="font-bold text-hire-text-main">{Math.round(interviewReview.professionalism)}/100</div>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {interviewReview.strengths?.length > 0 && (
              <div>
                <div className="text-xs text-green-400 font-medium mb-2">Strengths</div>
                <ul className="space-y-1">{interviewReview.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-green-500">✓</span>{s}</li>
                ))}</ul>
              </div>
            )}
            {interviewReview.weaknesses?.length > 0 && (
              <div>
                <div className="text-xs text-red-400 font-medium mb-2">Areas for Growth</div>
                <ul className="space-y-1">{interviewReview.weaknesses.map((s, i) => (
                  <li key={i} className="text-sm text-hire-text-muted flex gap-2"><span className="text-red-500">△</span>{s}</li>
                ))}</ul>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
