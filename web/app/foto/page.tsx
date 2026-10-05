import type { Metadata } from "next";
import PhotoUploader from "../components/PhotoUploader";
import { Badge, Card } from "../components/ui";

export const metadata: Metadata = {
  title: "Upload Foto per ID — KOLASE",
  description: "Upload dan lihat foto untuk setiap ID: siswa, guru, staff, kelas, dan pembayaran.",
};

export default function FotoPage() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        <p className="text-center text-xs font-extrabold tracking-[0.2em] text-navy">DOKUMEN • FOTO PER ID</p>
        <h1 className="font-display mt-2 text-center text-2xl font-extrabold text-ink sm:text-3xl">Upload Foto per ID</h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-ink/70">
          Satu pintu untuk semua foto: profil siswa <b>STU-XXXXXX</b>, guru <b>TCH-XXXXXX</b>, staff{" "}
          <b>ACT-XXXXXX</b>, cover kelas <b>CLS-XXXXXX</b>, dan bukti pembayaran. Format JPG/PNG/WebP, maksimal 5 MB per file.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge tone="sand">STU-XXXXXX</Badge>
          <Badge tone="navy">TCH / ACT</Badge>
          <Badge tone="blue">CLS-XXXXXX</Badge>
          <Badge tone="amber">PAYMENT</Badge>
        </div>

        <div className="mt-6">
          <PhotoUploader />
        </div>

        <Card className="mt-4 rounded-xl">
          <h2 className="font-display text-base font-extrabold text-ink">Aturan singkat</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink/80">
            <li>Pilih jenis ID, ketik ID persis seperti di invoice / portal (huruf kapital + strip).</li>
            <li>Foto bukti pembayaran juga bisa diupload dari halaman <a href="/bayar" className="font-bold text-navy underline">/bayar</a> — otomatis mengisi link bukti.</li>
            <li>Admin memverifikasi foto pembayaran di <a href="/admin/operasional" className="font-bold text-navy underline">/admin/operasional</a>.</li>
            <li>Format ID mengikuti Standar Penamaan Kode & Format ID V1.3 (Drive 04_PANDUAN).</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
