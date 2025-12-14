import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlobeIcon, MapPinIcon, DiscordIcon } from "@/components/Icons";
import { parseMarkdownBold } from "@/lib/markdown-parser";

interface PostDescriptionSectionProps {
  description: string;
  tags?: {
    country?: string;
    city?: string;
    server?: string;
  };
}

export default function PostDescriptionSection({
  description,
  tags = {},
}: PostDescriptionSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast.success("Description copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy description");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tags/Metadata Section - Only show if we have tags */}
      {(tags.country || tags.city || tags.server) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 opacity-60">
            Category Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.country && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#d0d0d0] border border-white/20 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-white/20 hover:border-accent transition-all">
                <GlobeIcon className="w-3 h-3" />
                {tags.country}
              </span>
            )}
            {tags.city && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#d0d0d0] border border-white/20 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-white/20 hover:border-accent transition-all">
                <MapPinIcon className="w-3 h-3" />
                {tags.city}
              </span>
            )}
            {tags.server && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-[#d0d0d0] border border-white/20 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-white/20 hover:border-accent transition-all">
                <DiscordIcon className="w-3 h-3" />
                {tags.server}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-foreground">Description</h2>
          <button
            onClick={handleCopyDescription}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all text-sm font-medium active:scale-95"
            title="Copy description to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
          {parseMarkdownBold(description)}
        </div>
      </div>
    </div>
  );
}
