'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

type InterviewState = 'loading' | 'ready' | 'connecting' | 'live' | 'question' | 'listening' | 'completed' | 'error';

export default function InterviewRoomPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [state, setState] = useState<InterviewState>('loading');
  const [error, setError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef<string[]>([]);

  useEffect(() => {
    api.get(`/interviews/${token}`)
      .then(r => { setData(r.data); setState('ready'); })
      .catch(err => { setState('error'); setError(err.response?.data?.error || 'Invalid or expired interview link.'); });

    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
    };
  }, [token]);

  const speak = (text: string): Promise<void> => new Promise(resolve => {
    synthRef.current?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => { setSpeaking(false); resolve(); };
    utt.onerror = () => { setSpeaking(false); resolve(); };
    synthRef.current?.speak(utt);
  });

  const startListening = () => new Promise<string>(resolve => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { resolve('Speech recognition not supported in this browser.'); return; }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    setTranscript('');
    setMicActive(true);
    setTimeLeft(60);

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        else interim = event.results[i][0].transcript;
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.start();

    // 60 second countdown per answer
    let seconds = 60;
    timerRef.current = setInterval(() => {
      seconds--;
      setTimeLeft(seconds);
      if (seconds <= 0) { recognition.stop(); }
    }, 1000);

    recognition.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setMicActive(false);
      resolve(finalTranscript || 'No response detected.');
    };
  });

  const runInterview = async () => {
    setState('connecting');
    await speak(`Hello ${data.candidateName}! Welcome to your interview for ${data.jobTitle}. I'm your AI interviewer. We have ${data.questions.length} questions. Please speak clearly after each question. Let's begin.`);
    setState('live');

    const answers: string[] = [];

    for (let i = 0; i < data.questions.length; i++) {
      setCurrentQ(i);
      setState('question');
      await speak(`Question ${i + 1}: ${data.questions[i].question}`);
      setState('listening');
      const answer = await startListening();
      answers.push(answer);
      answersRef.current = answers;
      setAllAnswers([...answers]);

      if (i < data.questions.length - 1) {
        await speak('Thank you. Moving to the next question.');
      }
    }

    setState('completed');
    await speak('Thank you for completing the interview. Your responses have been recorded. You will hear back from us soon. Goodbye!');

    // Save completion
    try {
      await api.post(`/interviews/${token}/complete`, { notes: JSON.stringify(answers), score: null });
    } catch (e) { /* non-fatal */ }
  };

  // UI states
  if (state === 'loading') return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center">
      <div className="text-hire-text-muted">Verifying interview link…</div>
    </div>
  );

  if (state === 'error') return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-hire-text-main mb-2">Interview Unavailable</h2>
        <p className="text-hire-text-muted">{error}</p>
      </div>
    </div>
  );

  if (state === 'completed') return (
    <div className="min-h-screen bg-hire-bg flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="text-6xl">🎤</div>
        <h1 className="text-2xl font-bold text-hire-text-main">Interview Complete!</h1>
        <p className="text-hire-text-muted">Thank you {data?.candidateName}. Your responses have been recorded and will be reviewed.</p>
        <div className="card text-left space-y-3">
          <p className="text-sm font-semibold text-hire-text-main">Your Answers Summary</p>
          {data?.questions?.map((q: any, i: number) => (
            <div key={i} className="border-b border-hire-border pb-3 last:border-0">
              <p className="text-xs text-hire-text-muted mb-1">Q{i+1}: {q.question}</p>
              <p className="text-sm text-hire-text-main italic">"{allAnswers[i] || 'No response'}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-hire-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-hire-primary/20 border border-hire-primary/40 rounded-full px-4 py-1.5 mb-4">
            <div className={`w-2 h-2 rounded-full ${state === 'live' || state === 'question' || state === 'listening' ? 'bg-red-400 animate-pulse' : 'bg-hire-text-muted'}`} />
            <span className="text-hire-primary text-sm">AI Interview Room</span>
          </div>
          <h1 className="text-xl font-bold text-hire-text-main">{data?.jobTitle}</h1>
          <p className="text-hire-text-muted text-sm mt-1">{data?.candidateName}</p>
        </div>

        {/* AI Avatar */}
        <div className="card text-center py-8">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl transition-all duration-300 ${speaking ? 'bg-hire-primary ring-4 ring-hire-primary ring-opacity-50 scale-110' : 'bg-hire-surface'}`}>
            🤖
          </div>
          <div className="text-sm text-hire-text-muted">
            {state === 'ready' && 'Click Start to begin your interview'}
            {state === 'connecting' && 'AI Interviewer is preparing…'}
            {state === 'live' && 'Interview in progress'}
            {state === 'question' && `Asking question ${currentQ + 1} of ${data?.questions?.length}`}
            {state === 'listening' && `Listening… (${timeLeft}s remaining)`}
            {speaking && <span className="text-hire-primary font-medium"> — Speaking…</span>}
          </div>

          {/* Progress */}
          {(state === 'live' || state === 'question' || state === 'listening') && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-hire-text-muted mb-1">
                <span>Question {currentQ + 1}</span>
                <span>{data?.questions?.length} total</span>
              </div>
              <div className="h-1.5 bg-hire-surface rounded-full overflow-hidden">
                <div className="h-full bg-hire-primary rounded-full transition-all"
                  style={{ width: `${((currentQ) / data?.questions?.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Mic / transcript */}
        {state === 'listening' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm text-red-300 font-medium">Recording your answer…</span>
              <span className="ml-auto text-xs text-hire-text-muted">{timeLeft}s left</span>
            </div>
            <p className="text-sm text-hire-text-main min-h-16 italic">
              {transcript || 'Start speaking…'}
            </p>
          </div>
        )}

        {/* Current question display */}
        {(state === 'question' || state === 'listening') && data?.questions?.[currentQ] && (
          <div className="bg-hire-primary/20 border border-hire-primary/40 rounded-xl px-5 py-4">
            <div className="text-xs text-hire-primary font-medium mb-1">Current Question</div>
            <p className="text-hire-text-main">{data.questions[currentQ].question}</p>
          </div>
        )}

        {/* Start button */}
        {state === 'ready' && (
          <div className="space-y-3">
            <div className="bg-hire-surface/50 rounded-lg p-4 text-sm text-hire-text-muted space-y-2">
              <p>📋 <strong className="text-hire-text-main">{data?.questions?.length} questions</strong> — about 10 minutes total</p>
              <p>🎤 Make sure your <strong className="text-hire-text-main">microphone is allowed</strong> in the browser</p>
              <p>🔇 Find a <strong className="text-hire-text-main">quiet place</strong> — the AI listens for 60 seconds per question</p>
            </div>
            <button onClick={runInterview} className="btn-primary w-full py-4 text-lg">
              🎤 Start Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
