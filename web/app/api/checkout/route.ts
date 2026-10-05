// POST /api/checkout {student_id, class_id, method}
// -> {enrollment_id: ENR-xxxxx, trx_id} status PENDING + auto-save ke Sheets
// PUBLIC CLASS 2026-09-15: max 50 (Kids 50k, Teen 75k). CORE lama tetap max 5 (BP-001 DEC-005).
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId, nextTxnId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const { student_id, class_id, method } = await req.json();
    if (!student_id || !class_id || !method) return NextResponse.json({ ok: false, error: "student_id, class_id, method wajib" }, { status: 400 });
    const sb = supabaseServer();
    const { data: cls, error: clsErr } = await sb.from("classes").select("harga,kuota,kategori,sesi_count,class_status").eq("id", class_id).single();
    if (clsErr || !cls) return NextResponse.json({ ok: false, error: "class_id tidak ditemukan" }, { status: 404 });
    if ((cls.class_status || "OPEN") !== "OPEN") return NextResponse.json({ ok: false, error: `Kelas belum dibuka (status ${cls.class_status})` }, { status: 403 });
    // Kapasitas: PUBLIC max 50, CORE max 5.
    const { count } = await sb.from("class_membership").select("enrollment_id", { count: "exact", head: true }).eq("class_id", class_id).in("status", ["PENDING", "ACTIVE"]);
    const isPublic = (cls.kategori ?? "PUBLIC") === "PUBLIC" || String(class_id).startsWith("CLS-PUB-");
    const cap = isPublic ? Math.min(cls.kuota ?? 50, 50) : Math.min(cls.kuota ?? 5, 5);
    if ((count ?? 0) >= cap) return NextResponse.json({ ok: false, error: `Kelas penuh (${count}/${cap}, max ${cap})` }, { status: 409 });
    const enrollment_id = await nextId(sb, "class_membership", "enrollment_id", "ENR");
    const trx_id = await nextTxnId(sb); // TXN-YYYY-####, terbit setelah dana terverifikasi (KOL-POL-COD-001 §3.4)
    const payment = { trx_id, enrollment_id, student_id, class_id, nominal: cls.harga, method, status: "PENDING" };
    const membership = { enrollment_id, student_id, class_id, status: "PENDING", sisa: 0 };
    const { error: pErr } = await sb.from("txn_payments").insert(payment);
    if (pErr) throw new Error(pErr.message);
    const { error: mErr } = await sb.from("class_membership").insert(membership);
    if (mErr) throw new Error(mErr.message);
    const sheets = await postSheets({ action: "checkout", payment, membership });
    return NextResponse.json({ ok: true, enrollment_id, trx_id, sheets });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
