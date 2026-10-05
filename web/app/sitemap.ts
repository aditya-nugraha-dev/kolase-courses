import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kolaseacademy.id";

const ROUTES = [
  "",
  "/tentang",
  "/program/little-speakers",
  "/daftar",
  "/bayar",
  "/guru",
  "/orang-tua",
  "/konten",
  "/foto",
  "/sertifikat",
  "/bantuan",
  "/dashboard",
  "/student",
  "/masuk",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${BASE}${r || "/"}`,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : r === "/tentang" || r === "/daftar" ? 0.9 : 0.7,
  }));
}
