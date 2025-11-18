import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import DropZone from "@/components/molecules/DropZone";
import FileCard from "@/components/molecules/FileCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { generateFileId, createFilePreview, validateFileType, validateFileSize, formatFileSize } from "@/utils/fileUtils";
import { getUploadConfig, uploadMultipleFiles } from "@/services/api/uploadService";

const FileUploader = () => {
  const [uploadConfig, setUploadConfig] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load upload configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await getUploadConfig();
      setUploadConfig(config);
    } catch (err) {
      setError(err.message || "Failed to load upload configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = async (selectedFiles) => {
    if (!uploadConfig) return;

    const validFiles = [];
    const invalidFiles = [];

    for (const file of selectedFiles) {
      const fileId = generateFileId();
      
      // Validate file type
      if (!validateFileType(file, uploadConfig.acceptedTypes)) {
        invalidFiles.push({
          name: file.name,
          error: `File type not supported. Accepted types: ${uploadConfig.acceptedTypes.join(", ")}`
        });
        continue;
      }

      // Validate file size
      if (!validateFileSize(file, uploadConfig.maxFileSize)) {
        invalidFiles.push({
          name: file.name,
          error: `File too large. Maximum size: ${formatFileSize(uploadConfig.maxFileSize)}`
        });
        continue;
      }

      // Create file preview
      const preview = await createFilePreview(file);

      validFiles.push({
        id: fileId,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: preview,
        progress: 0,
        status: "pending",
        error: null,
        uploadSpeed: 0,
        timestamp: Date.now()
      });
    }

    // Check total file limit
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > uploadConfig.maxFiles) {
      const allowedFiles = uploadConfig.maxFiles - files.length;
      if (allowedFiles > 0) {
        validFiles.splice(allowedFiles);
        toast.warning(`Only ${allowedFiles} more files can be added. Maximum ${uploadConfig.maxFiles} files allowed.`);
      } else {
        toast.error(`Maximum ${uploadConfig.maxFiles} files allowed. Please remove some files first.`);
        return;
      }
    }

    // Show validation errors
    invalidFiles.forEach(file => {
      toast.error(`${file.name}: ${file.error}`);
    });

    // Add valid files to the list
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added successfully`);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info("File removed from upload queue");
  };

  const handleStartUpload = async () => {
    const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error");
    
    if (pendingFiles.length === 0) {
      toast.warning("No files to upload");
      return;
    }

    setIsUploading(true);

    try {
      // Update all pending files to uploading status
      setFiles(prev => prev.map(f => 
        pendingFiles.find(pf => pf.id === f.id) 
          ? { ...f, status: "uploading", progress: 0, error: null }
          : f
      ));

      await uploadMultipleFiles(
        pendingFiles,
        // Progress callback
        (fileId, progress, speed) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, progress, uploadSpeed: speed }
              : f
          ));
        },
        // File complete callback
        (fileId, success, result) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: success ? "success" : "error",
                  error: success ? null : result,
                  progress: success ? 100 : f.progress,
                  uploadSpeed: 0
                }
              : f
          ));

          if (success) {
            toast.success(`${files.find(f => f.id === fileId)?.name} uploaded successfully`);
          } else {
            toast.error(`Failed to upload ${files.find(f => f.id === fileId)?.name}: ${result}`);
          }
        }
      );

      const successCount = files.filter(f => f.status === "success").length;
      toast.success(`Upload completed! ${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully.`);

    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearCompleted = () => {
    const completedCount = files.filter(f => f.status === "success").length;
    setFiles(prev => prev.filter(f => f.status !== "success"));
    toast.info(`${completedCount} completed file${completedCount > 1 ? 's' : ''} removed`);
  };

  const handleClearAll = () => {
    const fileCount = files.length;
    setFiles([]);
    toast.info(`${fileCount} file${fileCount > 1 ? 's' : ''} removed from queue`);
  };

  // Loading state
  if (loading) {
    return <Loading variant="default" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorView
        title="Configuration Error"
        message={error}
        onRetry={loadConfig}
        variant="default"
      />
    );
  }

  const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error");
  const uploadingFiles = files.filter(f => f.status === "uploading");
  const completedFiles = files.filter(f => f.status === "success");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl">
              <ApperIcon name="Upload" className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-secondary bg-clip-text text-transparent">
              Drop Zone
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your files with confidence. Drag and drop, track progress in real-time, and get instant feedback.
          </p>
        </div>

        {/* Drop Zone */}
        <DropZone
          onFilesSelected={handleFilesSelected}
          acceptedTypes={uploadConfig?.acceptedTypes || []}
          maxFileSize={uploadConfig?.maxFileSize || Infinity}
          maxFiles={uploadConfig?.maxFiles || Infinity}
          allowMultiple={uploadConfig?.allowMultiple !== false}
        />

        {/* Upload Queue */}
        {files.length > 0 && (
          <Card className="p-6 space-y-6">
            {/* Queue Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Upload Queue</h2>
                <p className="text-sm text-gray-600">
                  {files.length} file{files.length > 1 ? 's' : ''} • 
                  {pendingFiles.length > 0 && ` ${pendingFiles.length} pending`}
                  {uploadingFiles.length > 0 && ` • ${uploadingFiles.length} uploading`}
                  {completedFiles.length > 0 && ` • ${completedFiles.length} completed`}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {completedFiles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCompleted}
                    disabled={isUploading}
                  >
                    <ApperIcon name="CheckCheck" className="w-4 h-4 mr-2" />
                    Clear Completed
                  </Button>
                )}
                
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Clear All
                </Button>

                {pendingFiles.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={handleStartUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
                        Upload {pendingFiles.length} File{pendingFiles.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* File List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {files.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRemove={!isUploading ? handleRemoveFile : undefined}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-12">
            <Empty
              title="No files selected"
              message="Start by dragging files into the drop zone above or click the browse button to select files from your computer."
              icon="Upload"
              variant="inline"
            />
          </div>
        )}

        {/* Upload Statistics */}
        {completedFiles.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-success/10 to-green-100 border-success/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-success to-green-400 rounded-lg">
                <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {completedFiles.length} File{completedFiles.length > 1 ? 's' : ''} Uploaded Successfully
                </h3>
                <p className="text-sm text-gray-600">
                  Total size: {formatFileSize(completedFiles.reduce((sum, file) => sum + file.size, 0))}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FileUploader;