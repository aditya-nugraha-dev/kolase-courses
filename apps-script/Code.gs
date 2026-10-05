/* KOLASE — Google Apps Script Web App (Sheets Source of Truth)
 * Spreadsheet tabs (hybrid):
 * Legacy transaksional: MST_STUDENTS | MST_TEACHERS | MST_STAFF | TXN_PAYMENTS
 * TXN_ENTITLEMENT_LEDGER | CLASS_MEMBERSHIP | SESSIONS | TRIALS | REVIEWS
 * Pilot tracker V1.0: 00_CONFIG | 01_REGISTRATION_RAW | 02_PLACEMENT_RAW
 * 03_POSTCLASS_RAW | 04_STUDENT_MASTER | 05_CLASS_MASTER | 06_TEACHER_OBSERVATION
 * (02/03 *_FORM_RAW_RESPONSE dibiarkan untuk Google Form, jangan ditimpa)
 *
 * Deploy: Extensions > Apps Script > paste file ini > Deploy > New deployment > Web app
 * Execute as: Me | Who has access: Anyone (untuk prototype; production pakai API key)
 */

const HEADERS = {
  MST_STUDENTS: ["student_id", "nama", "email", "wa", "tgl_daftar"],
  MST_TEACHERS: ["teacher_id", "nama", "email", "wa"],
  MST_STAFF: ["staff_id", "nama", "email", "role"],
  TXN_PAYMENTS: ["trx_id", "enrollment_id", "student_id", "class_id", "nominal", "method", "status", "tgl", "tgl_verifikasi"],
  TXN_ENTITLEMENT_LEDGER: ["at", "enrollment_id", "student_id", "delta", "reason", "balance_after"],
  CLASS_MEMBERSHIP: ["enrollment_id", "student_id", "class_id", "status", "sisa", "activated_at", "expires_at"],
  SESSIONS: ["session_id", "enrollment_id", "seq", "tanggal", "hadir", "status"],
  TRIALS: ["trial_id", "student_id", "class_id", "status", "at"],
  REVIEWS: ["nama", "rating", "teks", "class_id", "at"],
  // Grain kanonikal KOL-POL-COD-001 §3.3 (otomatis dibuat via setup saat redeploy)
  CLASS_SESSIONS: ["session_id", "class_id", "seq", "tanggal", "status"],
  SESSION_ATTENDANCE: ["session_id", "student_id", "hadir", "recorded_by", "recorded_at"],
};

// Pilot tracker: header persis seperti di sheet (baris 3). Jangan rename agar dropdown/rumus aman.
const PILOT_HEADERS = {
  "01_REGISTRATION_RAW": ["Cap waktu", "Full Name", "Preferred Name", "Email", "No. WhatsApp", "Age", "Domicile", "Current Activities", "Learning Goal", "Main Difficulties", "Previous Experience", "Schedule Option", "Device", "Google Meet Ready", "Full 90 Min Commitment", "Guardian Name", "Guardian WhatsApp", "Guardian Consent", "Data Consent", "Accuracy Confirmation"],
  "02_PLACEMENT_RAW": ["Attempt_ID", "Timestamp", "Email", "Student_ID", "Full_Name", "Honesty_Declaration", "Language_Use_Score", "Vocabulary_Score", "Reading_Score", "Listening_Score", "Placement_Auto_Score", "Writing_Response", "Writing_Score", "Placement_Total", "Pre_Check_Response", "Pre_Check_Score"],
  "03_POSTCLASS_RAW": ["Attempt_ID", "Timestamp", "Email", "Student_ID", "Full_Name", "Class_ID", "Post_Objective_Score", "Post_Writing_Response", "Post_Writing_Score", "Post_Check_Total", "Objective_Understanding", "Perceived_Improvement", "Participation_Comfort", "Class_Pace", "Teacher_Clarity", "Most_Helpful", "Still_Difficult", "Technical_Issue", "Interest_Status", "Contact_Consent", "Additional_Feedback"],
  "04_STUDENT_MASTER": ["Student_ID", "Full_Name", "Preferred_Name", "Email", "WhatsApp", "Age_Group", "Guardian_Name", "Guardian_WhatsApp", "Guardian_Consent", "Domicile", "Current_Activity", "Registration_Date", "Learning_Goal", "Main_Difficulty", "Current_Status", "Placement_Auto_Score", "Writing_Score", "Placement_Total", "A2_Fit", "Pre_Check_Score", "Class_ID", "Confirmation_Status", "Attendance_Status", "Post_Check_Score", "Gain_Score", "Learning_Objective_Result", "Interest_Status", "Follow_Up_Status", "Teacher_Recommendation", "Placement_Notes", "General_Notes", "Email_Sent_Status", "Last_Updated"],
  "05_CLASS_MASTER": ["Class_ID", "Class_Name", "Level", "Class_Date", "Start_Time", "End_Time", "Duration_Minutes", "Teacher_Name", "Capacity", "Meet_Link", "Learning_Objective", "Slides_Link", "Placement_Form_Link", "Post_Class_Form_Link", "Registered_Count", "Confirmed_Count", "Attended_Count", "Class_Status", "Reminder"],
  "06_TEACHER_OBSERVATION": ["Observation_ID", "Student_ID", "Student_Name", "Class_ID", "Attendance", "Baseline_Performance", "Participation", "Grammar", "Vocabulary", "Fluency", "Interaction", "Final_Performance", "Learning_Objective_Result", "Student_Strength", "Development_Area", "Teacher_Feedback", "Recommendation", "Recorded_By", "Recorded_At"],
};
const PILOT_HEADER_ROW = 3; // pilot: baris 1 judul, 2 deskripsi, 3 header, 4+ data

