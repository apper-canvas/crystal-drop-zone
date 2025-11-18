import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const DropZone = ({ 
  onFilesSelected, 
  acceptedTypes = [], 
  maxFileSize = Infinity, 
  maxFiles = Infinity,
  allowMultiple = true,
  className,
  ...props 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFiles = (files) => {
    if (!allowMultiple && files.length > 1) {
      files = files.slice(0, 1);
    }

    if (maxFiles < Infinity && files.length > maxFiles) {
      files = files.slice(0, maxFiles);
    }

    if (onFilesSelected) {
      onFilesSelected(files);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const acceptString = acceptedTypes.length > 0 ? acceptedTypes.join(",") : "";

  return (
    <motion.div
      className={cn("w-full", className)}
      {...props}
    >
      <motion.div
        className={cn(
          "relative border-3 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center p-12 min-h-[300px]",
          "hover:border-primary hover:bg-purple-50/50 hover:scale-[1.02]",
          isDragging
            ? "border-primary bg-purple-100/80 scale-[1.02]"
            : "border-gray-300 bg-gray-50/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-xl pointer-events-none"></div>
        
        {/* Upload Icon */}
        <motion.div
          className={cn(
            "mb-6 p-6 rounded-full transition-all duration-200",
            isDragging
              ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
              : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500"
          )}
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <ApperIcon 
            name="Upload" 
            className={cn(
              "transition-all duration-200",
              isDragging ? "w-12 h-12" : "w-10 h-10"
            )} 
          />
        </motion.div>

        {/* Main Message */}
        <div className="text-center space-y-3 mb-6">
          <h3 className={cn(
            "text-xl font-semibold transition-all duration-200",
            isDragging
              ? "text-primary"
              : "text-gray-900"
          )}>
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </h3>
          <p className="text-gray-600 text-base">
            or click to browse your computer
          </p>
        </div>

        {/* Browse Button */}
        <Button
          variant="primary"
          size="lg"
          className="mb-6 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          <ApperIcon name="FolderOpen" className="w-5 h-5 mr-2" />
          Browse Files
        </Button>

        {/* File Requirements */}
        <div className="text-center space-y-2 text-sm text-gray-500">
          {acceptedTypes.length > 0 && (
            <p>
              Accepted types: {acceptedTypes.join(", ")}
            </p>
          )}
          {maxFileSize !== Infinity && (
            <p>
              Maximum file size: {Math.floor(maxFileSize / (1024 * 1024))}MB
            </p>
          )}
          {maxFiles !== Infinity && (
            <p>
              Maximum {maxFiles} {maxFiles === 1 ? "file" : "files"} allowed
            </p>
          )}
        </div>
      </motion.div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple={allowMultiple}
        onChange={handleFileInput}
        className="hidden file-input"
        aria-label="File upload input"
      />
    </motion.div>
  );
};

export default DropZone;