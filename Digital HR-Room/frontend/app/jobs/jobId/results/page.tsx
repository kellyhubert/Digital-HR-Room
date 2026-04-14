'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DownloadIcon, ClockIcon, UsersIcon, CpuIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import CandidateRankCard from '@/components/results/CandidateRankCard';
import { screeningApi, jobsApi } from '@/lib/api';
import { ScreeningResult, Job } from '@/lib/types';
import { formatMs } from '@/lib/utils';

export default function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      screeningApi.getResults(jobId),
      jobsApi.get(jobId),
    ]).then(([sRes, jRes]) => {
      setResult(sRes.data.data);
      setJob(jRes.data.data);
      setLoading(false);
    }).catch(e => {
      setError(e?.response?.data?.error || 'Failed to load results');
      setLoading(false);
    });
  }, [jobId]);

  if (loading) return <PageWrapper><div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200" />)}</div></PageWrapper>;
  if (error) return <PageWrapper><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div></PageWrapper>;
  if (!result || !job) return null;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/jobs/${jobId}`} className="text-gray-400 hover:text-gray-700"><ArrowLeftIcon size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Screening Results</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-7">{job.title}</p>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <UsersIcon size={14} className="text-blue-500" />
          <span className="text-gray-600">Evaluated:</span>
          <span className="font-semibold text-gray-900">{result.totalCandidatesEvaluated}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <UsersIcon size={14} className="text-green-500" />
          <span className="text-gray-600">Shortlisted:</span>
          <span className="font-semibold text-gray-900">{result.shortlistedCount}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <ClockIcon size={14} className="text-gray-400" />
          <span className="text-gray-600">Processing:</span>
          <span className="font-semibold text-gray-900">{formatMs(result.processingTimeMs)}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <CpuIcon size={14} className="text-purple-500" />
          <span className="text-gray-600">Model:</span>
          <span className="font-semibold text-gray-900">{result.geminiModel}</span>
        </div>
        <a
          href={screeningApi.exportCSV(jobId, result._id)}
          className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 font-medium text-gray-700"
        >
          <DownloadIcon size={14} />Export CSV
        </a>
      </div>

      {/* Candidates */}
      {result.results.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-500">
          No results available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {result.results.map(r => (
            <CandidateRankCard key={r.applicantId} result={r} weights={job.weights} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
