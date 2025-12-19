import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Sparkles } from "lucide-react";
import { CookieConsent } from "@/components/CookieConsent";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:block">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">IntelliScan</span>
          </div>
        </div>
        {/* You can add a user avatar or notifications here if needed */}
      </header>

      <Sidebar />
      <main
        className={cn(
          "ml-0 lg:ml-64 min-h-screen p-4 lg:p-8 transition-all duration-300",
          className
        )}
      >
        <div className="animate-fade-in">{children}</div>
      </main>
      <CookieConsent />
    </div>
  );
}
