import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "ml-16 lg:ml-64 min-h-screen p-6 lg:p-8 transition-all duration-300",
          className
        )}
      >
        <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
