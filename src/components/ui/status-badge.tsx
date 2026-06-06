import { cn } from "@/lib/utils";
import { statusBadgeTone } from "@/lib/workflow/status-style";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-md px-2.5 py-1 text-xs font-medium leading-5",
        statusBadgeTone(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
