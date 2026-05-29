'use client';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export default function Home() {
  return (
    <>
      <PublicNavbar />
      
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">AI-Powered Recruitment</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Hire smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              3 minutes, not weeks.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            HireFlow's 4-stage AI pipeline screens resumes, generates assessments, evaluates answers,
            and conducts voice interviews — completely autonomously.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3 rounded-xl">
              Get Started Free →
            </Link>
            <Link href="/public/jobs" className="btn-secondary text-lg px-8 py-3 rounded-xl">
              Browse Jobs
            </Link>
          </div>

          {/* Pipeline steps */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📄', title: 'Resume Screen', desc: 'AI scores against JD' },
              { icon: '📝', title: 'Assessment', desc: 'Custom test generated' },
              { icon: '📊', title: 'Evaluation', desc: 'Answers graded by AI' },
              { icon: '🎤', title: 'AI Interview', desc: 'Live voice interview' },
            ].map((step, i) => (
              <div key={i} className="card text-left">
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-sm font-semibold text-white">{step.title}</div>
                <div className="text-xs text-gray-500 mt-1">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
