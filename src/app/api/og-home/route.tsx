import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#1a1a1a",
        }}
      >
        {/* Background blur effect */}
        <img
          src="https://v0mon.vercel.app/pokemon.png"
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
          {/* Pokemon Image - Left Side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "600px",
              height: "100%",
            }}
          >
            <img
              src="https://v0mon.vercel.app/pokemon.png"
              alt="V0mon Pokemon"
              width="500"
              height="500"
              style={{
                objectFit: "contain",
                borderRadius: "24px",
                filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))",
              }}
            />
          </div>

          {/* Text Content - Right Side */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "600px",
              height: "100%",
              padding: "40px",
            }}
          >
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#ffffff",
                margin: "0 0 20px 0",
                textShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
                lineHeight: "1.1",
              }}
            >
              v0mon
            </h1>

            <p
              style={{
                fontSize: "28px",
                color: "#e2e8f0",
                margin: "0 0 24px 0",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                fontWeight: "500",
              }}
            >
              Generate your V0mon with @
            </p>

            {/* Badge/Tag */}
            <div
              style={{
                backgroundColor: "rgba(102, 126, 234, 0.2)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                color: "#667eea",
                fontSize: "18px",
                fontWeight: "600",
                padding: "12px 24px",
                borderRadius: "50px",
                textShadow: "none",
              }}
            >
              AI-Powered Pokemon Generator
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
