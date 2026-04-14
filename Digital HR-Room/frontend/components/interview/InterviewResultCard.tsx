'use client';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, UserCheckIcon } from 'lucide-react';
import { InterviewSession } from '@/lib/types';
import { scoreColor } from '@/lib/utils';
import ScoreBar from '@/components/ui/ScoreBar';

interface Props {
  session: InterviewSession;
  rank: number;
  onAdvance: (sessionId: string, advance: boolean) => void;
}

const RANK_COLORS = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];

export default function InterviewResultCard({ session, rank, onAdvance }: Props) {
  const [expanded, setExpanded] = useState(rank <= 3);
  const { applicant, scoreBreakdown } = session;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${session.advancedToFinal ? 'border-green-400 ring-1 ring-green-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        {/* Rank badge */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${rank <= 3 ? `${RANK_COLORS[rank - 1]} text-white` : 'bg-blue-100 text-blue-700'}`}>
          {rank <= 3 ? `#${rank}` : rank}
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{applicant?.name || 'Unknown'}</h3>
            <span className="text-xs text-gray-400">Screening #{session.screeningRank}</span>
            {session.advancedToFinal && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                <UserCheckIcon size={10} />Advanced to Final
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{applicant?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">{applicant?.totalExperienceYears}y exp &bull; {applicant?.skills?.slice(0, 3).join(', ')}</p>
        </div>

        {/* Interview Score */}
        <div className="text-right flex-shrink-0">
          {session.interviewScore !== null ? (
            <>
              <p className={`text-2xl font-bold ${scoreColor(session.interviewScore)}`}>{session.interviewScore}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </>
          ) : (
            <span className="text-sm text-gray-400 italic">Pending</span>
          )}
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700 ml-2">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </button>
      </div>

      {/* Expandable detail */}
      {expanded && session.interviewScore !== null && scoreBreakdown && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* Score Breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interview Score Breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBar label="Communication" value={scoreBreakdown.communication} />
              <ScoreBar label="Technical Depth" value={scoreBreakdown.technicalDepth} />
              <ScoreBar label="Problem Solving" value={scoreBreakdown.problemSolving} />
              <ScoreBar label="Culture Fit" value={scoreBreakdown.cultureFit} />
            </div>
          </div>

          {/* Recommendation */}
          {session.recommendation && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircleIcon size={11} />AI Recommendation
              </p>
              <p className="text-sm text-gray-700">{session.recommendation}</p>
            </div>
          )}

          {/* Reasoning */}
          {session.geminiReasoning && (
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-600 font-medium">View AI reasoning</summary>
              <p className="mt-2 text-gray-500 leading-relaxed">{session.geminiReasoning}</p>
            </details>
          )}

          {/* Advance to Final button */}
          <div className="pt-1">
            <button
              onClick={() => onAdvance(session._id, !session.advancedToFinal)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                session.advancedToFinal
                  ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
              }`}
            >
              <UserCheckIcon size={14} />
              {session.advancedToFinal ? 'Remove from Final Interview' : 'Advance to Final Interview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
