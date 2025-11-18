import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';

const ApperFileFieldComponent = ({ 
  elementId, 
  config = {},
  className = ""
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const elementIdRef = useRef(null);
  const existingFilesRef = useRef([]);

  // Memoize existing files to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    if (files.length !== existingFilesRef.current.length) {
      return files;
    }
    
    // Check if first file ID changed (indicates different files)
    const currentFirstId = existingFilesRef.current[0]?.Id || existingFilesRef.current[0]?.id;
    const newFirstId = files[0]?.Id || files[0]?.id;
    
    if (currentFirstId !== newFirstId) {
      return files;
    }
    
    return existingFilesRef.current;
  }, [config.existingFiles]);

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = `file-uploader-${elementId}`;
  }, [elementId]);

  // Check SDK availability and mount component
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = 100; // 100ms intervals

    const checkSDK = () => {
      attempts++;

      if (window.ApperSDK?.ApperFileUploader) {
        setIsReady(true);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error('ApperSDK not available after maximum attempts');
        toast.error('Failed to load file uploader. Please refresh the page.');
        return;
      }

      setTimeout(checkSDK, checkInterval);
    };

    checkSDK();
  }, []);

  // Mount file field when SDK is ready
  useEffect(() => {
    if (!isReady || !elementIdRef.current || !config.fieldKey) {
      return;
    }

    const mountFileField = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Convert existing files to UI format if needed
        const uiFormattedFiles = config.existingFiles ? 
          ApperFileUploader.toUIFormat(config.existingFiles) : [];

        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: uiFormattedFiles
        });

        existingFilesRef.current = memoizedExistingFiles;
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Failed to mount file field:', error);
        toast.error('Failed to initialize file uploader');
      }
    };

    mountFileField();

    // Cleanup on unmount
    return () => {
      if (isInitialized && elementIdRef.current) {
        try {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        } catch (error) {
          console.error('Error unmounting file field:', error);
        }
        setIsInitialized(false);
      }
    };
  }, [isReady, elementIdRef.current, memoizedExistingFiles, config.fieldKey]);

  // Update files when existingFiles changes
  useEffect(() => {
    if (!isReady || !isInitialized || !config.fieldKey) {
      return;
    }

    const updateFiles = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        if (memoizedExistingFiles && memoizedExistingFiles.length > 0) {
          // Convert to UI format and update
          const uiFormattedFiles = ApperFileUploader.toUIFormat(memoizedExistingFiles);
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, uiFormattedFiles);
        } else {
          // Clear files if no existing files
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = memoizedExistingFiles;
        
      } catch (error) {
        console.error('Error updating files:', error);
      }
    };

    // Only update if files actually changed
    if (JSON.stringify(existingFilesRef.current) !== JSON.stringify(memoizedExistingFiles)) {
      updateFiles();
    }
  }, [memoizedExistingFiles, isReady, isInitialized, config.fieldKey]);

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500">Loading file uploader...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-uploader-container ${className}`}>
      <div id={elementIdRef.current} className="apper-file-field"></div>
    </div>
  );
};

export default ApperFileFieldComponent;