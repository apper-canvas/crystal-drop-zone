// File utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const formatUploadSpeed = (bytesPerSecond) => {
  if (bytesPerSecond === 0) return "0 B/s";
  
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const generateFileId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

export const isImageFile = (type) => {
  return type.startsWith("image/");
};

export const createFilePreview = (file) => {
  return new Promise((resolve) => {
    if (isImageFile(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

export const validateFileType = (file, acceptedTypes) => {
  if (acceptedTypes.length === 0) return true;
  
  const fileExtension = getFileExtension(file.name).toLowerCase();
  const fileType = file.type.toLowerCase();
  
  return acceptedTypes.some(type => {
    if (type.startsWith(".")) {
      return fileExtension === type.substring(1);
    }
    if (type.includes("/*")) {
      const mainType = type.split("/")[0];
      return fileType.startsWith(mainType + "/");
    }
    return fileType === type;
  });
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

export const getFileIcon = (fileType, extension) => {
  // Normalize inputs
  const type = (fileType || '').toLowerCase();
  const ext = (extension || '').toLowerCase().replace('.', '');
  
  // Image files
  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return 'Image';
  }
  
  // Document files
  if (type.includes('pdf') || ext === 'pdf') return 'FileText';
  if (type.includes('word') || type.includes('document') || ['doc', 'docx'].includes(ext)) return 'FileText';
  if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(ext)) return 'FileSpreadsheet';
  if (type.includes('powerpoint') || type.includes('presentation') || ['ppt', 'pptx'].includes(ext)) return 'Presentation';
  if (['txt', 'rtf', 'md', 'markdown'].includes(ext)) return 'FileText';
  
  // Video files
  if (type.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(ext)) {
    return 'Video';
  }
  
  // Audio files
  if (type.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(ext)) {
    return 'Music';
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return 'Archive';
  }
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift'].includes(ext)) {
    return 'Code';
  }
  
  // Executable files
  if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'app'].includes(ext)) {
    return 'Settings';
  }
  
  // Default fallback
  return 'File';
};