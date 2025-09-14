import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShareButton } from "@/components/ui/share-button";
import { DownloadButton } from "@/components/ui/download-button";
import { Github, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { db, schema } from "@/lib/db/database";
import { eq } from "drizzle-orm";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: "bg-gray-400", text: "text-white" },
  fire: { bg: "bg-red-500", text: "text-white" },
  water: { bg: "bg-blue-500", text: "text-white" },
  electric: { bg: "bg-yellow-400", text: "text-black" },
  grass: { bg: "bg-green-500", text: "text-white" },
  ice: { bg: "bg-cyan-300", text: "text-black" },
  fighting: { bg: "bg-red-700", text: "text-white" },
  poison: { bg: "bg-purple-500", text: "text-white" },
  ground: { bg: "bg-yellow-600", text: "text-white" },
  flying: { bg: "bg-indigo-400", text: "text-white" },
  psychic: { bg: "bg-pink-500", text: "text-white" },
  bug: { bg: "bg-green-400", text: "text-white" },
  rock: { bg: "bg-yellow-800", text: "text-white" },
  ghost: { bg: "bg-purple-700", text: "text-white" },
  dragon: { bg: "bg-indigo-700", text: "text-white" },
  dark: { bg: "bg-gray-800", text: "text-white" },
  steel: { bg: "bg-gray-500", text: "text-white" },
  fairy: { bg: "bg-pink-300", text: "text-black" },
};

function getTypeColors(type: string) {
  return (
    TYPE_COLORS[type.toLowerCase()] || { bg: "bg-gray-400", text: "text-white" }
  );
}

interface PokemonResult {
  imageUrl: string;
  pokemonName: string;
  profile: {
    username: string;
    displayName: string;
    bio: string;
    profileFound: boolean;
  };
  description?: string;
  type1?: string;
  type2?: string;
}

async function getPokemon(username: string): Promise<PokemonResult | null> {
  try {
    const cleanUsername = username.replace("@", "").trim().toLowerCase();

    const existingPokemon = await db.query.pokemon.findFirst({
      where: eq(schema.pokemon.username, cleanUsername),
    });

    if (existingPokemon) {
      console.log(
        `♻️ Found existing Pokemon in DB: ${existingPokemon.pokemonName}`,
      );

      return {
        imageUrl: existingPokemon.imageUrl,
        pokemonName: existingPokemon.pokemonName,
        profile: {
          username: existingPokemon.username,
          displayName: existingPokemon.username,
          bio: `Digital creator @${existingPokemon.username}`,
          profileFound: true,
        },
        type1: existingPokemon.type1,
        type2: existingPokemon.type2 || undefined,
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/generate-pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY || "",
      },
      body: JSON.stringify({ username: cleanUsername }),
      next: {
        tags: [`pokemon-${cleanUsername}`],
        revalidate: false,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data;
    } else {
      console.error("Failed to generate Pokemon:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Error getting Pokemon:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const pokemonResult = await getPokemon(username);

  if (!pokemonResult) {
    return {
      title: "Pokemon not found | v0mon",
      description: "This Pokemon could not be generated.",
    };
  }

  const title = `${pokemonResult.pokemonName} | @${username} | v0mon`;
  const description =
    pokemonResult.description ||
    `Meet ${pokemonResult.pokemonName}, a unique Pokemon created for @${username}!`;

  const ogImageUrl = `https://v0mon.vercel.app/api/og?username=${encodeURIComponent(username)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://v0mon.vercel.app/${username}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${pokemonResult.pokemonName} - Pokemon for @${username}`,
        },
      ],
      siteName: "v0mon",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@v0mon",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  console.log(`🎮 Generating static page for: ${username}`);

  const pokemonResult = await getPokemon(username);

  if (!pokemonResult) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 animate-fade-in-up">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">v0mon</h1>
        </Link>
        <a
          href="https://github.com/decker-dev/v0mon"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-fade-in-up"
        >
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </header>

      <main className="px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-primary mb-2">
              @{username}
            </h2>
            <p className="text-muted-foreground">
              Your V0mon companion has been generated!
            </p>
          </div>

          <Card className="p-8 bg-card border-border animate-fade-in-up">
            <div className="text-center space-y-6">
              <div className="relative">
                <Image
                  src={pokemonResult.imageUrl}
                  alt={pokemonResult.pokemonName}
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg shadow-2xl"
                  priority
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-bold">
                  {pokemonResult.pokemonName}
                </h3>
                <div className="flex gap-2 justify-center">
                  {pokemonResult.type1 && (
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getTypeColors(pokemonResult.type1).bg} ${getTypeColors(pokemonResult.type1).text}`}
                    >
                      {pokemonResult.type1.charAt(0).toUpperCase() +
                        pokemonResult.type1.slice(1)}
                    </div>
                  )}
                  {pokemonResult.type2 && (
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getTypeColors(pokemonResult.type2).bg} ${getTypeColors(pokemonResult.type2).text}`}
                    >
                      {pokemonResult.type2.charAt(0).toUpperCase() +
                        pokemonResult.type2.slice(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4 mt-8 max-w-md mx-auto w-full">
            {/* Share Button - Full Width */}
            <ShareButton
              username={username}
              pokemonName={pokemonResult.pokemonName}
              description={pokemonResult.description}
            />

            {/* Download and Create Another - 50% each */}
            <div className="flex gap-4">
              <DownloadButton
                imageUrl={pokemonResult.imageUrl}
                pokemonName={pokemonResult.pokemonName}
                username={username}
              />
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full bg-white text-black"
                >
                  Create another
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const revalidate = false;

export const dynamicParams = true;
