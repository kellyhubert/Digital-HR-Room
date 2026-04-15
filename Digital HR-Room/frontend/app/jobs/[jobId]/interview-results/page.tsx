'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DownloadIcon, UsersIcon, SparklesIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import InterviewResultCard from '@/components/interview/InterviewResultCard';
import { interviewApi, jobsApi } from '@/lib/api';
import { Interview, InterviewSession, Job } from '@/lib/types';

export default function InterviewResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [jRes, iRes] = await Promise.all([
        jobsApi.get(jobId),
        interviewApi.getInterview(jobId),
      ]);
      const iv: Interview = iRes.data.data;
      setJob(jRes.data.data);
      setInterview(iv);

      if (iv.status !== 'pending' && iv.status !== 'generating') {
        const sRes = await interviewApi.getSessions(jobId, iv._id);
        setSessions(sRes.data.data);
      }
      setLoading(false);
    } catch {
      setError('Failed to load interview data');
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll while evaluating
  useEffect(() => {
    if (!interview || (interview.status !== 'evaluating')) return;
    const poll = setInterval(async () => {
      try {
        const res = await interviewApi.getInterview(jobId);
        const iv: Interview = res.data.data;
        setInterview(iv);
        if (iv.status === 'completed' || iv.status === 'failed') {
          clearInterval(poll);
          if (iv.status === 'completed') {
            const sRes = await interviewApi.getSessions(jobId, iv._id);
            setSessions(sRes.data.data);
          }
        }
      } catch { /* keep polling */ }
    }, 2000);
    return () => clearInterval(poll);
  }, [interview, jobId]);

  const handleEvaluate = async () => {
    if (!interview) return;
    setEvaluating(true);
    setError('');
    try {
      await interviewApi.triggerEvaluation(jobId, interview._id);
      setInterview(prev => prev ? { ...prev, status: 'evaluating' } : prev);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to start evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAdvance = async (sessionId: string, advance: boolean) => {
    if (!interview) return;
    try {
      await interviewApi.advanceCandidate(jobId, interview._id, sessionId, advance);
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, advancedToFinal: advance } : s));
    } catch { /* silent */ }
  };

  if (loading) return <PageWrapper><div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />)}</div></PageWrapper>;
  if (error && !interview) return <PageWrapper><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div></PageWrapper>;
  if (!interview || !job) return null;

  const evaluatedSessions = sessions.filter(s => s.status === 'evaluated').sort((a, b) => (b.interviewScore ?? 0) - (a.interviewScore ?? 0));
  const unevaluatedSessions = sessions.filter(s => s.status !== 'evaluated');
  const canEvaluate = interview.status === 'active' && sessions.some(s => s.status === 'submitted');

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/jobs/${jobId}`} className="text-gray-400 hover:text-gray-700"><ArrowLeftIcon size={18} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Interview Results</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-7">{job.title}</p>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <UsersIcon size={14} className="text-purple-500" />
          <span className="text-gray-600">Invited:</span>
          <span className="font-semibold text-gray-900">{interview.totalInvited}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <UsersIcon size={14} className="text-blue-500" />
          <span className="text-gray-600">Submitted:</span>
          <span className="font-semibold text-gray-900">{interview.totalSubmitted}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
          <UsersIcon size={14} className="text-green-500" />
          <span className="text-gray-600">Evaluated:</span>
          <span className="font-semibold text-gray-900">{interview.totalEvaluated}</span>
        </div>

        <div className="ml-auto flex gap-3">
          {canEvaluate && (
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              <SparklesIcon size={14} />
              {evaluating ? 'Starting...' : 'Evaluate All Submissions'}
            </button>
          )}
          {interview.status === 'completed' && (
            <a
              href={interviewApi.exportCSV(jobId, interview._id)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 font-medium text-gray-700"
            >
              <DownloadIcon size={14} />Export CSV
            </a>
          )}
        </div>
      </div>

      {/* Evaluating state */}
      {interview.status === 'evaluating' && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
          <SparklesIcon size={18} className="text-purple-600 animate-pulse flex-shrink-0" />
          <p className="text-sm text-purple-800 font-medium">Gemini is evaluating all submitted answers. This may take a minute...</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      {/* Ranked evaluated candidates */}
      {evaluatedSessions.length > 0 && (
        <div className="space-y-4 mb-6">
          {evaluatedSessions.map((s, i) => (
            <InterviewResultCard key={s._id} session={s} rank={i + 1} onAdvance={handleAdvance} />
          ))}
        </div>
      )}

      {/* Pending / submitted candidates */}
      {unevaluatedSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Awaiting Submission / Evaluation ({unevaluatedSessions.length})
          </h3>
          <div className="space-y-3">
            {unevaluatedSessions.map(s => (
              <div key={s._id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{s.applicant?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{s.applicant?.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  s.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  s.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  s.status === 'expired' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>{s.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && interview.status === 'active' && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-500">
          <UsersIcon size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Waiting for candidates to complete their interviews</p>
          <p className="text-sm mt-1 text-gray-400">Share the unique interview links with candidates to get started</p>
        </div>
      )}
    </PageWrapper>
  );
}
