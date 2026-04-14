'use client';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { CandidateResult, JobWeights } from '@/lib/types';
import { scoreColor } from '@/lib/utils';
import ScoreBar from '@/components/ui/ScoreBar';
import { SkillTag } from '@/components/ui/Badge';

interface Props {
  result: CandidateResult;
  weights: JobWeights;
}

const RANK_COLORS = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];

export default function CandidateRankCard({ result, weights }: Props) {
  const [expanded, setExpanded] = useState(result.rank <= 3);
  const { applicant } = result;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        {/* Rank badge */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0 ${result.rank <= 3 ? RANK_COLORS[result.rank - 1] : 'bg-blue-100 text-blue-700'}`}>
          {result.rank <= 3 ? `#${result.rank}` : result.rank}
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{applicant?.name || 'Unknown'}</h3>
            {applicant?.portfolio && (
              <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                <ExternalLinkIcon size={13} />
              </a>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {applicant?.location} &bull; {applicant?.totalExperienceYears}y exp &bull; {applicant?.availability}
          </p>
          {applicant?.skills && (
            <div className="flex flex-wrap gap-1 mt-1">
              {applicant.skills.slice(0, 5).map(s => <SkillTag key={s} skill={s} />)}
              {applicant.skills.length > 5 && <span className="text-xs text-gray-400">+{applicant.skills.length - 5}</span>}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700 ml-2">
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </button>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* Score Breakdown */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Score Breakdown</p>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBar label="Skills" value={result.scoreBreakdown.skills} weight={weights.skills} />
              <ScoreBar label="Experience" value={result.scoreBreakdown.experience} weight={weights.experience} />
              <ScoreBar label="Education" value={result.scoreBreakdown.education} weight={weights.education} />
              <ScoreBar label="Relevance" value={result.scoreBreakdown.relevance} weight={weights.relevance} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <CheckCircleIcon size={12} className="text-green-500" />Strengths
              </p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertCircleIcon size={12} className="text-amber-500" />Gaps / Risks
              </p>
              {result.gaps.length > 0 ? (
                <ul className="space-y-1">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>{g}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No significant gaps identified</p>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">AI Recommendation</p>
            <p className="text-sm text-gray-700">{result.recommendation}</p>
          </div>

          {/* Reasoning (collapsed by default) */}
          {result.geminiReasoning && (
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-600 font-medium">View AI reasoning</summary>
              <p className="mt-2 text-gray-500 leading-relaxed">{result.geminiReasoning}</p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
