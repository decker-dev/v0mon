"use client";

import { Button } from "@/components/ui/button";
import { Link, Check } from "lucide-react";
import { useState } from "react";

interface CopyLinkButtonProps {
  username: string;
}

export function CopyLinkButton({ username }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `https://v0mon.vercel.app/${username}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <Button
      onClick={handleCopyLink}
      variant="outline"
      className="flex items-center gap-2 flex-1 border-orange-500 hover:border-orange-60"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Link className="w-4 h-4" />
          Copy Link
        </>
      )}
    </Button>
  );
}
