import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { db, schema } from "@/lib/db/database";
import { eq } from "drizzle-orm";

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

function getRandomPokemonTypes(): string[] {
  const shouldHaveTwoTypes = Math.random() < 0.3;

  if (shouldHaveTwoTypes) {
    const shuffled = [...POKEMON_TYPES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  } else {
    const randomIndex = Math.floor(Math.random() * POKEMON_TYPES.length);
    return [POKEMON_TYPES[randomIndex]];
  }
}

async function checkBlobExists(filename: string): Promise<string | null> {
  try {
    const blobInfo = await head(filename);
    return blobInfo.url;
  } catch {
    return null;
  }
}

function createProfileFromUsername(username: string) {
  const cleanUsername = username.replace("@", "").toLowerCase();

  console.log(`🎮 Creating Pokemon profile for: @${cleanUsername}`);

  return {
    username: cleanUsername,
    displayName: cleanUsername,
    bio: `Digital creator @${cleanUsername}`,
    profileImage: "",
    success: true,
  };
}

function generatePokemonName(username: string): string {
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "");

  const variations = [
    `${cleanUsername}mon`,
    `${cleanUsername}chu`,
    `${cleanUsername.slice(0, 4)}eon`,
    `${cleanUsername.slice(0, 5)}ite`,
    `${cleanUsername}zard`,
  ];

  const selectedIndex = cleanUsername.length % variations.length;
  return variations[selectedIndex];
}

function createPokemonPrompt(username: string, types: string[]): string {
  const lowerUsername = username.toLowerCase();

  const randomTypes = types;

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

  const primaryType = randomTypes[0];
  const secondaryType = randomTypes[1];

  let personality = typeCharacteristics[primaryType].personality;
  let characteristics = [...typeCharacteristics[primaryType].traits];

  if (secondaryType) {
    const secondaryPersonality = typeCharacteristics[secondaryType].personality;
    personality = `${personality} with ${secondaryPersonality} qualities`;
    characteristics = [
      ...characteristics,
      ...typeCharacteristics[secondaryType].traits.slice(0, 2),
    ];
  }

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

  const typeDescription = secondaryType
    ? `${primaryType}/${secondaryType} dual-type`
    : `${primaryType} type`;

  const prompt = `Create a unique Pokemon-style creature inspired by the username "@${username}" and embodies a ${personality} personality.

IMPORTANT: First, create a unique Pokemon name (between 4-8 characters) that reflects the username "@${username}" and the ${typeDescription} nature. The name should be:
- Creative and Pokemon-like (similar to names like Pikachu, Charizard, Blastoise)
- Easy to pronounce and memorable
- Incorporate elements from the username "@${username}"
- Reflect the ${typeDescription} nature
- Sound catchy and appealing

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
Please start your response with "Pokemon Name: [NAME]" (where [NAME] is the generated name, 4-8 characters), then provide any additional description about the Pokemon.`;

  return prompt;
}

function createPokemonFilename(username: string, types: string[], pokemonName: string): string {
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  
  return `${cleanUsername}.png`;
}

function extractPokemonNameFromResponse(textResponse: string): string | null {
  try {
    const nameMatch = textResponse.match(/Pokemon Name:\s*([^\n\r]{1,20})/i);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      if (name.length >= 4 && name.length <= 8) {
        return name;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authApiKey = request.headers.get('x-api-key');
    
    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    if (!internalApiKey || authApiKey !== internalApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    const cleanUsername = username.replace("@", "").trim().toLowerCase();
    
    if (!cleanUsername || cleanUsername.length > 15 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid username. Must be 1-15 characters, letters, numbers and underscores only." },
        { status: 400 },
      );
    }

    const existingPokemon = await db.query.pokemon.findFirst({
      where: eq(schema.pokemon.username, cleanUsername),
    });

    if (existingPokemon) {
      console.log(`♻️ Using existing Pokemon from DB: ${existingPokemon.pokemonName}`);

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

    const profile = createProfileFromUsername(cleanUsername);

    const randomTypes = getRandomPokemonTypes();

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

    const prompt = createPokemonPrompt(profile.username, randomTypes);

    console.log(`🎨 Generating new Pokemon for @${profile.username}:`, prompt);

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 },
      );
    }

    let imageBase64 = "";
    let textResponse = "";

    for (const part of candidate.content?.parts || []) {
      if (part.text) {
        textResponse = part.text;
        break;
      }
    }

    let pokemonName = extractPokemonNameFromResponse(textResponse);
    if (!pokemonName) {

      pokemonName = generatePokemonName(profile.username);
      console.log(`⚠️ Using fallback name: ${pokemonName}`);
    } else {
      console.log(`✨ AI generated name: ${pokemonName}`);
    }

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData?.data || "";


        const buffer = Buffer.from(imageBase64, "base64");


        const filename = createPokemonFilename(profile.username, randomTypes, pokemonName);


        const blob = await put(filename, buffer, {
          access: "public",
          contentType: "image/png",
        });

        console.log(`✅ Created new Pokemon image: ${filename}`);
        console.log(`📡 Blob URL: ${blob.url}`);


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
          cached: false,
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