function headersFor_(tab) {
  return HEADERS[tab] || PILOT_HEADERS[tab] || null;
}
function headerRowFor_(tab) {
  return PILOT_HEADERS[tab] ? PILOT_HEADER_ROW : 1;
}

function getSheet_(tab) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const headers = headersFor_(tab);
  let sh = ss.getSheetByName(tab);
  if (!sh) {
    sh = ss.insertSheet(tab);
    if (PILOT_HEADERS[tab]) {
      // Pilot: baris 1 judul, 2 deskripsi, 3 header agar dropdown/rumus aman
      sh.getRange(1, 1).setValue(tab);
      sh.getRange(3, 1, 1, headers.length).setValues([headers]);
    } else if (headers) {
      sh.appendRow(headers);
    } else {
      sh.appendRow(["payload"]);
    }
  } else if (sh.getLastRow() === 0 && headers) {
    if (PILOT_HEADERS[tab]) sh.getRange(3, 1, 1, headers.length).setValues([headers]);
    else sh.appendRow(headers);
  }
  return sh;
}

function setup_() {
  Object.keys(HEADERS).forEach(getSheet_);
  Object.keys(PILOT_HEADERS).forEach(getSheet_);
  return "OK legacy: " + Object.keys(HEADERS).join(", ") + " | pilot: " + Object.keys(PILOT_HEADERS).join(", ");
}

/** Buat semua tab + header. Jalankan manual 1x dari editor (pilih setup > Run). */
function setup() {
  Logger.log(setup_());
}

function checkKey_(key) {
  const expected = PropertiesService.getScriptProperties().getProperty("KOLASE_API_KEY");
  if (!expected) return true; // prototype: tanpa key
  return key === expected;
}

function rowToObj_(headers, row) {
  const o = {};
  headers.forEach((h, i) => (o[h] = row[i] !== undefined ? row[i] : ""));
  return o;
}

function appendObj_(tab, obj) {
  const headers = headersFor_(tab);
  const sh = getSheet_(tab);
  if (!headers) {
    sh.appendRow([new Date().toISOString(), JSON.stringify(obj)]);
    return 1;
  }
  sh.appendRow(headers.map((h) => (obj[h] !== undefined ? obj[h] : "")));
  return sh.getLastRow();
}

/** Update 1 kolom berdasarkan kunci. Return true jika ketemu. Mendukung header pilot di baris 3. */
function updateWhere_(tab, keyCol, keyVal, patch) {
  const headers = headersFor_(tab);
  if (!headers) return false;
  const sh = getSheet_(tab);
  const hr = headerRowFor_(tab);
  const start = hr + 1;
  const last = sh.getLastRow();
  if (last < start) return false;
  const vals = sh.getRange(start, 1, last - start + 1, headers.length).getValues();
  const ki = headers.indexOf(keyCol);
  if (ki < 0) return false;
  for (let r = 0; r < vals.length; r++) {
    if (String(vals[r][ki]) === String(keyVal)) {
      Object.keys(patch).forEach((k) => {
        const ci = headers.indexOf(k);
        if (ci >= 0) sh.getRange(r + start, ci + 1).setValue(patch[k]);
      });
      return true;
    }
  }
  return false;
}

