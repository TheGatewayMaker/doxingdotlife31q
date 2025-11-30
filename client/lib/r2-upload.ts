interface FileMetadata {
  fileName: string;
  contentType: string;
  fileSize: number;
}

interface GenerateUrlsResponse {
  postId: string;
  presignedUrls: Array<{
    fileName: string;
    signedUrl: string;
    contentType: string;
    fileSize: number;
  }>;
}

export interface UploadResult {
  fileName: string;
  success: boolean;
  error?: string;
  fileSize: number;
}

export const generatePresignedUrls = async (
  files: FileMetadata[],
  idToken: string,
): Promise<GenerateUrlsResponse> => {
  const response = await fetch("/api/generate-upload-urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      files,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Failed to generate upload URLs";
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMsg = errorData.error;
      }
      if (errorData.details) {
        errorMsg += `: ${errorData.details}`;
      }
    } catch {
      errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
};

export const uploadFileToR2 = async (
  file: File,
  signedUrl: string,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: contentType });

        const response = await fetch(signedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": contentType,
          },
        });

        if (!response.ok) {
          throw new Error(
            `R2 upload failed: ${response.status} ${response.statusText}`,
          );
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const uploadFilesToR2Parallel = async (
  files: File[],
  presignedUrls: Array<{
    fileName: string;
    signedUrl: string;
    contentType: string;
    fileSize: number;
  }>,
  onProgress?: (completed: number, total: number) => void,
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  let completedCount = 0;

  const uploadPromises = files.map(async (file, index) => {
    const presignedUrl = presignedUrls[index];

    if (!presignedUrl) {
      results[index] = {
        fileName: file.name,
        success: false,
        error: "No presigned URL available for file",
        fileSize: file.size,
      };
      return;
    }

    try {
      await uploadFileToR2(file, presignedUrl.signedUrl, file.type);

      results[index] = {
        fileName: file.name,
        success: true,
        fileSize: file.size,
      };

      completedCount++;
      onProgress?.(completedCount, files.length);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";

      results[index] = {
        fileName: file.name,
        success: false,
        error: errorMsg,
        fileSize: file.size,
      };

      completedCount++;
      onProgress?.(completedCount, files.length);
    }
  });

  await Promise.all(uploadPromises);
  return results;
};

export const validateUploadInputs = (
  files: File[],
): {
  valid: boolean;
  error?: string;
} => {
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB per file
  const MAX_TOTAL_SIZE = 150 * 1024 * 1024; // 150MB total

  let totalSize = 0;
  const oversizedFiles: string[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      oversizedFiles.push(
        `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }
    totalSize += file.size;
  }

  if (oversizedFiles.length > 0) {
    return {
      valid: false,
      error: `The following files exceed 500MB: ${oversizedFiles.join(", ")}`,
    };
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total upload size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds 150MB limit. Please upload fewer files or use smaller files.`,
    };
  }

  return {
    valid: true,
  };
};
