import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperFileFieldComponent from "@/components/atoms/FileUploader/ApperFileFieldComponent";
import { createFilePreview, formatFileSize, generateFileId, validateFileSize, validateFileType } from "@/utils/fileUtils";
import { createUploadedFile, getAllUploadedFiles, getUploadConfig } from "@/services/api/uploadService";
import ApperIcon from "@/components/ApperIcon";
import FileCard from "@/components/molecules/FileCard";
import DropZone from "@/components/molecules/DropZone";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

// Helper function to get file icon based on file type
const getFileIcon = (fileType) => {
  if (!fileType) return "File";
  
  const type = fileType.toLowerCase();
  
  if (type.includes('image')) return "Image";
  if (type.includes('video')) return "Video";
  if (type.includes('audio')) return "Music";
  if (type.includes('pdf')) return "FileText";
  if (type.includes('word') || type.includes('doc')) return "FileText";
  if (type.includes('excel') || type.includes('sheet')) return "FileSpreadsheet";
  if (type.includes('powerpoint') || type.includes('presentation')) return "FileText";
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return "Archive";
  if (type.includes('text') || type.includes('plain')) return "FileText";
  if (type.includes('json') || type.includes('javascript') || type.includes('css') || type.includes('html')) return "Code";
  
  return "File";
};

const FileUploader = () => {
const [uploadConfig, setUploadConfig] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfig();
    loadUploadedFiles();
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

  const loadUploadedFiles = async () => {
    try {
      const dbFiles = await getAllUploadedFiles();
      setUploadedFiles(dbFiles);
    } catch (err) {
      console.error("Error loading uploaded files:", err);
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

      // Process files with ApperFileFieldComponent
      for (const fileData of pendingFiles) {
        try {
          // Create database record
          const dbRecord = await createUploadedFile({
            filename_c: fileData.name,
            size_c: fileData.size,
            type_c: fileData.type,
            uploaded_at_c: new Date().toISOString(),
            url_c: fileData.preview || "",
            Name: fileData.name,
            Tags: ""
          });

          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { 
                  ...f, 
                  status: "success",
                  progress: 100,
                  uploadSpeed: 0,
                  dbId: dbRecord?.Id
                }
              : f
          ));

          toast.success(`${fileData.name} uploaded successfully`);

        } catch (error) {
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { 
                  ...f, 
                  status: "error",
                  error: error.message,
                  uploadSpeed: 0
                }
              : f
          ));

          toast.error(`Failed to upload ${fileData.name}: ${error.message}`);
        }
      }

      // Reload uploaded files list
      await loadUploadedFiles();
      
      const successCount = files.filter(f => f.status === "success").length;
      if (successCount > 0) {
        toast.success(`Upload completed! ${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully.`);
      }

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

        {/* ApperFileFieldComponent for database file uploads */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Upload Files to Database</h2>
            <ApperFileFieldComponent
              elementId="main-file-uploader"
              config={{
                fieldKey: 'file-upload-field',
                fieldName: 'file_content_c',
                tableName: 'uploadedfile_c',
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
                existingFiles: uploadedFiles.map(file => ({
                  Id: file.Id,
                  Name: file.filename_c || file.Name,
                  Size: file.size_c,
                  Type: file.type_c,
                  Url: file.url_c
                })),
                fileCount: uploadedFiles.length
              }}
            />
          </div>
        </Card>

        {/* Traditional Drop Zone */}
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
{/* Database Files Display */}
        {uploadedFiles.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Uploaded Files ({uploadedFiles.length})</h2>
              <div className="grid gap-4">
                {uploadedFiles.map(file => (
                  <div key={file.Id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <ApperIcon name={getFileIcon(file.type_c)} className="w-8 h-8 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.filename_c || file.Name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size_c)} • {file.type_c}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(file.uploaded_at_c).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

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