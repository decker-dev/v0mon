"use client";

import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  username: string;
}

export function CopyLinkButton({ username }: CopyLinkButtonProps) {
  const handleCopyLink = async () => {
    const url = `https://v0mon.vercel.app/${username}`;

    try {
      await navigator.clipboard.writeText(url);

      // Show success toast
      toast.success("Link copied to clipboard!", {
        description: url,
      });
    } catch (error) {
      console.error("Failed to copy link:", error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast.success("Link copied to clipboard!", {
          description: url,
        });
      } catch (fallbackError) {
        toast.error("Failed to copy link", {
          description: "Please copy manually from the address bar",
        });
      }
    }
  };

  return (
    <Button
      onClick={handleCopyLink}
      variant="outline"
      className="flex items-center gap-2 flex-1 border-orange-500 hover:border-orange-60"
    >
      <Link className="w-4 h-4" />
      Copy Link
    </Button>
  );
}
