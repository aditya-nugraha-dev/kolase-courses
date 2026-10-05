// POST /api/postclass {student_id?, pilot_student_id?, class_id?, pilot_class_id?, post_check_total?, interest_status?, contact_consent?, technical_issue?}
// Hybrid pilot: update mst_students + insert pilot_postclass + forward ke Sheets 03_POSTCLASS_RAW + 04_STUDENT_MASTER.
// Post_Check_Total max 10, soal setara pre-check tapi tidak sama persis (dijaga di konten, bukan API).
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const pid = String(b.pilot_student_id ?? "");
    let sid = String(b.student_id ?? "");
    const pclsid = String(b.pilot_class_id ?? "");
    let clsid = String(b.class_id ?? "");
    if (!pid && !sid) return NextResponse.json({ ok: false, error: "pilot_student_id atau student_id wajib" }, { status: 400 });
    const total = Number(b.post_check_total ?? 0);
    if (isNaN(total) || total < 0 || total > 10) return NextResponse.json({ ok: false, error: "Post_Check_Total harus 0-10" }, { status: 400 });

    const sb = supabaseServer();
    const attempt_id = await nextId(sb, "pilot_postclass", "attempt_id", "ATM").catch(() => `ATM-${Date.now().toString().slice(-6)}`);
    let email = String(b.email ?? "");
    let fullName = String(b.full_name ?? "");
    if ((!sid || !clsid) && (pid || pclsid)) {
      if (!sid && pid) {
        const { data } = await sb.from("mst_students").select("student_id,email,nama,full_name").eq("pilot_student_id", pid).single();
        if (data) { sid = data.student_id; email = email || data.email || ""; fullName = fullName || data.full_name || data.nama || ""; }
      }
      if (!clsid && pclsid) {
        const { data } = await sb.from("classes").select("id").eq("pilot_class_id", pclsid).single();
        if (data) clsid = data.id;
      }
    }
    if (sid) {
      try {
        await sb.from("mst_students").update({
          post_check_score: total,
          interest_status: b.interest_status ?? "",
          last_updated: new Date().toISOString(),
        }).eq("student_id", sid);
      } catch { /* skip bila kolom belum ada */ }
      try {
        await sb.from("pilot_postclass").insert({
          attempt_id, student_id: sid, class_id: clsid || null, pilot_student_id: pid, pilot_class_id: pclsid,
          post_check_total: total, interest_status: b.interest_status ?? "",
          contact_consent: b.contact_consent ?? "", technical_issue: b.technical_issue ?? "",
        });
      } catch { /* skip */ }
    }
    const now = new Date().toISOString();
    const sheets = await postSheets({
      action: "postclass",
      postclass: {
        Attempt_ID: attempt_id, Timestamp: now, Email: email, Student_ID: pid, Full_Name: fullName, Class_ID: pclsid,
        Post_Objective_Score: b.post_objective_score ?? "", Post_Writing_Response: b.post_writing_response ?? "",
        Post_Writing_Score: b.post_writing_score ?? "", Post_Check_Total: total,
        Objective_Understanding: b.objective_understanding ?? "", Perceived_Improvement: b.perceived_improvement ?? "",
        Participation_Comfort: b.participation_comfort ?? "", Class_Pace: b.class_pace ?? "",
        Teacher_Clarity: b.teacher_clarity ?? "", Most_Helpful: b.most_helpful ?? "",
        Still_Difficult: b.still_difficult ?? "", Technical_Issue: b.technical_issue ?? "",
        Interest_Status: b.interest_status ?? "", Contact_Consent: b.contact_consent ?? "",
        Additional_Feedback: b.additional_feedback ?? "",
      },
      student_patch: {
        Student_ID: pid, Post_Check_Score: total,
        Learning_Objective_Result: b.learning_objective_result ?? "",
        Interest_Status: b.interest_status ?? "", Follow_Up_Status: b.follow_up_status ?? "",
      },
    });
    return NextResponse.json({ ok: true, attempt_id, student_id: sid || null, pilot_student_id: pid || null, post_check_total: total, sheets });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
