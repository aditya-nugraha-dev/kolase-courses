import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kolaseacademy.id";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/core/", "/student/kelas/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
