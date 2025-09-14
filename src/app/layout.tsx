import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "v0mon - Generate Your V0mon Avatar",
  description:
    "Transform any X/Twitter profile into a unique V0mon. Enter your @ and discover your personalized creature.",
  openGraph: {
    title: "v0mon - Generate Your V0mon Avatar",
    description:
      "Transform any X/Twitter profile into a unique V0mon. Enter your @ and discover your personalized creature.",
    type: "website",
    url: "https://v0mon.vercel.app",
    images: [
      {
        url: "/api/og-home",
        width: 1200,
        height: 630,
        alt: "v0mon - Generate your V0mon with @handle",
      },
    ],
    siteName: "v0mon",
  },
  twitter: {
    card: "summary_large_image",
    title: "v0mon - Generate Your V0mon Avatar",
    description:
      "Transform any X/Twitter profile into a unique V0mon. Enter your @ and discover your personalized creature.",
    images: ["/api/og-home"],
    creator: "@v0mon",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
