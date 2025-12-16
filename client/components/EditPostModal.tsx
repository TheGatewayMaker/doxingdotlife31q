import { useState, useRef } from "react";
import { Post } from "@shared/api";
import { CloseIcon, CheckIcon } from "./Icons";
import { toast } from "sonner";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (post: Post) => void;
}

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
];

export default function EditPostModal({
  post,
  onClose,
  onUpdate,
}: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [country, setCountry] = useState(post.country || "");
  const [city, setCity] = useState(post.city || "");
  const [server, setServer] = useState(post.server || "");
  const [nsfw, setNsfw] = useState(post.nsfw || false);
  const [blurThumbnail, setBlurThumbnail] = useState(post.blurThumbnail || false);
  const [isTrend, setIsTrend] = useState(post.isTrend || false);
  const [trendRank, setTrendRank] = useState(String(post.trendRank || ""));
  const [isSaving, setIsSaving] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    Array<{ file: File; preview: string; type: string }>
  >([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processNewAttachments(Array.from(files));
    }
  };

  const processNewAttachments = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreviews((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    setNewAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = async (fileName: string) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/media/${fileName}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      toast.success("File removed");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    }
  };

  const uploadNewAttachments = async () => {
    if (newAttachments.length === 0) return;

    setIsUploadingAttachments(true);
    try {
      const formData = new FormData();
      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(`/api/posts/${post.id}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachments");
      }

      const result = await response.json();
      setNewAttachments([]);
      setAttachmentPreviews([]);
      toast.success("Attachments uploaded successfully");
      return result.post;
    } catch (error) {
      console.error("Error uploading attachments:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload attachments"
      );
      throw error;
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setIsSaving(true);

      let updatedPost = post;

      // Upload new attachments if any
      if (newAttachments.length > 0) {
        updatedPost = await uploadNewAttachments();
      }

      // Update post metadata
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          country: country.trim(),
          city: city.trim(),
          server: server.trim(),
          nsfw,
          blurThumbnail,
          isTrend,
          trendRank: isTrend
            ? trendRank
              ? parseInt(trendRank, 10)
              : null
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update post");
      }

      if (result.post) {
        onUpdate(result.post);
      }
      toast.success("Post updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update post",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl p-6 shadow-xl my-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            Edit Post
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving || isUploadingAttachments}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving || isUploadingAttachments}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-50"
              placeholder="Enter post title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving || isUploadingAttachments}
              rows={4}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none disabled:opacity-50"
              placeholder="Enter post description"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Country
            </label>
            <div className="relative">
              <input
                type="text"
                value={countrySearch || country}
                onChange={(e) => setCountrySearch(e.target.value)}
                onFocus={() => setCountrySearch("")}
                disabled={isSaving || isUploadingAttachments}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-50"
                placeholder="Select or type country"
              />
              {countrySearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg z-50 max-h-48 overflow-y-auto shadow-lg">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCountry(c);
                          setCountrySearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-accent/20 text-foreground text-sm transition-colors"
                      >
                        {c}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-muted-foreground text-sm">
                      No countries found
                    </div>
                  )}
                </div>
              )}
            </div>
            {country && !countrySearch && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: <span className="font-semibold">{country}</span>
              </p>
            )}
          </div>

          {/* Blur Thumbnail Toggle */}
          <div>
            <div className="flex items-center gap-3 bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
              <input
                type="checkbox"
                id="blur-thumbnail-toggle"
                checked={blurThumbnail}
                onChange={(e) => setBlurThumbnail(e.target.checked)}
                disabled={isSaving || isUploadingAttachments}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="blur-thumbnail-toggle"
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                  <p className="text-sm font-bold text-blue-600">
                    Blur Thumbnail
                  </p>
                </div>
                <p className="text-xs text-blue-600/80">
                  Blur the thumbnail if the content is sensitive or contains
                  adult material
                </p>
              </label>
            </div>
          </div>

          {/* NSFW Toggle */}
          <div>
            <div className="flex items-center gap-3 bg-[#FF0000]/20 border border-[#FF0000]/50 rounded-lg p-4">
              <input
                type="checkbox"
                id="nsfw-toggle"
                checked={nsfw}
                onChange={(e) => setNsfw(e.target.checked)}
                disabled={isSaving || isUploadingAttachments}
                className="w-5 h-5 accent-[#FF0000] rounded cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="nsfw-toggle" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4 text-[#FF0000]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-sm font-bold text-[#FF0000]">
                    Mark as NSFW
                  </p>
                </div>
                <p className="text-xs text-[#FF0000]/80">
                  This content is Not Safe For Work and requires age
                  verification
                </p>
              </label>
            </div>
          </div>

          {/* Trend Toggle */}
          <div>
            <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-600/50 rounded-lg p-4">
              <input
                type="checkbox"
                id="trend-toggle"
                checked={isTrend}
                onChange={(e) => setIsTrend(e.target.checked)}
                disabled={isSaving || isUploadingAttachments}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="trend-toggle" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <p className="text-sm font-bold text-amber-400">
                    Mark as Trending
                  </p>
                </div>
                <p className="text-xs text-amber-300">
                  Posts marked as trending will appear first with a golden
                  gradient background
                </p>
              </label>
            </div>
          </div>

          {/* Trend Rank */}
          {isTrend && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Trend Rank Number
              </label>
              <input
                type="number"
                value={trendRank}
                onChange={(e) => setTrendRank(e.target.value)}
                disabled={isSaving || isUploadingAttachments}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-50"
                placeholder="Enter rank number (1 = first, 2 = second, etc.)"
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first in the trending section
              </p>
            </div>
          )}

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isSaving || isUploadingAttachments}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-50"
              placeholder="Enter city name"
            />
          </div>

          {/* Server */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Server
            </label>
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              disabled={isSaving || isUploadingAttachments}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all disabled:opacity-50"
              placeholder="Enter server name"
            />
          </div>

          {/* Existing Media Files */}
          {post.mediaFiles && post.mediaFiles.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-3">
                Current Media ({post.mediaFiles.length} files)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-muted/30 p-3 rounded-lg border border-border">
                {post.mediaFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between bg-card p-3 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {file.type.startsWith("image/") ? (
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-foreground truncate">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExistingFile(file.name)}
                      disabled={isSaving || isUploadingAttachments}
                      className="ml-2 p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Attachments Upload */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">
              Add New Attachments
            </label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleAttachmentChange}
                disabled={isSaving || isUploadingAttachments}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.txt,.zip,.rar"
              />
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Images, videos, audio, PDF, or other files
                  </p>
                </div>
              </div>
            </div>

            {/* New Attachment Previews */}
            {attachmentPreviews.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Ready to upload ({attachmentPreviews.length} files)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-muted/30 p-3 rounded-lg border border-border">
                  {attachmentPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-card p-3 rounded-lg border border-accent/30"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {preview.type.startsWith("image/") && (
                          <img
                            src={preview.preview}
                            alt={preview.file.name}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                        )}
                        {preview.type.startsWith("video/") && (
                          <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-accent font-bold">
                              V
                            </span>
                          </div>
                        )}
                        {!preview.type.startsWith("image/") &&
                          !preview.type.startsWith("video/") && (
                            <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-blue-600 font-bold">
                                F
                              </span>
                            </div>
                          )}
                        <span className="text-xs text-foreground truncate">
                          {preview.file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="ml-2 p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSaving || isUploadingAttachments}
            className="flex-1 px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-muted disabled:opacity-40 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploadingAttachments}
            className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            {isSaving || isUploadingAttachments
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
