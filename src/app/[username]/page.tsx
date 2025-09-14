import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { db, schema } from "@/lib/db/database";
import { eq } from "drizzle-orm";

// Colores para cada tipo de Pokemon
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

// Función para obtener los colores de un tipo
function getTypeColors(type: string) {
  return TYPE_COLORS[type.toLowerCase()] || { bg: "bg-gray-400", text: "text-white" };
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

// Función para obtener el Pokémon desde la base de datos o generar uno nuevo
async function getPokemon(
  username: string,
): Promise<PokemonResult | null> {
  try {
    const cleanUsername = username.replace("@", "").trim();
    
    // Buscar en la base de datos primero
    const existingPokemon = await db.query.pokemon.findFirst({
      where: eq(schema.pokemon.username, cleanUsername),
    });

    if (existingPokemon) {
      console.log(`♻️ Found existing Pokemon in DB: ${existingPokemon.pokemonName}`);
      
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

    // Si no existe en la base de datos, generar uno nuevo usando la API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/generate-pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: cleanUsername }),
      // Cachear la respuesta para ISR
      next: {
        tags: [`pokemon-${cleanUsername}`],
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
    console.error("Error getting Pokemon:", error);
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
  
  // Obtener el Pokémon para obtener la información
  const pokemonResult = await getPokemon(username);
  
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

  // Obtener el Pokémon desde la base de datos o generar uno nuevo
  const pokemonResult = await getPokemon(username);

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
                {/* Type Badges */}
                <div className="flex gap-2 justify-center">
                  {pokemonResult.type1 && (
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getTypeColors(pokemonResult.type1).bg} ${getTypeColors(pokemonResult.type1).text}`}>
                      {pokemonResult.type1.charAt(0).toUpperCase() + pokemonResult.type1.slice(1)}
                    </div>
                  )}
                  {pokemonResult.type2 && (
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getTypeColors(pokemonResult.type2).bg} ${getTypeColors(pokemonResult.type2).text}`}>
                      {pokemonResult.type2.charAt(0).toUpperCase() + pokemonResult.type2.slice(1)}
                    </div>
                  )}
                </div>
                {pokemonResult.description && (
                  <p className="text-muted-foreground text-lg max-w-md mx-auto text-pretty">
                    {pokemonResult.description}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Create Another Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button>
                Create another
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
