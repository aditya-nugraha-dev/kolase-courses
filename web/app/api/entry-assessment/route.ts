// POST /api/entry-assessment {student_id?, pilot_student_id?, attendance?, listening?, vocabulary?, confidence?, sentence?, recorded_by?}
// Kids Entry Assessment: asesmen lisan ramah anak 10-15 menit (observasi, tanpa tes tertulis).
// Tiap pelaksanaan = satu ATM-###### baru (KOL-POL-COD-001 §3.6). Tes 50 poin DILARANG untuk Kids.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextId } from "@/lib/ids";
import { postSheets } from "@/lib/sheets";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const pid = String(b.pilot_student_id ?? "");
    let sid = String(b.student_id ?? "");
    if (!pid && !sid) return NextResponse.json({ ok: false, error: "pilot_student_id atau student_id wajib" }, { status: 400 });
    const sb = supabaseServer();
    let studentName = String(b.student_name ?? "");
    if (!sid && pid) {
      const { data } = await sb.from("mst_students").select("student_id,nama,full_name").eq("pilot_student_id", pid).single();
      if (data) { sid = data.student_id; studentName = studentName || data.full_name || data.nama || ""; }
    }
    const attempt_id = await nextId(sb, "pilot_observations", "attempt_id", "ATM").catch(() => `ATM-${Date.now().toString().slice(-6)}`);
    let observation_id = String(b.observation_id ?? "");
    try {
      if (!observation_id) observation_id = await nextId(sb, "pilot_observations", "observation_id", "OBS");
    } catch { observation_id = `OBS-${Date.now().toString().slice(-6)}`; }
    const row = {
      observation_id, attempt_id, student_id: sid || null, pilot_student_id: pid,
      attendance: b.attendance ?? "",
      vocabulary: b.vocabulary ?? null, fluency: b.confidence ?? b.fluency ?? null,
      interaction_score: b.listening ?? b.interaction_score ?? null,
      grammar_score: b.sentence ?? b.grammar_score ?? null,
      learning_objective_result: "",
      recommendation: b.recommendation ?? "",
      recorded_by: b.recorded_by ?? "",
    };
    try {
      await sb.from("pilot_observations").insert(row);
    } catch { /* kolom/tabel belum ada = hanya Sheets */ }
    if (sid) {
      try {
        await sb.from("mst_students").update({ current_status: "ASSESSED", last_updated: new Date().toISOString() }).eq("student_id", sid);
      } catch { /* skip */ }
    }
    const now = new Date().toISOString();
    const sheets = await postSheets({
      action: "observation",
      observation: {
        Observation_ID: observation_id, Student_ID: pid, Student_Name: studentName,
        Class_ID: "", Attendance: b.attendance ?? "",
        Vocabulary: b.vocabulary ?? "", Fluency: b.confidence ?? b.fluency ?? "",
        Interaction: b.listening ?? "", Grammar: b.sentence ?? "",
        Teacher_Feedback: b.teacher_feedback ?? "", Recommendation: b.recommendation ?? "",
        Recorded_By: b.recorded_by ?? "", Recorded_At: now,
      },
    });
    return NextResponse.json({ ok: true, attempt_id, observation_id, sheets });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
