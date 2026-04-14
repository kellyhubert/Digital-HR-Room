'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, BriefcaseIcon, UsersIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import JobCard from '@/components/jobs/JobCard';
import { jobsApi } from '@/lib/api';
import { Job } from '@/lib/types';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.list().then(res => {
      setJobs(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active' || j.status === 'screening').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered candidate screening at a glance</p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <PlusIcon size={16} />Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg"><BriefcaseIcon size={18} className="text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-2.5 rounded-lg"><SparklesIcon size={18} className="text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active / Screening</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-lg"><CheckCircleIcon size={18} className="text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Screened</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Job Postings</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <UsersIcon size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No jobs yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first job posting to start screening candidates</p>
          <Link href="/jobs/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <PlusIcon size={14} />Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </PageWrapper>
  );
}
