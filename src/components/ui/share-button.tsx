"use client";

import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

interface ShareButtonProps {
  username: string;
  pokemonName: string;
  description?: string;
}

export function ShareButton({
  username,
  pokemonName,
  description,
}: ShareButtonProps) {
  const handleShare = () => {
    const url = `https://v0mon.vercel.app/${username}`;
    const text = `Check out ${pokemonName}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=v0mon,Pokemon`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleShare}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Share className="w-4 h-4" />
      Share on X
    </Button>
  );
}
