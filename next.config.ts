import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

/**
 * Quando `GITHUB_PAGES=true` (definido pelo workflow do CI), o build
 * vira um export estático servido em sub-path no GitHub Pages.
 * Sem essa env, `npm run dev` e `npm run build` locais funcionam normal.
 */
const isGhPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGhPages
    ? {
        output: "export" as const,
        basePath: basePath || undefined,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default withSerwist(nextConfig);
