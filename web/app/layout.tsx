import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Header from "./components/Header";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kolaseacademy.id"),
  title: {
    default: "KOLASE — Bicara Bahasa Inggris Lebih Percaya Diri",
    template: "%s — KOLASE",
  },
  description:
    "Program A2 Speaking Discovery Session & Little Speakers KOLASE. Kelas kecil 3–5 peserta, 90 menit, terstruktur + feedback langsung. Visi: generasi unggul dan berkarakter.",
  keywords: ["KOLASE", "kursus bahasa inggris", "speaking", "A2", "Little Speakers", "kolaseacademy"],
  authors: [{ name: "KOLASE Academy" }],
  icons: { icon: "/kolase-icon-black.png", apple: "/kolase-icon-black.png" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "KOLASE",
    title: "KOLASE — Bicara Bahasa Inggris Lebih Percaya Diri",
    description:
      "Kelas kecil 3–5 peserta, 90 menit, terstruktur + feedback langsung. Lihat galeri poster & Visi-Misi KOLASE.",
    images: [{ url: "/poster/visi-misi-cover.jpeg", width: 1080, height: 1350, alt: "KOLASE in Vision and Mission" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOLASE — Bicara Bahasa Inggris Lebih Percaya Diri",
    description: "Kelas kecil 3–5 peserta • A2 Speaking • Little Speakers untuk <13.",
    images: ["/poster/visi-misi-cover.jpeg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#203248",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <Header />
        {children}
      </body>
    </html>
  );
}
