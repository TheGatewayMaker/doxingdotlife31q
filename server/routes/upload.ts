import { RequestHandler } from "express";
import {
  uploadMediaFile,
  uploadPostMetadata,
  getServersList,
  updateServersList,
} from "../utils/r2-storage";

interface UploadRequest {
  title: string;
  description: string;
  country?: string;
  city?: string;
  server?: string;
}

export const handleUpload: RequestHandler = async (req, res) => {
  try {
    const { title, description, country, city, server } =
      req.body as UploadRequest;
    const file = req.file;

    if (!title || !description || !file) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const postId = Date.now().toString();
    const mediaFileName = file.originalname || `${Date.now()}-media`;

    try {
      const mediaUrl = await uploadMediaFile(
        postId,
        mediaFileName,
        file.buffer,
        file.mimetype || "application/octet-stream",
      );

      const postMetadata = {
        id: postId,
        title,
        description,
        country: country || "",
        city: city || "",
        server: server || "",
        mediaFiles: [mediaFileName],
        createdAt: new Date().toISOString(),
      };

      await uploadPostMetadata(postId, postMetadata);

      if (server && server.trim()) {
        try {
          const servers = await getServersList();
          const updatedServers = Array.from(new Set([...servers, server]));
          updatedServers.sort();
          await updateServersList(updatedServers);
        } catch (serverError) {
          console.error("Error updating servers list:", serverError);
        }
      }

      res.json({
        success: true,
        message: "Post uploaded successfully",
        postId,
      });
    } catch (r2Error) {
      console.error("R2 upload error:", r2Error);
      const errorMessage =
        r2Error instanceof Error ? r2Error.message : String(r2Error);
      res.status(500).json({ error: `Upload to R2 failed: ${errorMessage}` });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
