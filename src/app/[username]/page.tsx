import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

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
}

// Función para generar el Pokémon en el servidor
async function generatePokemon(
  username: string,
): Promise<PokemonResult | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/generate-pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
      // Cachear la respuesta para ISR
      next: {
        tags: [`pokemon-${username}`],
        revalidate: false, // No revalidar automáticamente, mantener estático
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
    console.error("Error generating Pokemon:", error);
    return null;
  }
}

// Generar metadata dinámico para Open Graph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  
  // Generar el Pokémon para obtener la información
  const pokemonResult = await generatePokemon(username);
  
  if (!pokemonResult) {
    return {
      title: "Pokemon not found | v0mon",
      description: "This Pokemon could not be generated.",
    };
  }

  const title = `${pokemonResult.pokemonName} | @${username} | v0mon`;
  const description = pokemonResult.description || 
    `Meet ${pokemonResult.pokemonName}, a unique Pokemon created for @${username}!`;
  
  // Construir la URL de la imagen OG personalizada (solo necesita username)
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

// Esta función se ejecuta en build time y cuando se visita por primera vez
export default async function PokemonPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  console.log(`🎮 Generating static page for: ${username}`);

  // Generar el Pokémon en el servidor
  const pokemonResult = await generatePokemon(username);

  if (!pokemonResult) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">v0mon</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* User Handle */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-primary mb-2">
              @{username}
            </h2>
            <p className="text-muted-foreground">
              Your Pokemon companion has been generated!
            </p>
          </div>

          {/* Pokemon Card */}
          <Card className="p-8 bg-card border-border animate-fade-in-up">
            <div className="text-center space-y-6">
              {/* Pokemon Image */}
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

              {/* Pokemon Info */}
              <div className="space-y-4">
                <h3 className="text-4xl font-bold">
                  {pokemonResult.pokemonName}
                </h3>
                <div className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  Inspired by @{pokemonResult.profile.username}
                </div>
                {pokemonResult.description && (
                  <p className="text-muted-foreground text-lg max-w-md mx-auto text-pretty">
                    {pokemonResult.description}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Generate Another */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Generate another avatar
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// Configurar ISR - NO revalidar automáticamente (mantener estático para siempre)
export const revalidate = false; // Mantener estático permanentemente

// Permitir generar páginas dinámicamente para usernames no pre-generados
export const dynamicParams = true;
