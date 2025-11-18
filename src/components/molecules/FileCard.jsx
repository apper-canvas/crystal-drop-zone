import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import FilePreview from "@/components/molecules/FilePreview";
import { formatFileSize, formatUploadSpeed } from "@/utils/fileUtils";

const FileCard = ({ 
  file, 
  onRemove, 
  className, 
  ...props 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-success";
      case "error":
        return "text-error";
      case "uploading":
        return "text-primary";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "CheckCircle";
      case "error":
        return "XCircle";
      case "uploading":
        return "Upload";
      default:
        return "Clock";
    }
  };

  const getProgressVariant = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn("w-full", className)}
      {...props}
    >
      <Card className={cn(
        "p-4 hover:shadow-lg transition-all duration-200",
        file.status === "error" && "border-error border-2 animate-shake"
      )}>
        <div className="flex items-center space-x-4">
          {/* File Preview */}
          <FilePreview 
            file={file} 
            preview={file.preview} 
            size="default"
          />

          {/* File Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
{file.name || file.filename_c}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size || file.size_c)}
                </p>
              </div>

              {/* Status Icon */}
              <div className="flex items-center space-x-2 ml-2">
                <ApperIcon 
                  name={getStatusIcon(file.status)} 
                  className={cn("w-5 h-5", getStatusColor(file.status))}
                />
                {onRemove && file.status !== "uploading" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(file.id)}
                    className="p-1 min-h-[32px] w-8 h-8 text-gray-400 hover:text-error hover:bg-red-50"
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {(file.status === "uploading" || file.status === "success") && (
              <div className="space-y-1">
                <ProgressBar
                  value={file.progress || 0}
                  variant={getProgressVariant(file.status)}
                  showShimmer={file.status === "uploading"}
                  className="h-2"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {file.progress || 0}% completed
                  </span>
                  {file.status === "uploading" && file.uploadSpeed && (
                    <span className="text-gray-500">
                      {formatUploadSpeed(file.uploadSpeed)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {file.status === "error" && file.error && (
              <div className="flex items-center space-x-1">
                <ApperIcon name="AlertCircle" className="w-4 h-4 text-error" />
                <p className="text-xs text-error">{file.error}</p>
              </div>
            )}

            {/* Success Message */}
            {file.status === "success" && (
              <div className="flex items-center space-x-1">
                <ApperIcon name="CheckCircle" className="w-4 h-4 text-success" />
                <p className="text-xs text-success">Upload completed successfully</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FileCard;