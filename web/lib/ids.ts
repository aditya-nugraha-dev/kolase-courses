// KOLASE — canonical ID generator per KOL-POL-COD-001:
// STU-###### / CLS-###### / SES-###### / ATM-###### (6 digit), TXN-YYYY-#### / PAY-YYYY-####.
// ENR/TRL adalah kunci internal prototype (tidak ada di dokumen) — dipertahankan apa adanya.
import type { SupabaseClient } from "@supabase/supabase-js";

const pad6 = (n: number) => String(n).padStart(6, "0");

export async function nextId(
  sb: SupabaseClient,
  table: string,
  column: string,
  prefix: string
): Promise<string> {
  const { data, error } = await sb
    .from(table)
    .select(column)
    .ilike(column, `${prefix}-%`)
    .order(column, { ascending: false })
    .limit(50);
  if (error) throw new Error(`nextId ${table}: ${error.message}`);
  let max = 0;
  for (const r of data ?? []) {
    const v = String((r as unknown as Record<string, unknown>)[column] ?? "");
    const n = parseInt(v.split("-").pop() ?? "", 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `${prefix}-${pad6(max + 1)}`;
}

// TXN-YYYY-#### — diterbitkan setelah dana terverifikasi (KOL-POL-COD-001 §3.4).
export async function nextTxnId(sb: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const { data, error } = await sb
    .from("txn_payments")
    .select("trx_id")
    .ilike("trx_id", `${prefix}%`)
    .order("trx_id", { ascending: false })
    .limit(50);
  if (error) throw new Error(`nextTxnId: ${error.message}`);
  let max = 0;
  for (const r of data ?? []) {
    const n = parseInt(String(r.trx_id ?? "").split("-").pop() ?? "", 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}
