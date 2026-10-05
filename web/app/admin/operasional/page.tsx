import type { Metadata } from "next";
import OpsClient from "./OpsClient";

export const metadata: Metadata = {
  title: "Verifikasi Operasional — KOLASE",
  description: "Admin: verifikasi pembayaran, laporan sesi guru, approval reschedule.",
};

export default function OperasionalPage() {
  return <OpsClient />;
}
