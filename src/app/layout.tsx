import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riyadh Pulse Navigator",
  description: "Prototype navigation app with planning and live turn-by-turn guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/maplibre-gl@5.13.0/dist/maplibre-gl.css"
        />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/maplibre-gl@5.13.0/dist/maplibre-gl.js" strategy="afterInteractive" />
        <Script src="https://unpkg.com/@turf/turf@7.2.0/turf.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