/* Nomor urut anti-duplikat (kolom ID selalu kolom pertama di tab master).
   Bila ID kiriman kosong/sudah dipakai di sheet, server memberi nomor bebas berikutnya.
   Mendukung header pilot di baris 3. */
function idTaken_(tab, id) {
  const sh = getSheet_(tab);
  const hr = headerRowFor_(tab);
  const start = hr + 1;
  const last = sh.getLastRow();
  if (last < start || !id) return true;
  const vals = sh.getRange(start, 1, last - start + 1, 1).getValues();
  for (let r = 0; r < vals.length; r++) {
    if (String(vals[r][0]) === String(id)) return true;
  }
  return false;
}

function nextFreeId_(tab, prefix) {
  const sh = getSheet_(tab);
  const hr = headerRowFor_(tab);
  const start = hr + 1;
  const last = sh.getLastRow();
  let max = 0;
  if (last >= start) {
    const vals = sh.getRange(start, 1, last - start + 1, 1).getValues();
    for (let r = 0; r < vals.length; r++) {
      const v = String(vals[r][0] || "");
      if (v.indexOf(prefix + "-") === 0) {
        const n = parseInt(v.split("-")[1], 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
  }
  return prefix + "-" + ("000000" + (max + 1)).slice(-6); // 6 digit (KOL-POL-COD-001)
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === "ping") return json_({ ok: true, tabs: Object.keys(HEADERS).concat(Object.keys(PILOT_HEADERS)) });
  if (p.action === "setup") return json_({ ok: true, msg: setup_() });
  if (p.tab && headersFor_(p.tab)) {
    const sh = getSheet_(p.tab);
    const hr = headerRowFor_(p.tab);
    const start = hr + 1;
    const last = sh.getLastRow();
    if (last < start) return json_({ ok: true, tab: p.tab, rows: [] });
    const headers = headersFor_(p.tab);
    const vals = sh.getRange(start, 1, last - start + 1, headers.length).getValues();
    return json_({ ok: true, tab: p.tab, rows: vals.map((r) => rowToObj_(headers, r)) });
  }
  return json_({ ok: true, usage: "GET ?action=ping | ?action=setup | ?tab=MST_STUDENTS | ?tab=04_STUDENT_MASTER" });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!checkKey_(body.key)) return json_({ ok: false, error: "unauthorized" });

    const now = new Date().toISOString();

    // 1) Generic append: { tab: "MST_STUDENTS", payload: {...} }
    if (body.tab && body.payload) {
      appendObj_(body.tab, body.payload);
      return json_({ ok: true, tab: body.tab });
    }

    // 2) Semantic actions dari prototype / Next.js
    const a = body.action;
    if (a === "register") {
      const tab = body.role === "student" ? "MST_STUDENTS" : body.role === "teacher" ? "MST_TEACHERS" : "MST_STAFF";
      const keyCol = body.role === "student" ? "student_id" : body.role === "teacher" ? "teacher_id" : "staff_id";
      const prefix = body.role === "student" ? "STU" : body.role === "teacher" ? "TCH" : "ACT"; // STU-###### seumur hidup
      const row = body.row || {};
      // Kunci nomor urut sesuai urutan pendaftar: kosong/duplikat -> nomor bebas berikutnya
      if (!row[keyCol] || idTaken_(tab, row[keyCol])) {
        row[keyCol] = nextFreeId_(tab, prefix);
      }
      appendObj_(tab, row);
      return json_({ ok: true, tab, assigned_id: row[keyCol] });
    }
    if (a === "checkout") {
      appendObj_("TXN_PAYMENTS", body.payment);
      appendObj_("CLASS_MEMBERSHIP", body.membership);
      return json_({ ok: true });
    }
    if (a === "verify") {
      // body: { payment:{trx_id,...}, membership:{enrollment_id,sisa,activated_at,expires_at,trial_id,trial_credit_applied}, sessions:[...], ledger:{...}, ledger2:{...}|null }
      // BP-001 DEC-006: ledger +15 grant, ledger2 -7 trial recognition (exactly once) bila konversi trial.
      updateWhere_("TXN_PAYMENTS", "trx_id", body.payment.trx_id, {
        status: "VERIFIED",
        tgl_verifikasi: now,
      });
      const mPatch = {
        status: "ACTIVE",
        sisa: body.membership.sisa,
      };
      if (body.membership.activated_at) mPatch["activated_at"] = body.membership.activated_at;
      else mPatch["activated_at"] = now;
      if (body.membership.expires_at) mPatch["expires_at"] = body.membership.expires_at;
      if (body.membership.trial_id) mPatch["trial_id"] = body.membership.trial_id;
      if (body.membership.trial_credit_applied !== undefined) mPatch["trial_credit_applied"] = body.membership.trial_credit_applied;
      updateWhere_("CLASS_MEMBERSHIP", "enrollment_id", body.membership.enrollment_id, mPatch);
      (body.sessions || []).forEach((s) => appendObj_("SESSIONS", s));
      (body.class_sessions || []).forEach((s) => appendObj_("CLASS_SESSIONS", s));
      appendObj_("TXN_ENTITLEMENT_LEDGER", body.ledger);
      if (body.ledger2) appendObj_("TXN_ENTITLEMENT_LEDGER", body.ledger2);
      return json_({ ok: true });
    }
    if (a === "attendance") {
      // body: { session_id, hadir, enrollment_id, ledger, class_session_id?, student_id? }
      updateWhere_("SESSIONS", "session_id", body.session_id, { hadir: body.hadir, status: body.status });
      if (body.class_session_id && body.student_id) {
        appendObj_("SESSION_ATTENDANCE", {
          session_id: body.class_session_id, student_id: body.student_id, hadir: body.hadir,
          recorded_by: body.recorded_by || "teacher", recorded_at: new Date().toISOString(),
        });
      }
      if (body.ledger) {
        appendObj_("TXN_ENTITLEMENT_LEDGER", body.ledger);
        updateWhere_("CLASS_MEMBERSHIP", "enrollment_id", body.enrollment_id, { sisa: body.sisa });
      }
      return json_({ ok: true });
    }
    // ===== PILOT HYBRID actions (mirror 01/02/03/04/06, header baris 3) =====
    if (a === "register_pilot") {
      // body: { registration:{...01...}, student:{...04...} }
      if (body.registration) appendObj_("01_REGISTRATION_RAW", body.registration);
      if (body.student) {
        const s = body.student;
        if (!s.Student_ID || idTaken_("04_STUDENT_MASTER", s.Student_ID)) s.Student_ID = nextFreeId_("04_STUDENT_MASTER", "STU");
        appendObj_("04_STUDENT_MASTER", s);
        return json_({ ok: true, pilot_student_id: s.Student_ID });
      }
      return json_({ ok: true });
    }
    if (a === "placement") {
      // body: { placement:{...02...}, student_patch:{Student_ID, Placement_Total, ...} }
      if (body.placement) appendObj_("02_PLACEMENT_RAW", body.placement);
      if (body.student_patch && body.student_patch.Student_ID) {
        const pid = body.student_patch.Student_ID;
        const patch = Object.assign({}, body.student_patch);
        delete patch.Student_ID;
        patch.Last_Updated = now;
        updateWhere_("04_STUDENT_MASTER", "Student_ID", pid, patch);
      }
      return json_({ ok: true });
    }
    if (a === "postclass") {
      // body: { postclass:{...03...}, student_patch:{Student_ID, Post_Check_Score, Interest_Status, ...} }
      if (body.postclass) appendObj_("03_POSTCLASS_RAW", body.postclass);
      if (body.student_patch && body.student_patch.Student_ID) {
        const pid = body.student_patch.Student_ID;
        const patch = Object.assign({}, body.student_patch);
        delete patch.Student_ID;
        patch.Last_Updated = now;
        updateWhere_("04_STUDENT_MASTER", "Student_ID", pid, patch);
      }
      return json_({ ok: true });
    }
    if (a === "observation") {
      // body: { observation:{...06...} }
      if (body.observation) {
        const o = body.observation;
        if (!o.Observation_ID || idTaken_("06_TEACHER_OBSERVATION", o.Observation_ID)) o.Observation_ID = nextFreeId_("06_TEACHER_OBSERVATION", "OBS");
        appendObj_("06_TEACHER_OBSERVATION", o);
        return json_({ ok: true, observation_id: o.Observation_ID });
      }
      return json_({ ok: false, error: "observation kosong" });
    }

    return json_({ ok: false, error: "unknown action/tab" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
