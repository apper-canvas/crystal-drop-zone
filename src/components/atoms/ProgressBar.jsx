import React from "react";
import { cn } from "@/utils/cn";

const ProgressBar = React.forwardRef(({ 
  className, 
  value = 0, 
  max = 100, 
  variant = "default",
  showShimmer = false,
  ...props 
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variants = {
    default: "bg-gradient-to-r from-primary to-secondary",
    success: "bg-gradient-to-r from-success to-green-400",
    error: "bg-gradient-to-r from-error to-red-400",
    warning: "bg-gradient-to-r from-warning to-yellow-400"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-full bg-gray-200 rounded-full h-2 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full relative",
          variants[variant],
          showShimmer && "progress-shimmer"
        )}
        style={{ width: `${percentage}%` }}
      >
        {showShimmer && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        )}
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;