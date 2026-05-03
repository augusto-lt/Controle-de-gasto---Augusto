import type { MetadataRoute } from "next";

/** Prefixo usado quando hospedado num sub-path (ex.: GitHub Pages). */
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Necessário para `output: "export"` (GitHub Pages).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Controle de Gastos",
    short_name: "Gastos",
    description:
      "App pessoal para controlar gastos fixos e variáveis, com meta diária e relatórios.",
    start_url: `${BP}/`,
    scope: `${BP}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafafa",
    theme_color: "#18181b",
    lang: "pt-BR",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: `${BP}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BP}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${BP}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
