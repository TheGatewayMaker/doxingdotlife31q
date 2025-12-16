import { RequestHandler } from "express";
import {
  deletePostFolder,
  deleteMediaFile,
  updatePostMetadataField,
  getPostMetadata,
  listPostFiles,
  getMediaUrl,
} from "../utils/r2-storage";
import { Post } from "@shared/api";

/**
 * Validates file path to prevent directory traversal attacks
 */
const isValidFilePath = (filePath: string): boolean => {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  // Check for path traversal attempts
  if (
    filePath.includes("..") ||
    filePath.includes("/") ||
    filePath.includes("\\")
  ) {
    return false;
  }

  // Check for null bytes
  if (filePath.includes("\0")) {
    return false;
  }

  // Check for special characters that could cause issues
  const validPattern = /^[a-zA-Z0-9._\-]+$/;
  return validPattern.test(filePath);
};

export const handleDeletePost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      console.error("Delete post request missing postId");
      res.status(400).json({ error: "Post ID is required" });
      return;
    }

    console.log(`[${new Date().toISOString()}] Deleting post ${postId}`);

    await deletePostFolder(postId);

    console.log(
      `[${new Date().toISOString()}] ✅ Successfully deleted post ${postId}`,
    );

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[${new Date().toISOString()}] ❌ Error deleting post:`,
      errorMessage,
    );
    console.error("Full error details:", error);

    res.status(500).json({
      success: false,
      error: "Failed to delete post",
      details:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "An error occurred while deleting the post. Please check server logs.",
    });
  }
};

export const handleDeleteMediaFile: RequestHandler = async (req, res) => {
  try {
    const { postId, fileName } = req.params;

    if (!postId || !fileName) {
      res.status(400).json({ error: "Post ID and file name are required" });
      return;
    }

    // Validate both postId and fileName to prevent path traversal
    if (!isValidFilePath(postId) || !isValidFilePath(fileName)) {
      console.warn(
        `Invalid path detected - postId: ${postId}, fileName: ${fileName}`,
      );
      res.status(403).json({ error: "Invalid file path" });
      return;
    }

    await deleteMediaFile(postId, fileName);

    res.json({
      success: true,
      message: "Media file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media file:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: `Failed to delete media file: ${errorMessage}`,
    });
  }
};

const getMimeType = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop() || "";
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
    tiff: "image/tiff",
    tif: "image/tiff",
    jpe: "image/jpeg",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    flv: "video/x-flv",
    m4v: "video/x-m4v",
    mpg: "video/mpeg",
    mpeg: "video/mpeg",
    mts: "video/mp2t",
    m2ts: "video/mp2t",
    wmv: "video/x-ms-wmv",
    mxf: "video/mxf",
    ogv: "video/ogg",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    ogg: "audio/ogg",
    opus: "audio/opus",
    wma: "audio/x-ms-wma",
    aiff: "audio/aiff",
    aif: "audio/aiff",
    json: "application/json",
    pdf: "application/pdf",
    txt: "text/plain",
  };

  return mimeTypes[extension] || "application/octet-stream";
};

export const handleUpdatePost: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      title,
      description,
      country,
      city,
      server,
      nsfw,
      blurThumbnail,
      isTrend,
      trendRank,
    } = req.body;

    if (!postId) {
      res.status(400).json({ error: "Post ID is required" });
      return;
    }

    const metadata = await getPostMetadata(postId);
    if (!metadata) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const updates: {
      title?: string;
      description?: string;
      country?: string;
      city?: string;
      server?: string;
      nsfw?: boolean;
      blurThumbnail?: boolean;
      isTrend?: boolean;
      trendRank?: number;
    } = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (country !== undefined) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (server !== undefined) updates.server = server;
    if (nsfw !== undefined) updates.nsfw = nsfw === "true" || nsfw === true;
    if (blurThumbnail !== undefined) updates.blurThumbnail = blurThumbnail === "true" || blurThumbnail === true;
    if (isTrend !== undefined)
      updates.isTrend = isTrend === "true" || isTrend === true;
    if (trendRank !== undefined)
      updates.trendRank = trendRank
        ? parseInt(String(trendRank), 10)
        : undefined;

    const updatedMetadata = await updatePostMetadataField(postId, updates);
    if (!updatedMetadata) {
      res.status(500).json({ error: "Failed to update post" });
      return;
    }

    const mediaFiles = await listPostFiles(postId);
    const mediaFileObjects = mediaFiles
      .map((fileName) => ({
        name: fileName,
        url: `/api/media/${postId}/${fileName}`,
        type: getMimeType(fileName),
      }))
      .filter((f) => f.name !== "metadata.json");

    let thumbnail: string | undefined;
    if ((updatedMetadata as any).thumbnail) {
      thumbnail = (updatedMetadata as any).thumbnail;
    } else if (mediaFileObjects.length > 0) {
      thumbnail = mediaFileObjects[0].url;
    }

    const post: Post = {
      id: updatedMetadata.id,
      title: updatedMetadata.title,
      description: updatedMetadata.description,
      country: updatedMetadata.country,
      city: updatedMetadata.city,
      server: updatedMetadata.server,
      thumbnail,
      blurThumbnail: (updatedMetadata as any).blurThumbnail || false,
      nsfw: updatedMetadata.nsfw || false,
      isTrend: updatedMetadata.isTrend || false,
      trendRank: updatedMetadata.trendRank,
      mediaFiles: mediaFileObjects,
      createdAt: updatedMetadata.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: "Failed to update post",
      details:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "An error occurred while updating the post. Please check server logs.",
    });
  }
};

export const handleAddAttachments: RequestHandler = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      res.status(400).json({ error: "Post ID is required" });
      return;
    }

    if (!req.files || typeof req.files !== "object") {
      res.status(400).json({ error: "No files provided" });
      return;
    }

    const { uploadMediaFile } = await import("../utils/r2-storage");

    const attachments = req.files.attachments;
    if (!Array.isArray(attachments)) {
      res.status(400).json({ error: "Invalid attachments format" });
      return;
    }

    const metadata = await getPostMetadata(postId);
    if (!metadata) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const uploadedFiles: string[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    for (const file of attachments) {
      try {
        const fileName = `${Date.now()}-${uploadedFiles.length}-${file.originalname}`;
        const mimeType = file.mimetype || "application/octet-stream";

        await uploadMediaFile(postId, fileName, file.buffer, mimeType);
        uploadedFiles.push(fileName);
      } catch (fileError) {
        errors.push({
          fileName: file.originalname || "unknown",
          error:
            fileError instanceof Error
              ? fileError.message
              : "Unknown error",
        });
      }
    }

    if (uploadedFiles.length === 0 && errors.length > 0) {
      res.status(500).json({
        error: "Failed to upload attachments",
        details: errors,
      });
      return;
    }

    // Get updated file list
    const mediaFiles = await listPostFiles(postId);
    const mediaFileObjects = mediaFiles
      .map((fileName) => ({
        name: fileName,
        url: `/api/media/${postId}/${fileName}`,
        type: getMimeType(fileName),
      }))
      .filter((f) => f.name !== "metadata.json");

    let thumbnail: string | undefined;
    if ((metadata as any).thumbnail) {
      thumbnail = (metadata as any).thumbnail;
    } else if (mediaFileObjects.length > 0) {
      thumbnail = mediaFileObjects[0].url;
    }

    const post: Post = {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      country: metadata.country,
      city: metadata.city,
      server: metadata.server,
      thumbnail,
      blurThumbnail: (metadata as any).blurThumbnail || false,
      nsfw: metadata.nsfw || false,
      isTrend: metadata.isTrend || false,
      trendRank: metadata.trendRank,
      mediaFiles: mediaFileObjects,
      createdAt: metadata.createdAt,
    };

    const response: any = {
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      post,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding attachments:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: "Failed to add attachments",
      details:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "An error occurred while adding attachments. Please check server logs.",
    });
  }
};
