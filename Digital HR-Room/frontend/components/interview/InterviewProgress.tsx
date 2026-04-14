'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { interviewApi } from '@/lib/api';
import { SparklesIcon, CheckCircleIcon, XCircleIcon, MailIcon } from 'lucide-react';

interface Props {
  jobId: string;
}

export default function InterviewProgress({ jobId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>('generating');
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');
  const [interviewId, setInterviewId] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => d.length < 3 ? d + '.' : ''), 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await interviewApi.getInterview(jobId);
        const interview = res.data.data;
        setStatus(interview.status);
        setInterviewId(interview._id);
        if (interview.status === 'active' || interview.status === 'completed') {
          clearInterval(poll);
          setTimeout(() => router.push(`/jobs/${jobId}/interview-results`), 1000);
        }
        if (interview.status === 'failed') {
          clearInterval(poll);
          setError(interview.errorMessage || 'Interview launch failed');
        }
      } catch {
        // Still processing, keep polling
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [jobId, router, interviewId]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {(status === 'generating' || status === 'pending') && (
        <>
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <SparklesIcon size={36} className="text-purple-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Interview Questions{dots}</h2>
          <p className="text-gray-500 max-w-md">
            Gemini is crafting tailored interview questions based on the job requirements. Candidate sessions will be created automatically.
          </p>
          <div className="mt-8 w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </>
      )}
      {status === 'active' && (
        <>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <MailIcon size={36} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interviews Launched!</h2>
          <p className="text-gray-500">Redirecting to interview results...</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <XCircleIcon size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Launch Failed</h2>
          <p className="text-red-500 max-w-md">{error}</p>
          <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            Go Back
          </button>
        </>
      )}
    </div>
  );
}
