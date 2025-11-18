import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading this content.",
  onRetry,
  className,
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "min-h-screen bg-gradient-to-br from-red-50 to-pink-50",
    inline: "min-h-[200px] bg-transparent",
    card: "min-h-[150px] bg-white rounded-lg shadow-card"
  };

  return (
    <div className={cn("flex items-center justify-center p-6", variants[variant], className)} {...props}>
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-error to-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
            <ApperIcon name="AlertTriangle" className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-error to-accent rounded-full opacity-20 animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-error to-accent bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-error to-accent text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
        
        <div className="text-xs text-gray-400 space-y-1">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;