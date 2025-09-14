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
          backgroundColor: "#0f0f23",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        {/* Background Pokemon Image */}
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
            opacity: 0.15,
            filter: "blur(2px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            textAlign: "center",
          }}
        >
          {/* Main Title */}
          <h1
            style={{
              fontSize: "96px",
              fontWeight: "bold",
              color: "#ffffff",
              margin: "0 0 24px 0",
              textShadow: "0 8px 16px rgba(0, 0, 0, 0.8)",
              lineHeight: "1",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            v0mon
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "36px",
              color: "#e2e8f0",
              margin: "0 0 48px 0",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "500",
            }}
          >
            Generate your V0mon with @handle
          </p>

          {/* Call to Action */}
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>✨</span>
            <span>Transform your X/Twitter profile into a unique creature</span>
            <span>✨</span>
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
