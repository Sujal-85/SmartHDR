import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  gradient?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, isLoading, loadingText, gradient = false, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative font-medium transition-all duration-200",
          gradient && "gradient-bg text-primary-foreground hover:opacity-90 shadow-glow",
          !gradient && "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Processing..."}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export { PrimaryButton };
