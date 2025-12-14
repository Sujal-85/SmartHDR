import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface ResultCardProps {
  title: string;
  status?: StatusType;
  children: React.ReactNode;
  showCopy?: boolean;
  showDownload?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  className?: string;
  contentClassName?: string;
}

export function ResultCard({
  title,
  status = "idle",
  children,
  showCopy = false,
  showDownload = false,
  onCopy,
  onDownload,
  className,
  contentClassName,
}: ResultCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {(showCopy || showDownload) && status === "success" && (
            <div className="flex items-center gap-1">
              {showCopy && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {showDownload && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
