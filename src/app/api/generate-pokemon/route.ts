import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { db, schema } from "@/lib/db/database";
import { eq } from "drizzle-orm";

// Array de tipos de Pokemon disponibles
const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

// Función para seleccionar tipos aleatorios (1 o 2)
function getRandomPokemonTypes(): string[] {
  // Decidir aleatoriamente si tendrá 1 o 2 tipos (70% chance de 1 tipo, 30% de 2 tipos)
  const shouldHaveTwoTypes = Math.random() < 0.3;

  if (shouldHaveTwoTypes) {
    // Seleccionar 2 tipos diferentes
    const shuffled = [...POKEMON_TYPES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  } else {
    // Seleccionar 1 tipo
    const randomIndex = Math.floor(Math.random() * POKEMON_TYPES.length);
    return [POKEMON_TYPES[randomIndex]];
  }
}

// Función para verificar si una imagen ya existe en Vercel Blob
async function checkBlobExists(filename: string): Promise<string | null> {
  try {
    const blobInfo = await head(filename);
    return blobInfo.url;
  } catch {
    // Si el blob no existe, head() lanzará un error
    return null;
  }
}

// Función simple para crear perfil basado solo en el username
function createProfileFromUsername(username: string) {
  const cleanUsername = username.replace("@", "");

  console.log(`🎮 Creating Pokemon profile for: @${cleanUsername}`);

  return {
    username: cleanUsername,
    displayName: cleanUsername,
    bio: `Digital creator @${cleanUsername}`,
    profileImage: "",
    success: true,
  };
}

// Función para generar nombre de Pokemon creativo
function generatePokemonName(username: string): string {
  // Limpiar caracteres especiales
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "");

  // Generar variaciones creativas basadas en el username
  const variations = [
    `${cleanUsername}mon`,
    `${cleanUsername}chu`,
    `${cleanUsername.slice(0, 4)}eon`, // estilo Eevee evolutions
    `${cleanUsername.slice(0, 5)}ite`, // estilo minerales Pokemon
    `${cleanUsername}zard`, // estilo Charizard
  ];

  // Seleccionar una variación basada en la longitud del nombre
  const selectedIndex = cleanUsername.length % variations.length;
  return variations[selectedIndex];
}

