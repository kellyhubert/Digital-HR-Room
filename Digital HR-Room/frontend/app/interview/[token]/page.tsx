'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { interviewApi } from '@/lib/api';
import { InterviewQuestion } from '@/lib/types';
import { CheckCircleIcon, ChevronRightIcon, SparklesIcon } from 'lucide-react';

type SessionData = {
  sessionId: string;
  status: string;
  candidateName: string;
  jobTitle: string;
  jobDepartment: string;
  questions: InterviewQuestion[];
  tokenExpiresAt: string;
};

type State = 'loading' | 'answering' | 'submitting' | 'submitted' | 'expired' | 'error';

export default function CandidateInterviewPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    interviewApi.getCandidateSession(token)
      .then(res => {
        const data: SessionData = res.data.data;
        setSession(data);
        if (data.status === 'submitted' || data.status === 'evaluated') {
          setState('submitted');
        } else if (data.status === 'expired') {
          setState('expired');
        } else {
          setState('answering');
        }
      })
      .catch(e => {
        if (e?.response?.status === 410) {
          setState('expired');
        } else {
          setErrorMsg(e?.response?.data?.error || 'Failed to load interview');
          setState('error');
        }
      });
  }, [token]);

  const handleNext = () => {
    if (session && currentQ < session.questions.length - 1) {
      setCurrentQ(q => q + 1);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setState('submitting');
    try {
      const responses = session.questions.map(q => ({
        questionId: q.questionId,
        answerText: answers[q.questionId] || '',
      }));
      await interviewApi.submitResponses(token, responses);
      setState('submitted');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setErrorMsg(err?.response?.data?.error || 'Submission failed. Please try again.');
      setState('answering');
    }
  };

  const currentAnswer = session ? (answers[session.questions[currentQ]?.questionId] || '') : '';
  const isLastQuestion = session ? currentQ === session.questions.length - 1 : false;
  const allAnswered = session ? session.questions.every(q => (answers[q.questionId] || '').trim().length > 0) : false;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SparklesIcon size={36} className="text-purple-600 animate-pulse" />
          <p className="text-gray-500">Loading your interview...</p>
        </div>
      </div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────────
  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Interview Link Expired</h1>
          <p className="text-gray-500 text-sm">This interview link is no longer valid. Please contact the recruiter if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 p-10 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // ── Submitted ────────────────────────────────────────────────────────────────
  if (state === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={36} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Interview Submitted!</h1>
          <p className="text-gray-500 text-sm">
            Thank you{session?.candidateName ? `, ${session.candidateName.split(' ')[0]}` : ''}! Your responses have been recorded.
            The recruitment team will be in touch regarding next steps.
          </p>
        </div>
      </div>
    );
  }

  // ── Answering ────────────────────────────────────────────────────────────────
  if (!session) return null;
  const question = session.questions[currentQ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{session.jobTitle}</p>
            <p className="text-xs text-gray-400">{session.jobDepartment} &bull; AI Interview</p>
          </div>
          <div className="flex items-center gap-2">
            <SparklesIcon size={14} className="text-purple-500" />
            <span className="text-xs text-gray-500">Powered by Gemini</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Greeting */}
        <p className="text-gray-500 text-sm mb-6">
          Hello{session.candidateName ? `, ${session.candidateName.split(' ')[0]}` : ''}! Please answer all questions thoughtfully. Take your time.
        </p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Question {currentQ + 1} of {session.questions.length}</span>
            <span>{Math.round(((currentQ + 1) / session.questions.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / session.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full capitalize">
              {question.category}
            </span>
            <span className="text-xs text-gray-400">Q{currentQ + 1}</span>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed mb-5">{question.text}</p>
          <textarea
            value={currentAnswer}
            onChange={e => setAnswers(prev => ({ ...prev, [question.questionId]: e.target.value }))}
            placeholder="Type your answer here..."
            rows={7}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Question nav dots */}
        <div className="flex justify-center gap-2 mb-6">
          {session.questions.map((q, i) => (
            <button
              key={q.questionId}
              onClick={() => setCurrentQ(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentQ ? 'bg-purple-600' :
                (answers[q.questionId] || '').trim() ? 'bg-purple-300' :
                'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || state === 'submitting'}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon size={14} />
              {state === 'submitting' ? 'Submitting...' : 'Submit Interview'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
            >
              Next <ChevronRightIcon size={14} />
            </button>
          )}
        </div>

        {!allAnswered && isLastQuestion && (
          <p className="text-center text-xs text-amber-600 mt-3">Please answer all questions before submitting.</p>
        )}

        {errorMsg && (
          <p className="text-center text-xs text-red-600 mt-3">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
