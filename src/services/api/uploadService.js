import { getApperClient } from "@/services/apperClient";

// Get upload configuration from database or default
export const getUploadConfig = async () => {
  try {
    // Return default configuration
    return {
      maxFileSize: 10485760, // 10MB
      acceptedTypes: [
        "image/*",
        "application/pdf", 
        ".doc",
        ".docx",
        ".txt",
        ".csv",
        ".xlsx",
        ".ppt",
        ".pptx"
      ],
      maxFiles: 10,
      allowMultiple: true
    };
  } catch (error) {
    console.error("Error loading upload config:", error);
    throw error;
  }
};

// Get all uploaded files from database
export const getAllUploadedFiles = async () => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.fetchRecords('uploadedfile_c', {
      fields: [
        {"field": {"Name": "Name"}},
        {"field": {"Name": "filename_c"}},
        {"field": {"Name": "size_c"}},
        {"field": {"Name": "type_c"}},
        {"field": {"Name": "uploaded_at_c"}},
        {"field": {"Name": "url_c"}},
        {"field": {"Name": "file_content_c"}},
        {"field": {"Name": "Tags"}}
      ],
      orderBy: [{"fieldName": "uploaded_at_c", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    });

    if (!response.success) {
      console.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    return [];
  }
};

// Create uploaded file record in database
export const createUploadedFile = async (fileData) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Only include Updateable fields
    const record = {
      Name: fileData.name || fileData.filename_c,
      filename_c: fileData.filename_c,
      size_c: fileData.size_c,
      type_c: fileData.type_c,
      uploaded_at_c: fileData.uploaded_at_c || new Date().toISOString(),
      url_c: fileData.url_c,
      Tags: fileData.Tags || ""
    };

    const response = await apperClient.createRecord('uploadedfile_c', {
      records: [record]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} records:`, failed);
        throw new Error(failed[0].message || "Failed to create file record");
      }
      
      return successful[0]?.data;
    }

    return null;
  } catch (error) {
    console.error("Error creating uploaded file record:", error);
    throw error;
  }
};

// Update uploaded file record
export const updateUploadedFile = async (id, updates) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    // Only include Updateable fields
    const allowedFields = ['Name', 'filename_c', 'size_c', 'type_c', 'uploaded_at_c', 'url_c', 'Tags'];
    const record = { Id: id };
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        record[key] = updates[key];
      }
    });

    const response = await apperClient.updateRecord('uploadedfile_c', {
      records: [record]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} records:`, failed);
        throw new Error(failed[0].message || "Failed to update file record");
      }
      
      return successful[0]?.data;
    }

    return null;
  } catch (error) {
    console.error("Error updating uploaded file record:", error);
    throw error;
  }
};

// Delete uploaded file record
export const deleteUploadedFile = async (id) => {
  try {
    const apperClient = getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }

    const response = await apperClient.deleteRecord('uploadedfile_c', {
      RecordIds: [id]
    });

    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} records:`, failed);
        throw new Error(failed[0].message || "Failed to delete file record");
      }
      
      return successful.length > 0;
    }

    return false;
  } catch (error) {
    console.error("Error deleting uploaded file record:", error);
    throw error;
  }
};

// Get file icon based on type
export const getFileIcon = (type, extension) => {
  if (type?.startsWith("image/")) return "Image";
  if (type?.includes("pdf")) return "FileText";
  if (type?.includes("document") || extension === "doc" || extension === "docx") return "FileText";
  if (type?.includes("spreadsheet") || extension === "xlsx" || extension === "csv") return "FileSpreadsheet";
  if (type?.includes("presentation") || extension === "ppt" || extension === "pptx") return "Presentation";
  if (type?.startsWith("video/")) return "Video";
  if (type?.startsWith("audio/")) return "Music";
  if (type?.includes("zip") || type?.includes("rar")) return "Archive";
  
  return "File";
};