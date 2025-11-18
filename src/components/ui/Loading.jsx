import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100",
    inline: "min-h-[200px] bg-transparent",
    card: "min-h-[150px] bg-white rounded-lg shadow-card"
  };

  return (
    <div className={cn("flex items-center justify-center", variants[variant], className)} {...props}>
      <div className="text-center space-y-4">
        <div className="relative">
          <svg 
            className="animate-spin h-12 w-12 text-primary mx-auto" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Loading...</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;