// Función para crear prompt inteligente con tipos específicos
function createPokemonPrompt(username: string, types: string[]): string {
  const lowerUsername = username.toLowerCase();

  // Usar los tipos pasados como parámetro
  const randomTypes = types;

  // Mapear tipos a características y personalidades
  const typeCharacteristics: Record<
    string,
    { personality: string; traits: string[] }
  > = {
    normal: {
      personality: "friendly and adaptable",
      traits: ["loyal", "versatile", "approachable"],
    },
    fire: {
      personality: "passionate and energetic",
      traits: ["brave", "determined", "warm-hearted"],
    },
    water: {
      personality: "calm and flowing",
      traits: ["peaceful", "adaptable", "nurturing"],
    },
    electric: {
      personality: "energetic and quick",
      traits: ["fast", "shocking", "bright"],
    },
    grass: {
      personality: "peaceful and natural",
      traits: ["gentle", "growth-oriented", "harmonious"],
    },
    ice: {
      personality: "cool and composed",
      traits: ["elegant", "pristine", "crystalline"],
    },
    fighting: {
      personality: "strong and determined",
      traits: ["brave", "disciplined", "powerful"],
    },
    poison: {
      personality: "mysterious and cunning",
      traits: ["sneaky", "toxic", "resilient"],
    },
    ground: {
      personality: "steady and reliable",
      traits: ["sturdy", "grounded", "protective"],
    },
    flying: {
      personality: "free and soaring",
      traits: ["graceful", "swift", "independent"],
    },
    psychic: {
      personality: "intelligent and mystical",
      traits: ["wise", "telepathic", "mysterious"],
    },
    bug: {
      personality: "industrious and persistent",
      traits: ["hardworking", "social", "resilient"],
    },
    rock: {
      personality: "solid and dependable",
      traits: ["tough", "enduring", "protective"],
    },
    ghost: {
      personality: "mysterious and ethereal",
      traits: ["spooky", "elusive", "otherworldly"],
    },
    dragon: {
      personality: "majestic and powerful",
      traits: ["legendary", "fierce", "noble"],
    },
    dark: {
      personality: "cunning and mysterious",
      traits: ["sneaky", "night-active", "enigmatic"],
    },
    steel: {
      personality: "strong and technological",
      traits: ["durable", "metallic", "precise"],
    },
    fairy: {
      personality: "magical and whimsical",
      traits: ["enchanting", "playful", "mystical"],
    },
  };

  // Combinar características de los tipos seleccionados
  const primaryType = randomTypes[0];
  const secondaryType = randomTypes[1];

  let personality = typeCharacteristics[primaryType].personality;
  let characteristics = [...typeCharacteristics[primaryType].traits];

  if (secondaryType) {
    // Mezclar personalidades y características
    const secondaryPersonality = typeCharacteristics[secondaryType].personality;
    personality = `${personality} with ${secondaryPersonality} qualities`;
    characteristics = [
      ...characteristics,
      ...typeCharacteristics[secondaryType].traits.slice(0, 2),
    ];
  }

  // Mantener algunas características basadas en username para personalización adicional
  if (lowerUsername.includes("0x") || lowerUsername.includes("crypto")) {
    characteristics.push("tech-savvy", "digital");
  } else if (
    lowerUsername.includes("art") ||
    lowerUsername.includes("design")
  ) {
    characteristics.push("artistic", "creative");
  } else if (lowerUsername.includes("music") || lowerUsername.includes("dj")) {
    characteristics.push("melodic", "rhythmic");
  }

  // Crear prompt detallado
  const typeDescription = secondaryType
    ? `${primaryType}/${secondaryType} dual-type`
    : `${primaryType} type`;

  const prompt = `Create a unique Pokemon-style creature inspired by the username "@${username}" and embodies a ${personality} personality.

IMPORTANT: First, create a unique Pokemon name (maximum 9 characters) that reflects the username "@${username}" and the ${typeDescription} nature. The name should be creative and Pokemon-like.

Then create the image with these specifications:

Key characteristics:
- Type: ${typeDescription}
- Primary type: ${primaryType}
${secondaryType ? `- Secondary type: ${secondaryType}` : ""}
- Personality traits: ${characteristics.slice(0, 6).join(", ")}
- Username inspiration: @${username}

Design requirements:
- Original creature design (not copying existing Pokemon)
- Colorful and appealing anime/cartoon art style
- Fantasy creature with unique features that reflect the username
- Should embody the personality: ${personality}
- Include magical/elemental effects related to: ${randomTypes.join(" and ")} type${randomTypes.length > 1 ? "s" : ""}
- Make it look friendly and approachable
- Use vibrant colors that match the ${primaryType}${secondaryType ? ` and ${secondaryType}` : ""} element${randomTypes.length > 1 ? "s" : ""}
- Show clear visual indicators of being a ${typeDescription} Pokemon

Style: High-quality anime/cartoon style, vibrant colors, Pokemon-inspired but completely original design, cute and appealing.

Response format:
Please start your response with "Pokemon Name: [NAME]" (where [NAME] is the generated name, max 9 characters), then provide any additional description.`;

  return prompt;
}

// Función para crear filename con metadata
function createPokemonFilename(username: string, types: string[], pokemonName: string): string {
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const cleanPokemonName = pokemonName.toLowerCase();
  const typesString = types.join("-");
  
  // Formato: username_type1-type2_pokemonname.png
  return `${cleanUsername}_${typesString}_${cleanPokemonName}.png`;
}

// Función para extraer el nombre del Pokémon de la respuesta de la IA
function extractPokemonNameFromResponse(textResponse: string): string | null {
  try {
    // Buscar el patrón "Pokemon Name: [NAME]" al inicio de la respuesta
    const nameMatch = textResponse.match(/Pokemon Name:\s*([^\n\r]{1,9})/i);
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1].trim();
    }
    return null;
  } catch {
    return null;
  }
}

