'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import JobCard from '@/components/jobs/JobCard';
import { jobsApi } from '@/lib/api';
import { Job } from '@/lib/types';

const STATUS_TABS = ['all', 'active', 'screening', 'completed', 'draft', 'closed'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeTab !== 'all') params.status = activeTab;
    jobsApi.list(params).then(res => { setJobs(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [activeTab]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Link href="/jobs/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <PlusIcon size={14} />Post a Job
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setLoading(true); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500">No jobs found for <strong>{activeTab}</strong></p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </PageWrapper>
  );
}
