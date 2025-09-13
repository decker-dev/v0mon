import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

// Función para parsear filename y extraer metadata (misma que en generate-pokemon)
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

// Función para generar el Pokémon (igual que en la página)
async function generatePokemon(username: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/generate-pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error generating Pokemon for OG:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "user";
    
    // Obtener datos reales del Pokemon
    const pokemonData = await generatePokemon(username);
    
    const pokemonName = pokemonData?.pokemonName || `${username}mon`;
    const imageUrl = pokemonData?.imageUrl;

    // Si no hay imagen, mostrar mensaje simple
    if (!imageUrl) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#374151",
            }}
          >
            Pokemon for @{username}
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Mostrar la imagen del Pokemon con efecto blur en los laterales
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Imagen de fondo borrosa */}
          <img
            src={imageUrl}
            alt=""
            width="1200"
            height="630"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(20px) brightness(0.3)",
            }}
          />
          
          {/* Imagen principal centrada */}
          <img
            src={imageUrl}
            alt={pokemonName}
            width="600"
            height="600"
            style={{
              position: "relative",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
