import ffmpeg from "fluent-ffmpeg";
import { execSync } from "child_process";

let ffmpegAvailable: boolean | null = null;
let ffmpegVersion: string = "";

export function checkFFmpegAvailability(): boolean {
  if (ffmpegAvailable !== null) {
    return ffmpegAvailable;
  }

  try {
    // Try to get FFmpeg version
    const version = execSync("ffmpeg -version", { encoding: "utf8" });
    ffmpegAvailable = true;
    ffmpegVersion = version.split("\n")[0];
    console.log(`✓ FFmpeg is available: ${ffmpegVersion}`);
    return true;
  } catch (error) {
    ffmpegAvailable = false;
    console.warn(
      "⚠ FFmpeg is not installed. Video watermarking will not work.",
    );
    console.warn("To enable video watermarking, install FFmpeg:");
    console.warn("  - Ubuntu/Debian: sudo apt-get install ffmpeg");
    console.warn("  - macOS: brew install ffmpeg");
    console.warn("  - Windows: https://ffmpeg.org/download.html");
    console.warn(
      "  - Docker: Add 'RUN apt-get install -y ffmpeg' to your Dockerfile",
    );
    return false;
  }
}

export function getFFmpegStatus(): {
  available: boolean;
  version: string;
} {
  return {
    available: checkFFmpegAvailability(),
    version: ffmpegVersion,
  };
}
