'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import api from '@/lib/api';
import type { Job } from '@/types';

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Fetching public jobs...');
        const { data } = await api.get('/jobs/public');
        console.log('Jobs received:', data);
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PublicNavbar />
      
      <div className="min-h-screen bg-gray-950 pt-12 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Explore open positions and apply now
            </p>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by job title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <svg
                className="absolute right-4 top-3.5 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading open positions...</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No open positions yet
              </h2>
              <p className="text-gray-400">
                Check back soon for exciting opportunities!
              </p>
            </div>
          )}

          {/* No Search Results */}
          {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No jobs match your search
              </h2>
              <p className="text-gray-400 mb-4">
                Try adjusting your search terms
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && filteredJobs.length > 0 && (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="group bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-indigo-500 hover:bg-gray-900/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
                        {job.title}
                      </h2>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        {job.department && (
                          <div className="flex items-center gap-1">
                            <span>📁</span>
                            <span>{job.department}</span>
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salaryMin && job.salaryMax && (
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      {/* Requirements (if available) */}
                      {job.requirements && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">
                            Key Requirements:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements
                              .split(',')
                              .slice(0, 3)
                              .map((req, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-indigo-900/30 text-indigo-300 rounded"
                                >
                                  {req.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Apply Button */}
                    <Link
                      href={`/apply/${job.id}`}
                      className="flex-shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      Apply Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && jobs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400">
                Showing {filteredJobs.length} of {jobs.length} open position
                {jobs.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
