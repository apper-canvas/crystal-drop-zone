import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  message = "There's nothing to display right now.",
  action,
  actionText = "Get Started",
  icon = "Inbox",
  className,
  variant = "default",
  ...props 
}) => {
  const variants = {
    default: "min-h-screen bg-gradient-to-br from-gray-50 to-blue-50",
    inline: "min-h-[200px] bg-transparent",
    card: "min-h-[150px] bg-white rounded-lg shadow-card"
  };

  return (
    <div className={cn("flex items-center justify-center p-6", variants[variant], className)} {...props}>
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name={icon} className="w-10 h-10 text-gray-400" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-10 animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {action && (
          <button
            onClick={action}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )}
        
        <div className="text-xs text-gray-400">
          <p>Start by adding some content to see it here.</p>
        </div>
      </div>
    </div>
  );
};

export default Empty;