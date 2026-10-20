import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Fixproof — get your landlord to fix it";
const description =
  "Snap the problem, get a formal repair letter in seconds, and keep timestamped evidence. Free for private renters in England.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fixproof.co.uk"),
  title,
  description,
  applicationName: "Fixproof",
  openGraph: { title, description, siteName: "Fixproof", locale: "en_GB", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title, description },
  appleWebApp: { title: "Fixproof", capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16140f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
