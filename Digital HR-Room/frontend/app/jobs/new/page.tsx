import PageWrapper from '@/components/layout/PageWrapper';
import JobForm from '@/components/jobs/JobForm';

export default function NewJobPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-500 text-sm mt-1">Define the role and scoring criteria for AI-powered screening</p>
        </div>
        <JobForm />
      </div>
    </PageWrapper>
  );
}
