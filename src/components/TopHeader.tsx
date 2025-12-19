import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

interface TopHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TopHeader({ title, description, children, className }: TopHeaderProps) {
  return (
    <header className={cn("pb-6 border-b border-border mb-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
