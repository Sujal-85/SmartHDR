import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Clock, Upload } from "lucide-react";

export type StatusType = "idle" | "uploading" | "processing" | "success" | "error";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; icon: React.ElementType; className: string }> = {
  idle: {
    label: "Ready",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  uploading: {
    label: "Uploading",
    icon: Upload,
    className: "bg-primary/10 text-primary",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-accent/10 text-accent",
  },
  success: {
    label: "Complete",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  error: {
    label: "Error",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimated = status === "processing" || status === "uploading";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", isAnimated && "animate-spin-slow")} />
      <span>{config.label}</span>
    </div>
  );
}
