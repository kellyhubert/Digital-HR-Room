import { cn, STATUS_COLORS } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', STATUS_COLORS[status] || 'bg-gray-100 text-gray-600')}>
      {status}
    </span>
  );
}

export function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
      {skill}
    </span>
  );
}
