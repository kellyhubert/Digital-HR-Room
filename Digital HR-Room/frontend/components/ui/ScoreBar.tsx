import { scoreBg } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  value: number;
  weight?: number;
}

export default function ScoreBar({ label, value, weight }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">
          {label}{weight !== undefined ? ` (${weight}% weight)` : ''}
        </span>
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
      <div className="score-bar">
        <div
          className={`score-bar-fill ${scoreBg(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
