import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { getFileIcon, getFileExtension } from "@/utils/fileUtils";

const FilePreview = ({ 
  file, 
  preview, 
  className, 
  size = "default",
  ...props 
}) => {
  const sizes = {
    sm: "w-12 h-12",
    default: "w-16 h-16",
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    default: "w-8 h-8", 
    lg: "w-10 h-10"
  };

  const extension = getFileExtension(file.name);
  const iconName = getFileIcon(file.type, extension);

  if (preview) {
    return (
      <div
        className={cn(
          "rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center",
          sizes[size],
          className
        )}
        {...props}
      >
        <img
          src={preview}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center",
        sizes[size],
        className
      )}
      {...props}
    >
      <ApperIcon 
        name={iconName} 
        className={cn("text-gray-600", iconSizes[size])} 
      />
    </div>
  );
};

export default FilePreview;