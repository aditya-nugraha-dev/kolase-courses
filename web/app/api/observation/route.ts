// POST /api/observation {pilot_student_id?, student_id?, pilot_class_id?, class_id?, attendance?, scores 1-5?, recommendation?}
// Hybrid pilot: insert pilot_observations + forward ke Sheets 06_TEACHER_OBSERVATION.
// Skala 1-5 atau NOT_ASSESSED. Mengukur performa sesi pilot, bukan perubahan level CEFR.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { postSheets } from "@/lib/sheets";
import { nextId } from "@/lib/ids";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const pid = String(b.pilot_student_id ?? "");
    let sid = String(b.student_id ?? "");
    const pclsid = String(b.pilot_class_id ?? "");
    let clsid = String(b.class_id ?? "");
    if (!pid && !sid) return NextResponse.json({ ok: false, error: "pilot_student_id atau student_id wajib" }, { status: 400 });
    const sb = supabaseServer();
    if ((!sid || !clsid) && (pid || pclsid)) {
      if (!sid && pid) {
        const { data } = await sb.from("mst_students").select("student_id").eq("pilot_student_id", pid).single();
        if (data) sid = data.student_id;
      }
      if (!clsid && pclsid) {
        const { data } = await sb.from("classes").select("id").eq("pilot_class_id", pclsid).single();
        if (data) clsid = data.id;
      }
    }
    let observation_id = String(b.observation_id ?? "");
    try {
      if (!observation_id) observation_id = await nextId(sb, "pilot_observations", "observation_id", "OBS");
    } catch { observation_id = `OBS-${Date.now().toString().slice(-5)}`; }
    const row = {
      observation_id, student_id: sid || null, class_id: clsid || null,
      pilot_student_id: pid, pilot_class_id: pclsid,
      attendance: b.attendance ?? "", baseline_performance: b.baseline_performance ?? null,
      participation: b.participation ?? null, grammar_score: b.grammar ?? b.grammar_score ?? null,
      vocabulary: b.vocabulary ?? null, fluency: b.fluency ?? null,
      interaction_score: b.interaction ?? b.interaction_score ?? null,
      final_performance: b.final_performance ?? null,
      learning_objective_result: b.learning_objective_result ?? "",
      recommendation: b.recommendation ?? "",
      recorded_by: b.recorded_by ?? "",
    };
    try {
      await sb.from("pilot_observations").insert(row);
    } catch { /* tabel belum ada = hanya Sheets */ }
    const now = new Date().toISOString();
    const sheets = await postSheets({
      action: "observation",
      observation: {
        Observation_ID: observation_id, Student_ID: pid, Student_Name: b.student_name ?? "",
        Class_ID: pclsid, Attendance: b.attendance ?? "", Baseline_Performance: b.baseline_performance ?? "",
        Participation: b.participation ?? "", Grammar: b.grammar ?? b.grammar_score ?? "",
        Vocabulary: b.vocabulary ?? "", Fluency: b.fluency ?? "", Interaction: b.interaction ?? b.interaction_score ?? "",
        Final_Performance: b.final_performance ?? "", Learning_Objective_Result: b.learning_objective_result ?? "",
        Student_Strength: b.student_strength ?? "", Development_Area: b.development_area ?? "",
        Teacher_Feedback: b.teacher_feedback ?? "", Recommendation: b.recommendation ?? "",
        Recorded_By: b.recorded_by ?? "", Recorded_At: now,
      },
    });
    return NextResponse.json({ ok: true, observation_id, sheets });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
