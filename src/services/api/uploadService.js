import uploadConfigData from "@/services/mockData/uploadConfig.json";

// Get upload configuration
export const getUploadConfig = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...uploadConfigData };
};

// Simulate file upload with progress
export const uploadFile = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const totalTime = 2000 + Math.random() * 3000; // Random upload time between 2-5 seconds
    const intervalTime = 100;
    const progressIncrement = (100 / (totalTime / intervalTime));
    
    const interval = setInterval(() => {
      progress = Math.min(100, progress + progressIncrement + Math.random() * 2);
      
      const uploadSpeed = (file.size * progress / 100) / ((Date.now() - startTime) / 1000);
      
      if (onProgress) {
        onProgress(Math.floor(progress), uploadSpeed);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate occasional upload failures (10% chance)
        if (Math.random() < 0.1) {
          reject(new Error("Upload failed due to network error"));
        } else {
          resolve({
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            filename: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            url: `https://example.com/uploads/${file.name}`
          });
        }
      }
    }, intervalTime);
    
    const startTime = Date.now();
  });
};

// Simulate batch upload
export const uploadMultipleFiles = async (files, onProgress, onFileComplete) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadFile(file.file, (progress, speed) => {
        if (onProgress) {
          onProgress(file.id, progress, speed);
        }
      });
      
      results.push({ fileId: file.id, success: true, result });
      
      if (onFileComplete) {
        onFileComplete(file.id, true, result);
      }
    } catch (error) {
      results.push({ fileId: file.id, success: false, error: error.message });
      
      if (onFileComplete) {
        onFileComplete(file.id, false, error.message);
      }
    }
  }
  
  return results;
};

// Get file icon based on type
export const getFileIcon = (type, extension) => {
  if (type.startsWith("image/")) return "Image";
  if (type.includes("pdf")) return "FileText";
  if (type.includes("document") || extension === "doc" || extension === "docx") return "FileText";
  if (type.includes("spreadsheet") || extension === "xlsx" || extension === "csv") return "FileSpreadsheet";
  if (type.includes("presentation") || extension === "ppt" || extension === "pptx") return "Presentation";
  if (type.includes("video/")) return "Video";
  if (type.includes("audio/")) return "Music";
  if (type.includes("zip") || type.includes("rar")) return "Archive";
  
  return "File";
};