// Función para parsear filename y extraer metadata
function parseFilename(filename: string): { username: string, types: string[], pokemonName: string } | null {
  try {
    const nameWithoutExt = filename.replace('.png', '');
    const parts = nameWithoutExt.split('_');
    
    if (parts.length !== 3) return null;
    
    const [username, typesString, pokemonName] = parts;
    const types = typesString.split('-');
    
    return { username, types, pokemonName };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Validaciones de username
    const cleanUsername = username.replace("@", "").trim();
    
    if (!cleanUsername || cleanUsername.length > 15 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid username. Must be 1-15 characters, letters, numbers and underscores only." },
        { status: 400 },
      );
    }

    // Buscar en la base de datos primero
    const existingPokemon = await db.query.pokemon.findFirst({
      where: eq(schema.pokemon.username, cleanUsername),
    });

    if (existingPokemon) {
      console.log(`♻️ Using existing Pokemon from DB: ${existingPokemon.pokemonName}`);

      // Crear perfil simple basado en username
      const profile = createProfileFromUsername(cleanUsername);

      return NextResponse.json({
        success: true,
        imageUrl: existingPokemon.imageUrl,
        pokemonName: existingPokemon.pokemonName,
        profile: {
          username: profile.username,
          displayName: profile.displayName,
          bio: profile.bio,
          profileFound: true,
        },
        prompt: "Used existing Pokemon from database",
        description: `This is ${existingPokemon.pokemonName}, a unique Pokemon created for @${profile.username}`,
        type1: existingPokemon.type1,
        type2: existingPokemon.type2,
        cached: true,
      });
    }

    // Crear perfil simple basado en username
    const profile = createProfileFromUsername(cleanUsername);

    // Generar tipos aleatorios
    const randomTypes = getRandomPokemonTypes();

    // Si no existe, verificar API key y generar nuevo
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google GenAI API key not configured. Add GOOGLE_GENAI_API_KEY to your .env.local file",
        },
        { status: 500 },
      );
    }

    // Crear prompt inteligente basado en el username y tipos (la IA generará el nombre)
    const prompt = createPokemonPrompt(profile.username, randomTypes);

    console.log(`🎨 Generating new Pokemon for @${profile.username}:`, prompt);

    // Inicializar Google GenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Generar la imagen
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    // Procesar la respuesta
    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 },
      );
    }

    let imageBase64 = "";
    let textResponse = "";

    // Primero extraer el texto para obtener el nombre del Pokemon
    for (const part of candidate.content?.parts || []) {
      if (part.text) {
        textResponse = part.text;
        break;
      }
    }

    // Extraer el nombre del Pokemon de la respuesta de la IA
    let pokemonName = extractPokemonNameFromResponse(textResponse);
    if (!pokemonName) {
      // Fallback al método determinístico si la IA no genera un nombre válido
      pokemonName = generatePokemonName(profile.username);
      console.log(`⚠️ Using fallback name: ${pokemonName}`);
    } else {
      console.log(`✨ AI generated name: ${pokemonName}`);
    }

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData?.data || "";

        // Convertir base64 a buffer
        const buffer = Buffer.from(imageBase64, "base64");

        // Crear filename con metadata usando el nombre generado por la IA
        const filename = createPokemonFilename(profile.username, randomTypes, pokemonName);

        // Subir la imagen a Vercel Blob
        const blob = await put(filename, buffer, {
          access: "public",
          contentType: "image/png",
        });

        console.log(`✅ Created new Pokemon image: ${filename}`);
        console.log(`📡 Blob URL: ${blob.url}`);

        // Guardar en la base de datos
        const newPokemon = await db.insert(schema.pokemon).values({
          username: cleanUsername,
          imageUrl: blob.url,
          type1: randomTypes[0],
          type2: randomTypes[1] || null,
          pokemonName: pokemonName,
        }).returning();

        console.log(`💾 Saved Pokemon to database: ${newPokemon[0].id}`);

        return NextResponse.json({
          success: true,
          imageUrl: blob.url,
          pokemonName: pokemonName,
          profile: {
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            profileFound: true,
          },
          prompt: prompt,
          description: textResponse,
          type1: randomTypes[0],
          type2: randomTypes[1] || null,
          cached: false, // Newly generated
        });
      }
    }

    return NextResponse.json(
      { error: "No image data found in response" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error generating Pokemon:", error);
    return NextResponse.json(
      { error: "Failed to generate Pokemon" },
      { status: 500 },
    );
  }
}
