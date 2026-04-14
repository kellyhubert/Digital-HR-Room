'use client';
import Link from 'next/link';
import { MapPinIcon, ClockIcon, UsersIcon, PlayIcon } from 'lucide-react';
import { Job } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.department}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1"><MapPinIcon size={12} />{job.location}</span>
        <span className="flex items-center gap-1"><ClockIcon size={12} />{job.employmentType}</span>
        <span className="flex items-center gap-1"><UsersIcon size={12} />Top {job.topN}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.requiredSkills.slice(0, 4).map(s => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
        ))}
        {job.requiredSkills.length > 4 && (
          <span className="text-xs text-gray-400">+{job.requiredSkills.length - 4} more</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
        <div className="flex gap-2">
          <Link
            href={`/jobs/${job._id}`}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View
          </Link>
          {job.status !== 'screening' && job.status !== 'closed' && (
            <Link
              href={`/jobs/${job._id}/screen`}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-medium"
            >
              <PlayIcon size={10} />Screen
            </Link>
          )}
          {job.status === 'completed' && (
            <Link
              href={`/jobs/${job._id}/results`}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-medium"
            >
              Results
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
