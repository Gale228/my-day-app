import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Мой день",
    short_name: "Мой день",
    description: "Личный планировщик задач, расходов, целей, привычек и заметок",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f8",
    theme_color: "#8c75e8",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
