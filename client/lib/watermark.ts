/**
 * Utility function to add a diagonal watermark to images and video frames
 */

const WATERMARK_TEXT = "www.doxing.life";
const WATERMARK_COLOR = "rgba(255, 255, 255, 0.6)";
const WATERMARK_FONT_SIZE = 80;
const WATERMARK_FONT = "bold 80px Arial";

/**
 * Add watermark to an image
 */
export async function addWatermarkToImage(
  imageUrl: string,
  imageName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Apply watermark
        applyWatermarkToCanvas(ctx, canvas.width, canvas.height);

        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, imageName);
            resolve();
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

/**
 * Add watermark to a video using server-side FFmpeg processing
 */
export async function addWatermarkToVideo(
  videoUrl: string,
  videoName: string,
): Promise<void> {
  try {
    // Validate that we have a URL
    if (!videoUrl || typeof videoUrl !== "string") {
      throw new Error("Invalid video URL provided");
    }

    // Call server endpoint to process video with watermark
    const response = await fetch("/api/watermark-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      let errorMessage = "";
      let errorData: any = {};

      try {
        errorData = await response.json();
        errorMessage =
          errorData.error ||
          errorData.message ||
          `Server returned ${response.status}`;
      } catch {
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }

      if (response.status === 503) {
        throw new Error(
          "Video watermarking service is unavailable. FFmpeg needs to be installed on the server.",
        );
      }

      if (response.status === 400) {
        throw new Error(
          `Invalid request: ${errorMessage}. Please ensure the video URL is valid.`,
        );
      }

      throw new Error(
        errorMessage ||
          `Server error ${response.status}: ${response.statusText}`,
      );
    }

    // Get the blob from the response
    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error("Received empty video file from server");
    }

    // Ensure the filename has .mp4 extension
    const fileName = videoName.replace(/\.[^/.]+$/, "") + ".mp4";

    // Download the watermarked video
    downloadBlob(blob, fileName);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process video with watermark";
    throw new Error(message);
  }
}

/**
 * Apply watermark text diagonally across the canvas
 */
function applyWatermarkToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const diagonal = Math.sqrt(width * width + height * height);
  const angle = Math.atan2(height, width);

  // Save context state
  ctx.save();

  // Set up watermark style
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = WATERMARK_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.6;

  // Move to center and rotate
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);

  // Draw watermark multiple times across the diagonal
  const textWidth = ctx.measureText(WATERMARK_TEXT).width;
  const spacing = textWidth + 100;
  const startOffset = -(diagonal / 2);

  for (let i = startOffset; i < diagonal / 2; i += spacing) {
    ctx.fillText(WATERMARK_TEXT, i, 0);
  }

  // Restore context state
  ctx.restore();
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
