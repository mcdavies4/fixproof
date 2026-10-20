import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fixproof",
    short_name: "Fixproof",
    description: "Snap the problem, get a formal repair letter, keep timestamped proof.",
    start_url: "/issues",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#16140f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
