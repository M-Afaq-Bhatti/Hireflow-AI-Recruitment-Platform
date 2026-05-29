'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function AssessmentPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/assessments/${token}`)
      .then(r => { setData(r.data); setStatus('idle'); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.error || 'Assessment not found.'); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const answersArray = data.questions.map((q: any, i: number) => ({
      questionId: q.id,
      answer: answers[i] || '',
    }));
    const unanswered = answersArray.filter((a: any) => !a.answer.trim());
    if (unanswered.length > 0) { setMessage('Please answer all questions before submitting.'); return; }

    setStatus('submitting'); setMessage('');
    try {
      const res = await api.post(`/assessments/${token}/submit`, { answers: answersArray });
      setStatus('success');
      setMessage(res.data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Submission failed.');
    }
  };

  if (status === 'loading') return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center">
      <div className="text-hire-text-muted">Loading your assessment…</div>
    </div>
  );

  if (status === 'error' && !data) return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-hire-text-main mb-2">Assessment Unavailable</h2>
        <p className="text-hire-text-muted">{message}</p>
      </div>
    </div>
  );

  if (status === 'success') return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl">✅</div>
        <h1 className="text-2xl font-bold text-hire-text-main">Assessment Submitted!</h1>
        <p className="text-hire-text-muted">{message}</p>
        <div className="card text-left text-sm text-hire-text-muted space-y-2">
          <p>Our AI will now evaluate your answers. If shortlisted, you'll receive an interview invitation by email shortly.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-hire-bg px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-hire-primary/20 border border-hire-primary/40 rounded-full px-4 py-1.5 mb-4">
            <span className="text-hire-primary text-sm">Skills Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-hire-text-main">{data?.jobTitle}</h1>
          <p className="text-hire-text-muted mt-1">Hi {data?.candidateName}, please answer all {data?.questions?.length} questions below.</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-4 py-3 text-sm text-yellow-300">
          ⏱ Take your time — there's no timer. Answer thoughtfully and in detail.
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">{message}</div>
          )}

          {data?.questions?.map((q: any, i: number) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-hire-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-hire-text-main font-medium leading-relaxed">{q.question}</p>
              </div>
              <textarea
                className="input min-h-28 resize-none text-sm"
                placeholder="Type your answer here…"
                value={answers[i] || ''}
                onChange={e => setAnswers(p => ({ ...p, [i]: e.target.value }))}
                rows={4}
              />
              <div className="text-xs text-hire-text-muted text-right">{(answers[i] || '').length} characters</div>
            </div>
          ))}

          <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full py-3 text-base">
            {status === 'submitting' ? 'Submitting…' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </div>
  );
}
