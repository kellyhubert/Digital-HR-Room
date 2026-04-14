'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayIcon, BarChart2Icon, MapPinIcon, ClockIcon, GraduationCapIcon, WeightIcon, SparklesIcon, UsersIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/ui/Badge';
import { jobsApi } from '@/lib/api';
import { Job } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.get(jobId).then(res => { setJob(res.data.data); setLoading(false); }).catch(() => router.push('/dashboard'));
  }, [jobId, router]);

  if (loading) return <PageWrapper><div className="animate-pulse h-96 bg-white rounded-xl border border-gray-200" /></PageWrapper>;
  if (!job) return null;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-gray-500 text-sm">{job.department} &bull; {formatDate(job.createdAt)}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Screening results */}
          {(job.status === 'completed' || job.status === 'interviewing' || job.status === 'interview_completed') && (
            <Link href={`/jobs/${job._id}/results`} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              <BarChart2Icon size={14} />Screening Results
            </Link>
          )}
          {/* Launch interview (only when screening is done) */}
          {job.status === 'completed' && (
            <Link href={`/jobs/${job._id}/interview`} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
              <SparklesIcon size={14} />Launch AI Interview
            </Link>
          )}
          {/* Interview in progress */}
          {job.status === 'interviewing' && (
            <Link href={`/jobs/${job._id}/interview-results`} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
              <UsersIcon size={14} />View Interviews
            </Link>
          )}
          {/* Interview completed */}
          {job.status === 'interview_completed' && (
            <Link href={`/jobs/${job._id}/interview-results`} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              <UsersIcon size={14} />Interview Results
            </Link>
          )}
          {/* Screen candidates (not during screening/interviewing/closed) */}
          {!['screening', 'interviewing', 'interview_completed', 'closed'].includes(job.status) && (
            <Link href={`/jobs/${job._id}/screen`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <PlayIcon size={14} />Screen Candidates
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map(s => (
                <span key={s} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-100">{s}</span>
              ))}
            </div>
            {job.preferredSkills.length > 0 && (
              <>
                <h3 className="font-medium text-gray-700 text-sm mt-4 mb-2">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map(s => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600"><MapPinIcon size={14} />{job.location}</div>
              <div className="flex items-center gap-2 text-gray-600"><ClockIcon size={14} />{job.employmentType}</div>
              <div className="flex items-center gap-2 text-gray-600"><GraduationCapIcon size={14} />{job.minExperienceYears}+ years exp</div>
              <div className="flex items-center gap-2 text-gray-600"><WeightIcon size={14} />Top {job.topN} candidates</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Scoring Weights</h3>
            <div className="space-y-2">
              {Object.entries(job.weights).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 capitalize">{k}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${v}%` }} />
                    </div>
                    <span className="font-medium text-gray-800 w-8 text-right">{v}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
