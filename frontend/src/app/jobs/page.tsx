'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Job } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-hire-text-main">Job Postings</h1>
        <Link href="/jobs/new" className="btn-primary">+ New Job</Link>
      </div>

      {loading ? <div className="text-hire-text-muted">Loading…</div> : (
        <div className="grid gap-4">
          {jobs.length === 0 && (
            <div className="card text-center py-12 text-hire-text-muted">
              No jobs posted yet. <Link href="/jobs/new" className="text-hire-primary hover:underline">Create your first job →</Link>
            </div>
          )}
          {jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div className="card hover:border-hire-primary transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-hire-text-main">{job.title}</h2>
                    <div className="flex gap-3 mt-1 text-sm text-hire-text-muted">
                      {job.department && <span>📁 {job.department}</span>}
                      {job.location && <span>📍 {job.location}</span>}
                    </div>
                    <p className="text-sm text-hire-text-muted mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-hire-primary">{job._count?.candidates || 0}</div>
                    <div className="text-xs text-hire-text-muted">candidates</div>
                    <div className={`mt-2 text-xs px-2 py-0.5 rounded-full ${job.isActive ? 'bg-green-900 text-green-300' : 'bg-hire-surface text-hire-text-muted'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
