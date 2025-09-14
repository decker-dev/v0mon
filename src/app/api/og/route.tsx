import { ImageResponse } from "next/og";

export const runtime = "edge";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || "#A8A878";
}


async function getPokemonData(username: string) {
  try {
    const cleanUsername = username.replace("@", "").trim();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/generate-pokemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY || "",
      },
      body: JSON.stringify({ username: cleanUsername }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error getting Pokemon for OG:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "user";
    
    const pokemonData = await getPokemonData(username);
    
    const pokemonName = pokemonData?.pokemonName || `${username}mon`;
    const imageUrl = pokemonData?.imageUrl;

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

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            position: "relative",
            backgroundColor: "#1a1a1a",
          }}
        >
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
              filter: "blur(25px) brightness(0.2)",
            }}
          />
          
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "60px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "700px",
                height: "100%",
              }}
            >
              <img
                src={imageUrl}
                alt={pokemonName}
                width="600"
                height="600"
                style={{
                  objectFit: "contain",
                  borderRadius: "48px",
                  padding: "20px",
                }}
              />
            </div> 

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                width: "500px",
                height: "100%",
                padding: "40px",
              }}
            >
              <h1
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  margin: "0 0 16px 0",
                  textShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
                  lineHeight: "1.1",
                }}
              >
                {pokemonName}
              </h1>

              <p
                style={{
                  fontSize: "24px",
                  color: "#cccccc",
                  margin: "0 0 32px 0",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                }}
              >
                @{username}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "32px",
                }}
              >
                {pokemonData.type1 && (
                  <div
                    style={{
                      backgroundColor: getTypeColor(pokemonData.type1),
                      color: "#ffffff",
                      fontSize: "22px",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      borderRadius: "50px",
                    }}
                  >
                    {pokemonData.type1.charAt(0).toUpperCase() + pokemonData.type1.slice(1)}
                  </div>
                )}
                {pokemonData.type2 && (
                  <div
                    style={{
                      backgroundColor: getTypeColor(pokemonData.type2),
                      color: "#ffffff",
                      fontSize: "22px",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      borderRadius: "50px",
                    }}
                  >
                    {pokemonData.type2.charAt(0).toUpperCase() + pokemonData.type2.slice(1)}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                }}
              >
                v0mon
              </div>
            </div>
          </div>
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
