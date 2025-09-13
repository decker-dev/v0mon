"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.replace("@", "").trim();
    
    // Validaciones
    if (!cleanUsername) {
      setError("Please enter a username");
      return;
    }
    
    if (cleanUsername.length > 15) {
      setError("Username must be 15 characters or less");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain letters, numbers and underscores");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect with cleaned username
    window.location.href = `/${cleanUsername}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-center">
        <div className="flex items-center gap-2 animate-fade-in-up">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">v0mon</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-balance">
              Generate Your
              <span className="text-primary block">Pokémon Avatar</span>
            </h2>
            <p className="text-muted-foreground text-lg text-pretty">
              Convert any X/Twitter profile into a unique Pokémon. Enter your @
              and discover your personalized creature.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="@elonmusk"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-lg pl-4 pr-4 bg-input focus:border-primary transition-colors"
                disabled={isLoading}
                minLength={1}
                maxLength={15}
                pattern="^[a-zA-Z0-9_]+$"
                title="Only letters, numbers and underscores allowed (1-15 characters)"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-200 animate-pulse-glow"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Generate my Pokémon
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium text-center">
                {error}
              </p>
            </div>
          )}

          {/* Info Text */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              No account required • Instant generation • Free forever
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
