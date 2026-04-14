'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { screeningApi } from '@/lib/api';
import { SparklesIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface Props {
  jobId: string;
}

export default function ScreeningProgress({ jobId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>('processing');
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => d.length < 3 ? d + '.' : ''), 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await screeningApi.getResults(jobId);
        const result = res.data.data;
        setStatus(result.status);
        if (result.status === 'completed') {
          clearInterval(poll);
          setTimeout(() => router.push(`/jobs/${jobId}/results`), 1000);
        }
        if (result.status === 'failed') {
          clearInterval(poll);
          setError(result.errorMessage || 'Screening failed');
        }
      } catch {
        // Still processing, keep polling
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [jobId, router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {status === 'processing' && (
        <>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <SparklesIcon size={36} className="text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Screening in Progress{dots}</h2>
          <p className="text-gray-500 max-w-md">
            Gemini is analyzing all candidates against the job requirements. This usually takes 15–60 seconds.
          </p>
          <div className="mt-8 w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </>
      )}
      {status === 'completed' && (
        <>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon size={36} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Screening Complete!</h2>
          <p className="text-gray-500">Redirecting to results...</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <XCircleIcon size={36} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Screening Failed</h2>
          <p className="text-red-500 max-w-md">{error}</p>
          <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            Go Back
          </button>
        </>
      )}
    </div>
  );
}
