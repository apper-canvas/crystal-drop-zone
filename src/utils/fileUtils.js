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