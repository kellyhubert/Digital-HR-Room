'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, UsersIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import InterviewProgress from '@/components/interview/InterviewProgress';
import { jobsApi, interviewApi, screeningApi } from '@/lib/api';
import { Job, ScreeningResult } from '@/lib/types';

export default function InterviewLaunchPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [launched, setLaunched] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([jobsApi.get(jobId), screeningApi.getResults(jobId)])
      .then(([jRes, sRes]) => {
        const j: Job = jRes.data.data;
        setJob(j);
        setScreening(sRes.data.data);
        // If already interviewing, skip to progress
        if (j.status === 'interviewing') setLaunched(true);
        if (j.status === 'interview_completed') router.push(`/jobs/${jobId}/interview-results`);
        setLoading(false);
      })
      .catch(() => router.push(`/jobs/${jobId}`));
  }, [jobId, router]);

  const handleLaunch = async () => {
    setLaunching(true);
    setError('');
    try {
      await interviewApi.launch(jobId);
      setLaunched(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to launch interviews');
      setLaunching(false);
    }
  };

  if (loading) return <PageWrapper><div className="animate-pulse h-64 bg-white rounded-xl border border-gray-200" /></PageWrapper>;
  if (!job) return null;

  if (launched) {
    return (
      <PageWrapper>
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/jobs/${jobId}`} className="text-gray-400 hover:text-gray-700"><ArrowLeftIcon size={18} /></Link>
          <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <InterviewProgress jobId={jobId} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/jobs/${jobId}`} className="text-gray-400 hover:text-gray-700"><ArrowLeftIcon size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Launch AI Interview</h1>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Job summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">{job.title}</h2>
          <p className="text-sm text-gray-500">{job.department} &bull; {job.location}</p>
        </div>

        {/* Candidate summary */}
        {screening && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Candidates to Interview</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <UsersIcon size={22} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{screening.shortlistedCount}</p>
                <p className="text-sm text-gray-500">shortlisted candidates from screening will receive interview invitations</p>
              </div>
            </div>
          </div>
        )}

        {/* What happens */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 text-sm mb-3">What happens when you launch</h3>
          <ol className="space-y-2 text-sm text-purple-800">
            <li className="flex gap-2"><span className="font-bold flex-shrink-0">1.</span>Gemini generates 5 tailored interview questions for this role</li>
            <li className="flex gap-2"><span className="font-bold flex-shrink-0">2.</span>Each shortlisted candidate receives a unique interview link (valid 7 days)</li>
            <li className="flex gap-2"><span className="font-bold flex-shrink-0">3.</span>Candidates answer the questions at their own pace</li>
            <li className="flex gap-2"><span className="font-bold flex-shrink-0">4.</span>Once submitted, you trigger AI evaluation to rank interview performance</li>
            <li className="flex gap-2"><span className="font-bold flex-shrink-0">5.</span>You select who advances to the in-person final interview</li>
          </ol>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleLaunch}
          disabled={launching}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <SparklesIcon size={16} />
          {launching ? 'Launching...' : 'Launch AI Interviews'}
        </button>
      </div>
    </PageWrapper>
  );
}
