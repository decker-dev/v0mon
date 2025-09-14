"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  imageUrl: string;
  pokemonName: string;
  username: string;
}

export function DownloadButton({
  imageUrl,
  pokemonName,
  username,
}: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Fetch the image to ensure it downloads instead of opening
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${pokemonName}-${username}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in new tab if download fails
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="flex items-center gap-2 flex-1"
    >
      <Download className="w-4 h-4" />
      Download
    </Button>
  );
}
