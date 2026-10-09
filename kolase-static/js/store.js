/* KOLASE mock store — mirrors Google Sheets tabs + ID rules.
Tabs legacy: MST_STUDENTS, MST_TEACHERS, MST_STAFF, TXN_PAYMENTS, TXN_ENTITLEMENT_LEDGER, CLASS_MEMBERSHIP
Tabs pilot hybrid V1.0: PILOT_REGISTRATIONS (01), PILOT_PLACEMENTS (02), PILOT_POSTCLASS (03), PILOT_OBSERVATIONS (06) */
const DB_KEY = "kolase_db_v1";

const pad6 = (n) => String(n).padStart(6, "0");
function nextId(prefix, list, field) {
  let max = 0;
  (list || []).forEach((r) => {
    const v = String(r[field] || "");
    if (v.startsWith(prefix + "-")) {
      const n = parseInt(v.split("-").pop(), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return `${prefix}-${pad6(max + 1)}`;
}
// TXN-YYYY-#### — terbit setelah dana terverifikasi (KOL-POL-COD-001 §3.4)
function nextTxnId(list) {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  let max = 0;
  (list || []).forEach((r) => {
    const v = String(r.trx_id || "");
    if (v.startsWith(prefix)) {
      const n = parseInt(v.split("-").pop(), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  });
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/* Hak penuh website HANYA 3 ID ini (tidak bisa didaftarkan, hanya login):
   ACT-000001 Founder & Business Lead • ACT-000002 Co-Founder & Academic Lead
   • ACT-000003 Head of Systems & Technology. */
const FULL_POWER_IDS = ["ACT-000001", "ACT-000002", "ACT-000003"];
const FULL_POWER_SEED = [
  { staff_id: "ACT-000001", nama: "Galang Maharsi", email: "", wa: "", role: "founder", password: "" },
  { staff_id: "ACT-000002", nama: "Hilal Badruz", email: "", wa: "", role: "academic", password: "" },
  { staff_id: "ACT-000003", nama: "Aditya Nugraha", email: "", wa: "", role: "systems", password: "" },
];
function seed() {
  return {
    MST_STUDENTS: [],
    MST_TEACHERS: [],
    MST_STAFF: FULL_POWER_SEED.map((r) => ({ ...r })),
    TXN_PAYMENTS: [],
    TXN_ENTITLEMENT_LEDGER: [],
    CLASS_MEMBERSHIP: [],
    SESSIONS: [],
    CLASS_SESSIONS: [],
    SESSION_ATTENDANCE: [],
    TRIALS: [],
    REVIEWS: [],
    MATERIALS: [],
    CHAT_THREADS: {},
    ANNOUNCEMENTS: [],
    EBADGES: [],
    CHAT: [
      { from: "them", text: "Halo! Selamat datang di kelas A2. Perkenalkan diri ya.", at: "09:00" }
    ],
    PILOT_REGISTRATIONS: [],
    PILOT_PLACEMENTS: [],
    PILOT_POSTCLASS: [],
    PILOT_OBSERVATIONS: [],
    sessionUser: null
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) { const s = seed(); localStorage.setItem(DB_KEY, JSON.stringify(s)); return s; }
    const db = JSON.parse(raw);
    // Migrasi: DB lama belum punya TRIALS/REVIEWS/PILOT
    if (!Array.isArray(db.MST_STUDENTS)) db.MST_STUDENTS = [];
    if (!Array.isArray(db.MST_TEACHERS)) db.MST_TEACHERS = [];
    if (!Array.isArray(db.MST_STAFF)) db.MST_STAFF = [];
    if (!Array.isArray(db.TRIALS)) db.TRIALS = [];
    if (!Array.isArray(db.REVIEWS)) db.REVIEWS = [];
    if (!Array.isArray(db.PILOT_REGISTRATIONS)) db.PILOT_REGISTRATIONS = [];
    if (!Array.isArray(db.PILOT_PLACEMENTS)) db.PILOT_PLACEMENTS = [];
    if (!Array.isArray(db.PILOT_POSTCLASS)) db.PILOT_POSTCLASS = [];
    if (!Array.isArray(db.PILOT_OBSERVATIONS)) db.PILOT_OBSERVATIONS = [];
    if (!Array.isArray(db.CLASS_SESSIONS)) db.CLASS_SESSIONS = [];
    if (!Array.isArray(db.SESSION_ATTENDANCE)) db.SESSION_ATTENDANCE = [];
    if (!Array.isArray(db.MATERIALS)) db.MATERIALS = [];
    if (!db.CHAT_THREADS || typeof db.CHAT_THREADS !== "object") db.CHAT_THREADS = {};
    if (!Array.isArray(db.ANNOUNCEMENTS)) db.ANNOUNCEMENTS = [];
    if (!Array.isArray(db.EBADGES)) db.EBADGES = [];
    // Migrasi 3 ID penuh: pastikan ada; gabungkan duplikat se-nama (password
    // & kontak bawaan pindah ke ID kanonikal) agar hak penuh hanya 3 ID itu.
    if (!Array.isArray(db.MST_STAFF)) db.MST_STAFF = [];
    FULL_POWER_SEED.forEach((f) => {
      let canon = db.MST_STAFF.find((r) => r && r.staff_id === f.staff_id);
      if (!canon) {
        canon = { staff_id: f.staff_id, nama: f.nama, email: "", wa: "", role: f.role, password: "" };
        db.MST_STAFF.push(canon);
      }
      canon.role = f.role;
      if (!canon.nama) canon.nama = f.nama;
      const dups = db.MST_STAFF.filter((r) =>
        r && r !== canon &&
        FULL_POWER_IDS.indexOf(r.staff_id) === -1 &&
        String(r.nama || "").trim().toLowerCase() === f.nama.toLowerCase());
      dups.forEach((dup) => {
        ["password", "email", "wa", "photo"].forEach((k) => { if (!canon[k] && dup[k]) canon[k] = dup[k]; });
        db.MST_STAFF.splice(db.MST_STAFF.indexOf(dup), 1);
      });
    });
    try { saveDB(db); } catch (e) {}
    return db;
  } catch { return seed(); }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

/* Core flows */
/* Hak penuh website HANYA untuk 3 ID/peran ini. */
function isFullPowerUser(u) {
  if (!u) return false;
  if (FULL_POWER_IDS.indexOf(u.id) !== -1) return true;
  return ["founder", "academic", "systems"].indexOf(u.role) !== -1;
}
function requireFullPower() {
  const db = loadDB();
  if (!isFullPowerUser(db.sessionUser)) throw new Error("Khusus 3 ID penuh (ACT-000001/002/003).");
}

function registerPerson(role, nama, email, wa, password) {
  // Pendaftaran mandiri HANYA student (STU-…) & teacher (TCH-…).
  // Staff/leadership (ACT-…) invite-only: 3 ID penuh sudah ditanam, tinggal login.
  if (role !== "student" && role !== "teacher") {
    throw new Error("Pendaftaran staff/leadership hanya via undangan admin. Hubungi admin KOLASE.");
  }
  const db = loadDB();
  const em = String(email || "").trim().toLowerCase();
  if (em) {
    const dup = [...(db.MST_STUDENTS || []), ...(db.MST_TEACHERS || []), ...(db.MST_STAFF || [])]
      .some((r) => String(r.email || "").trim().toLowerCase() === em);
    if (dup) throw new Error("Email sudah terdaftar. Silakan Login.");
  }
  let id;
  let pilotId = null;
  if (role === "student") {
    id = nextId("STU", db.MST_STUDENTS, "student_id"); // STU-###### seumur hidup (KOL-POL-COD-001 §3.1)
    pilotId = id;
    db.MST_STUDENTS.push({ student_id: id, pilot_student_id: id, nama, email, wa, password: password || "", tgl_daftar: new Date().toISOString().slice(0, 10), current_status: "REGISTERED", confirmation_status: "PENDING" });
    db.PILOT_REGISTRATIONS.push({ pilot_student_id: pilotId, student_id: id, full_name: nama, email, whatsapp: wa, at: new Date().toISOString() });
  } else {
    id = nextId("TCH", db.MST_TEACHERS, "teacher_id");
    db.MST_TEACHERS.push({ teacher_id: id, nama, email, wa, password: password || "" });
  }
  db.sessionUser = { role, id, nama, email };
  saveDB(db);
  // Auto-save ke Google Sheets (tab MST_STUDENTS / MST_TEACHERS / MST_STAFF).
  // Tanpa endpoint = hanya antre di localStorage (mode mock).
  const tgl = new Date().toISOString().slice(0, 10);
  const row = role === "student"
    ? { student_id: id, nama, email, wa, tgl_daftar: tgl }
    : role === "teacher"
      ? { teacher_id: id, nama, email, wa }
      : { staff_id: id, nama, email, wa, role };
  postSheets({ action: "register", role, row });
  // Jejak login/masuk (tab LOGIN_LOG di Sheets): siapa, kapan, sebagai apa.
  postSheets({ action: "login", login: { at: new Date().toISOString(), user_id: id, nama, email, role } });
  if (role === "student") {
    const now = new Date().toISOString();
    postSheets({
      action: "register_pilot",
      registration: { "Cap waktu": now, "Full Name": nama, Email: email, "No. WhatsApp": wa },
      student: { Student_ID: pilotId, Full_Name: nama, Email: email, WhatsApp: wa, Current_Status: "REGISTERED", Confirmation_Status: "PENDING", Registration_Date: now.slice(0, 10), Last_Updated: now },
    });
  }
  return id;
}

function portalFor(role) {
  return role === "student" ? "dashboard.html" : role === "teacher" ? "teacher-portal.html" : "staff-portal.html";
}

/* Auth Login/Register ala referensi (mock localStorage, kompatibel akun lama tanpa password) */
function findUserByLogin(query) {
  const db = loadDB();
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  const pick = (list, idField, roleOf) => (list || []).map((r) => ({
    _ref: r, _idField: idField,
    role: typeof roleOf === "function" ? roleOf(r) : roleOf,
    id: r[idField], nama: r.nama, email: r.email, password: r.password || "",
  }));
  const all = [
    ...pick(db.MST_STUDENTS, "student_id", "student"),
    ...pick(db.MST_TEACHERS, "teacher_id", "teacher"),
    ...pick(db.MST_STAFF, "staff_id", (r) => r.role || "staff"),
  ];
  return all.find((u) =>
    String(u.email || "").toLowerCase() === q ||
    String(u.nama || "").toLowerCase() === q ||
    String(u.id || "").toLowerCase() === q) || null;
}

function loginPerson(query, password, remember) {
  const db = loadDB();
  const q = String(query || "").trim().toLowerCase();
  const pass = String(password || "");
  const search = (list, idField, roleOf) => (list || []).map((r) => ({ r, idField, role: typeof roleOf === "function" ? roleOf(r) : roleOf }));
  const all = [
    ...search(db.MST_STUDENTS, "student_id", "student"),
    ...search(db.MST_TEACHERS, "teacher_id", "teacher"),
    ...search(db.MST_STAFF, "staff_id", (r) => r.role || "staff"),
  ];
  const hit = all.find(({ r, idField }) =>
    String(r.email || "").toLowerCase() === q ||
    String(r.nama || "").toLowerCase() === q ||
    String(r[idField] || "").toLowerCase() === q);
  if (!hit) throw new Error("Akun tidak ditemukan. Cek Email / User name, atau Register dulu.");
  // Migrasi akun lama tanpa password: set password saat login pertama.
  if (!hit.r.password) {
    hit.r.password = pass;
    saveDB(db);
  } else if (hit.r.password !== pass) {
    throw new Error("Password salah. Gunakan Forgot Password untuk reset.");
  }
  const user = { role: hit.role, id: hit.r[hit.idField], nama: hit.r.nama, email: hit.r.email };
  db.sessionUser = user;
  saveDB(db);
  try {
    if (remember === false) sessionStorage.setItem("kolase_remember", "0");
    else try { sessionStorage.removeItem("kolase_remember"); } catch (e) {}
  } catch (e) {}
  postSheets({ action: "login", login: { at: new Date().toISOString(), user_id: user.id, nama: user.nama, email: user.email, role: user.role } });
  return user;
}

function resetPassword(query, newPassword) {
  const db = loadDB();
  const q = String(query || "").trim().toLowerCase();
  const np = String(newPassword || "");
  if (np.length < 4) throw new Error("Password baru min. 4 karakter.");
  let changed = false;
  ["MST_STUDENTS", "MST_TEACHERS", "MST_STAFF"].forEach((tab) => {
    (db[tab] || []).forEach((r) => {
      const ids = [r.student_id, r.teacher_id, r.staff_id].filter(Boolean).map((v) => String(v).toLowerCase());
      if (String(r.email || "").toLowerCase() === q || String(r.nama || "").toLowerCase() === q || ids.includes(q)) {
        r.password = np; changed = true;
      }
    });
  });
  if (!changed) throw new Error("Akun tidak ditemukan untuk reset.");
  saveDB(db);
  return true;
}

function checkout(classId, nominal, method) {
  const db = loadDB();
  const user = db.sessionUser;
  if (!user || user.role !== "student") throw new Error("Login sebagai student dulu (Page Auth).");
  // PUBLIC CLASS 2026-09-15: max 50. CORE lama tetap max 5.
  const isPublic = String(classId || "").startsWith("CLS-PUB-");
  const cap = isPublic ? 50 : 5;
  const occupied = (db.CLASS_MEMBERSHIP || []).filter((x) => x.class_id === classId && (x.status === "PENDING" || x.status === "ACTIVE")).length;
  if (occupied >= cap) throw new Error(`Kelas penuh (${occupied}/${cap})`);
  const enrId = nextId("ENR", db.CLASS_MEMBERSHIP, "enrollment_id");
  const trxId = nextTxnId(db.TXN_PAYMENTS); // TXN-YYYY-#### (KOL-POL-COD-001 §3.4)
  db.TXN_PAYMENTS.push({ trx_id: trxId, enrollment_id: enrId, student_id: user.id, class_id: classId, nominal, method, status: "PENDING", tgl: new Date().toISOString() });
  db.CLASS_MEMBERSHIP.push({ enrollment_id: enrId, student_id: user.id, class_id: classId, status: "PENDING", sisa: 0 });
  saveDB(db);
  const payment = db.TXN_PAYMENTS.find((t) => t.trx_id === trxId);
  const membership = db.CLASS_MEMBERSHIP.find((x) => x.enrollment_id === enrId);
  postSheets({ action: "checkout", payment, membership });
  return { enrId, trxId };
}

/* Webhook simulation PUBLIC 2026-09-15: PENDING -> VERIFIED = 4 sesi @60 mnt, sisa 4.
   CORE lama: tanpa trial +15/15 sesi, dengan trial +15-7=8 sesi (exactly once). */
function verifyPayment(trxId, trialId) {
  requireFullPower();
  const db = loadDB();
  const pay = db.TXN_PAYMENTS.find((t) => t.trx_id === trxId);
  if (!pay) throw new Error("TRX tidak ditemukan");
  if (pay.status === "VERIFIED") return pay;
  pay.status = "VERIFIED";
  pay.tgl_verifikasi = new Date().toISOString();
  const m = db.CLASS_MEMBERSHIP.find((x) => x.enrollment_id === pay.enrollment_id);
  const isPublic = String(pay.class_id || "").startsWith("CLS-PUB-");
  // Kredit trial exactly-once: hanya CORE. PUBLIC tanpa trial.
  let trial = null;
  let withTrial = false;
  let sisa = isPublic ? 4 : 15;
  if (!isPublic) {
  if (trialId) trial = (db.TRIALS || []).find((x) => x.trial_id === trialId && x.status !== "CONVERTED");
  if (!trial) trial = (db.TRIALS || []).find((x) => x.student_id === pay.student_id && x.class_id === pay.class_id && trialProgress(x).complete && !x.converted && x.decision !== "berhenti");
  withTrial = Boolean(trial && trialProgress(trial).complete);
  sisa = withTrial ? 8 : 15;
  }
  m.status = "ACTIVE";
  m.sisa = sisa;
  m.trial_id = withTrial ? trial.trial_id : (m.trial_id || null);
  m.trial_credit_applied = withTrial;
  m.activated_at = new Date().toISOString();
  const exp = new Date(); exp.setMonth(exp.getMonth() + (isPublic ? 1 : 2));
  m.expires_at = exp.toISOString().slice(0, 10);
  // N sesi dinamis, 1x/minggu, 60 mnt seragam (KOL-MAN-CORP-001).
  // Kanonikal: SES-XXXXXX per jadwal KELAS; SESSIONS per-enrollment dipertahankan sebagai proyeksi UI.
  const today = new Date();
  const haveSeq = new Set((db.CLASS_SESSIONS || []).filter((x) => x.class_id === pay.class_id).map((x) => x.seq));
  const newClassSessions = [];
  for (let i = 1; i <= sisa; i++) {
    if (haveSeq.has(i)) continue;
    const d = new Date(today); d.setDate(d.getDate() + (i - 1) * 7);
    const row = {
      session_id: nextId("SES", db.CLASS_SESSIONS, "session_id"),
      class_id: pay.class_id, seq: i,
      tanggal: d.toISOString().slice(0, 10), status: "SCHEDULED"
    };
    db.CLASS_SESSIONS.push(row); // push langsung agar nomor urut berikutnya naik
    newClassSessions.push(row);
  }
  const newSessions = [];
  for (let i = 1; i <= sisa; i++) {
    const d = new Date(today); d.setDate(d.getDate() + (i - 1) * 7);
    newSessions.push({
      session_id: `SES-${String(i).padStart(6, "0")}-${pay.enrollment_id}`,
      enrollment_id: pay.enrollment_id, seq: i,
      tanggal: d.toISOString().slice(0, 10), status: "SCHEDULED", hadir: null
    });
  }
  db.SESSIONS.push(...newSessions);
  const grant = isPublic ? sisa : 15;
  const ledgerRow = {
    enrollment_id: pay.enrollment_id, student_id: pay.student_id,
    delta: grant, reason: "PAYMENT_VERIFIED", at: new Date().toISOString(), balance_after: sisa
  };
  db.TXN_ENTITLEMENT_LEDGER.push(ledgerRow);
  let ledgerRow2 = null;
  if (withTrial) {
    ledgerRow2 = { enrollment_id: pay.enrollment_id, student_id: pay.student_id, delta: -7, reason: "TRIAL_RECOGNITION", at: new Date().toISOString(), balance_after: sisa };
    db.TXN_ENTITLEMENT_LEDGER.push(ledgerRow2);
    trial.converted = true;
    trial.status = "CONVERTED";
  }
  saveDB(db);
  // Auto-save ke Sheets: TXN_PAYMENTS->VERIFIED, membership->ACTIVE, N SES kelas + proyeksi, ledger.
  postSheets({
    action: "verify",
    payment: { trx_id: pay.trx_id },
    membership: { enrollment_id: m.enrollment_id, sisa: m.sisa, activated_at: m.activated_at, expires_at: m.expires_at, trial_id: m.trial_id, trial_credit_applied: m.trial_credit_applied },
    sessions: newSessions,
    class_sessions: newClassSessions,
    ledger: ledgerRow,
    ledger2: ledgerRow2
  });
  return pay;
}

/* Attendance per (SES kelas, STU) — KOL-POL-COD-001 §3.3. sessionId boleh SES-XXXXXX
   (wajib studentId) atau SES-XXXXXX-ENR-XXXXXX (legacy, student dari enrollment).
   Baris proyeksi lama ikut ditandai agar dashboard guru tetap jalan. */
function recordAttendance(sessionId, hadir, studentId) {
  const db = loadDB();
  const DEDUCT = ["PRESENT", "LATE", "STUDENT_NO_SHOW", "STUDENT_CANCELLED_LATE", "ABSENT"];
  let cs = null, m = null, legacy = null;
  legacy = db.SESSIONS.find((x) => x.session_id === sessionId) || null;
  if (legacy) {
    if (legacy.hadir) throw new Error("Sesi sudah dicatat");
    m = db.CLASS_MEMBERSHIP.find((x) => x.enrollment_id === legacy.enrollment_id);
    if (!m) throw new Error("Enrollment tidak ditemukan");
    if (studentId && studentId !== m.student_id) throw new Error("student_id tidak cocok enrollment");
    cs = db.CLASS_SESSIONS.find((x) => x.class_id === m.class_id && x.seq === legacy.seq) || null;
  } else {
    cs = db.CLASS_SESSIONS.find((x) => x.session_id === sessionId) || null;
    if (!cs) throw new Error("Sesi tidak ditemukan");
    if (!studentId) throw new Error("student_id wajib untuk SES-XXXXXX");
    m = db.CLASS_MEMBERSHIP.find((x) => x.student_id === studentId && x.class_id === cs.class_id && x.status === "ACTIVE") || null;
    if (!m) throw new Error("Siswa belum aktif di kelas ini");
    legacy = db.SESSIONS.find((x) => x.enrollment_id === m.enrollment_id && x.seq === cs.seq) || null;
  }
  const sid = m.student_id;
  if (!cs) throw new Error("Sesi kelas belum dibuat untuk seq ini");
  if ((db.SESSION_ATTENDANCE || []).some((a) => a.session_id === cs.session_id && a.student_id === sid)) throw new Error("Absensi siswa ini sudah dicatat");
  const status = (hadir === "CANCELLED" || hadir === "VALID_STUDENT_CANCEL" || hadir === "TEACHER_CANCELLED" || hadir === "ACADEMY_CANCELLED") ? "CANCELLED" : hadir === "RESCHEDULED" ? "RESCHEDULED" : "DONE";
  db.SESSION_ATTENDANCE.push({ session_id: cs.session_id, student_id: sid, hadir, recorded_by: (db.sessionUser || {}).id || "teacher", recorded_at: new Date().toISOString() });
  cs.status = status;
  if (legacy && !legacy.hadir) { legacy.hadir = hadir; legacy.status = status; }
  let ledgerRow = null;
  if (DEDUCT.includes(hadir)) {
    const next = (m.sisa || 0) - 1;
    if (next < 0) throw new Error(`integrity exception: sisa akan negatif (${m.sisa}-1). Rekonsiliasi dulu (BP-011).`);
    m.sisa = next;
    ledgerRow = {
      enrollment_id: m.enrollment_id, student_id: m.student_id,
      delta: -1, reason: `ATTENDANCE_${hadir}_${cs.seq}`, at: new Date().toISOString(), balance_after: m.sisa
    };
    db.TXN_ENTITLEMENT_LEDGER.push(ledgerRow);
  }
  saveDB(db);
  // Auto-save ke Sheets: baris SESSION_ATTENDANCE + status sesi + sisa membership + ledger -1 (jika hadir)
  postSheets({
    action: "attendance",
    session_id: legacy ? legacy.session_id : cs.session_id, hadir, status,
    enrollment_id: m.enrollment_id, sisa: m.sisa, ledger: ledgerRow,
    class_session_id: cs.session_id, student_id: sid
  });
  return m.sisa;
}

/* Trial gratis 7 sesi -> ulasan. Trial dibuka per siswa per kelas, selesai saat
   7 sesi tercatat PRESENT/LATE (guru boleh mengoreksi ABSENT), lalu form ulasan terbuka. */
function startTrial(classId) {
  const db = loadDB();
  const user = db.sessionUser;
  if (!user || user.role !== "student") throw new Error("Login sebagai student dulu (Page Auth).");
  let t = db.TRIALS.find((x) => x.student_id === user.id && x.class_id === classId && !trialProgress(x).complete);
  if (t) return t.trial_id;
  const trial_id = nextId("TRL", db.TRIALS, "trial_id");
  const today = new Date();
  t = { trial_id, student_id: user.id, class_id: classId, done: false, reviewed: false, status: "STARTED", sessions: [] };
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today); d.setDate(d.getDate() + (i - 1) * 7);
    t.sessions.push({ seq: i, tanggal: d.toISOString().slice(0, 10), hadir: null });
  }
  db.TRIALS.push(t);
  saveDB(db);
  postSheets({ tab: "TRIALS", payload: { trial_id, student_id: user.id, class_id: classId, status: "STARTED", at: new Date().toISOString() } });
  return trial_id;
}

function trialProgress(t) {
  const n = (t.sessions || []).filter((s) => s.hadir === "PRESENT" || s.hadir === "LATE").length;
  return { doneCount: n, complete: n >= 7 };
}

function recordTrialAttendance(trialId, seq, hadir) {
  const db = loadDB();
  const t = db.TRIALS.find((x) => x.trial_id === trialId);
  if (!t) throw new Error("Trial tidak ditemukan");
  const s = t.sessions.find((x) => x.seq === Number(seq));
  if (!s) throw new Error("Sesi trial tidak ditemukan");
  s.hadir = hadir; // trial boleh dikoreksi guru bila sebelumnya ABSENT
  t.done = trialProgress(t).complete;
  if (t.done) t.status = "COMPLETED";
  saveDB(db);
  // issueBadge SETELAH save agar tidak tertimpa (baca-tulis ulang dari storage).
  if (t.done) {
    try { issueBadge("TRIAL", t.trial_id, t.student_id, "7 Sesi Trial Gratis — " + t.class_id); } catch (e) {}
  }
  return t.done;
}

/* Keputusan setelah 7/7: "lanjut" = buatkan enrollment Kids (PENDING) lalu ke
   checkout/pembayaran; "berhenti" = trial DROPPED (tidak dikonversi saat verify). */
function decideTrial(trialId, decision, classId, nominal) {
  const db = loadDB();
  const t = (db.TRIALS || []).find((x) => x.trial_id === trialId);
  if (!t) throw new Error("Trial tidak ditemukan");
  const u = db.sessionUser;
  const PRIV = ["staff", "admin", "owner", "author", "founder", "academic", "systems"];
  if (!u || (u.role === "student" && u.id !== t.student_id)) throw new Error("Ini bukan trial-mu.");
  if (!trialProgress(t).complete) throw new Error("Selesaikan 7 sesi dulu.");
  if (decision === "berhenti") {
    t.decision = "berhenti";
    t.status = "DROPPED";
    saveDB(db);
    return { stopped: true };
  }
  if (decision !== "lanjut") throw new Error("Keputusan tidak dikenal.");
  t.decision = "lanjut";
  const cid = classId || t.class_id;
  let m = (db.CLASS_MEMBERSHIP || []).find((x) => x.student_id === t.student_id && x.class_id === cid && (x.status === "PENDING" || x.status === "ACTIVE"));
  if (!m) {
    const isPublic = String(cid || "").startsWith("CLS-PUB-");
    const cap = isPublic ? 50 : 5;
    const occupied = (db.CLASS_MEMBERSHIP || []).filter((x) => x.class_id === cid && (x.status === "PENDING" || x.status === "ACTIVE")).length;
    if (occupied >= cap) throw new Error(`Kelas penuh (${occupied}/${cap})`);
    const enrId = nextId("ENR", db.CLASS_MEMBERSHIP, "enrollment_id");
    const trxId = nextTxnId(db.TXN_PAYMENTS);
    const pay = { trx_id: trxId, enrollment_id: enrId, student_id: t.student_id, class_id: cid, nominal: Number(nominal || 0), method: "QRIS", status: "PENDING", tgl: new Date().toISOString() };
    m = { enrollment_id: enrId, student_id: t.student_id, class_id: cid, status: "PENDING", sisa: 0, trial_id: t.trial_id, trial_credit_applied: false };
    db.TXN_PAYMENTS.push(pay);
    db.CLASS_MEMBERSHIP.push(m);
    postSheets({ action: "checkout", payment: pay, membership: m });
  }
  t.enrollment_id = m.enrollment_id;
  saveDB(db);
  const trx = (db.TXN_PAYMENTS || []).filter((x) => x.enrollment_id === m.enrollment_id).pop() || null;
  return { enrId: m.enrollment_id, trxId: trx ? trx.trx_id : null, status: m.status };
}

function submitReview(trialId, rating, teks) {
  const db = loadDB();
  const t = db.TRIALS.find((x) => x.trial_id === trialId);
  if (!t) throw new Error("Trial tidak ditemukan");
  if (!trialProgress(t).complete) throw new Error("Selesaikan 7 trial dulu.");
  if (t.reviewed) throw new Error("Ulasan sudah dikirim.");
  const r = Number(rating);
  if (!(r >= 1 && r <= 5) || !String(teks || "").trim()) throw new Error("Rating 1-5 dan isi ulasan wajib.");
  const user = db.sessionUser;
  const rev = { nama: (user ? user.nama + " • " : "") + t.class_id, rating: r, teks: String(teks).trim(), class_id: t.class_id, at: new Date().toISOString().slice(0, 10) };
  db.REVIEWS.unshift(rev);
  t.reviewed = true;
  saveDB(db);
  postSheets({ tab: "REVIEWS", payload: rev });
  return rev;
}

/* Ulasan 1 paket: terbuka setelah siswa menyelesaikan semua sesi dalam 1 enrollment.
   Penilaian bintang per aspek: kelas, guru, pembelajaran, materi (1-5).
   Overall = rata-rata 4 aspek. REVIEWS lama (rating tunggal trial) tetap terbaca. */
const REVIEW_ASPECTS = [
  { key: "rating_kelas", label: "Kelas" },
  { key: "rating_guru", label: "Guru" },
  { key: "rating_pembelajaran", label: "Pembelajaran" },
  { key: "rating_materi", label: "Materi" },
];

function packageProgress(enrollmentId) {
  const db = loadDB();
  const sessions = (db.SESSIONS || []).filter((s) => s.enrollment_id === enrollmentId);
  const done = sessions.filter((s) => !!s.hadir).length;
  const total = sessions.length || 4;
  return { doneCount: done, total, complete: sessions.length > 0 && done >= total };
}

function eligiblePackages(studentId) {
  const db = loadDB();
  const reviewedEnr = new Set((db.REVIEWS || []).filter((r) => r.enrollment_id).map((r) => r.enrollment_id));
  return (db.CLASS_MEMBERSHIP || [])
    .filter((m) => m.student_id === studentId && !reviewedEnr.has(m.enrollment_id))
    .filter((m) => packageProgress(m.enrollment_id).complete);
}

function submitPackageReview(enrollmentId, ratings, teks) {
  const db = loadDB();
  const m = (db.CLASS_MEMBERSHIP || []).find((x) => x.enrollment_id === enrollmentId);
  if (!m) throw new Error("Enrollment tidak ditemukan");
  const user = db.sessionUser;
  if (user && user.role === "student" && user.id !== m.student_id) throw new Error("Ini bukan paketmu.");
  if (!packageProgress(enrollmentId).complete) throw new Error("Selesaikan 1 paket (semua sesi) dulu.");
  if ((db.REVIEWS || []).some((r) => r.enrollment_id === enrollmentId)) throw new Error("Ulasan paket ini sudah dikirim.");
  const vals = REVIEW_ASPECTS.map((a) => Number((ratings || {})[a.key]));
  if (vals.some((v) => !(v >= 1 && v <= 5))) throw new Error("Semua aspek wajib diberi bintang 1-5.");
  if (!String(teks || "").trim()) throw new Error("Isi ulasan wajib.");
  const overall = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  const rev = {
    nama: ((user && user.nama ? user.nama + " • " : "") + m.class_id),
    student_id: m.student_id, enrollment_id: m.enrollment_id, class_id: m.class_id,
    rating: overall, rating_overall: overall,
    rating_kelas: vals[0], rating_guru: vals[1], rating_pembelajaran: vals[2], rating_materi: vals[3],
    teks: String(teks).trim(), at: new Date().toISOString().slice(0, 10),
  };
  db.REVIEWS.unshift(rev);
  saveDB(db);
  postSheets({ tab: "REVIEWS", payload: rev });
  // Badge SETELAH save agar tidak tertimpa (baca-tulis ulang dari storage).
  try { issueBadge("PAKET", m.enrollment_id, m.student_id, "1 Paket Selesai — " + m.class_id); } catch (e) {}
  return rev;
}

function balanceOf(enrollmentId) {
  const db = loadDB();
  const m = db.CLASS_MEMBERSHIP.find((x) => x.enrollment_id === enrollmentId);
  return m ? m.sisa : 0;
}

/* Pilot hybrid V1.0 (mirror 02/03/06, header Sheets baris 3) */
/* Pilot hybrid: placement 50 poin KHUSUS dewasa; Kids wajib entry assessment (bukan tes tulis).
   Satu pengerjaan = satu ATM-###### (KOL-POL-COD-001 §3.6). */
function submitPlacement(pilotStudentId, scores) {
  const db = loadDB();
  const s = db.MST_STUDENTS.find((x) => x.pilot_student_id === pilotStudentId) || db.MST_STUDENTS.find((x) => x.student_id === pilotStudentId);
  if (!s) throw new Error("Siswa pilot tidak ditemukan");
  const total = Number(scores.placement_total ?? 0);
  const pre = Number(scores.pre_check_score ?? 0);
  if (total < 0 || total > 50) throw new Error("Placement_Total harus 0-50");
  if (pre < 0 || pre > 10) throw new Error("Pre_Check harus 0-10");
  s.placement_total = total; s.pre_check_score = pre; s.current_status = "PLACEMENT_SUBMITTED";
  const attemptId = nextId("ATM", db.PILOT_PLACEMENTS, "attempt_id");
  db.PILOT_PLACEMENTS.push({ attempt_id: attemptId, pilot_student_id: s.pilot_student_id || pilotStudentId, student_id: s.student_id, placement_total: total, pre_check_score: pre, at: new Date().toISOString() });
  saveDB(db);
  postSheets({
    action: "placement",
    placement: { Attempt_ID: attemptId, Timestamp: new Date().toISOString(), Student_ID: s.pilot_student_id || pilotStudentId, Placement_Total: total, Pre_Check_Score: pre },
    student_patch: { Student_ID: s.pilot_student_id || pilotStudentId, Placement_Total: total, Pre_Check_Score: pre, Current_Status: "PLACEMENT_SUBMITTED" },
  });
  return { total, pre, attemptId };
}

function submitPostclass(pilotStudentId, pilotClassId, res) {
  const db = loadDB();
  const total = Number(res.post_check_total ?? 0);
  if (total < 0 || total > 10) throw new Error("Post_Check harus 0-10");
  const attemptId = nextId("ATM", db.PILOT_POSTCLASS, "attempt_id");
  db.PILOT_POSTCLASS.push({ attempt_id: attemptId, pilot_student_id: pilotStudentId, pilot_class_id: pilotClassId, post_check_total: total, interest_status: res.interest_status || "", at: new Date().toISOString() });
  const s = db.MST_STUDENTS.find((x) => (x.pilot_student_id || x.student_id) === pilotStudentId);
  if (s) { s.post_check_score = total; s.interest_status = res.interest_status || s.interest_status; }
  saveDB(db);
  postSheets({
    action: "postclass",
    postclass: { Attempt_ID: attemptId, Timestamp: new Date().toISOString(), Student_ID: pilotStudentId, Class_ID: pilotClassId, Post_Check_Total: total, Interest_Status: res.interest_status || "" },
    student_patch: { Student_ID: pilotStudentId, Post_Check_Score: total, Interest_Status: res.interest_status || "" },
  });
  return total;
}

/* Kids Entry Assessment: observasi lisan ramah anak 10-15 mnt (tanpa tes tulis).
   Satu pelaksanaan = satu ATM-###### (KOL-POL-COD-001 §3.6). */
function submitEntryAssessment(pilotStudentId, res) {
  const db = loadDB();
  const s = db.MST_STUDENTS.find((x) => (x.pilot_student_id || x.student_id) === pilotStudentId);
  const attemptId = nextId("ATM", db.PILOT_OBSERVATIONS, "attempt_id");
  const oid = nextId("OBS", db.PILOT_OBSERVATIONS, "observation_id");
  const row = { observation_id: oid, attempt_id: attemptId, pilot_student_id: pilotStudentId, ...(res || {}), at: new Date().toISOString() };
  db.PILOT_OBSERVATIONS.push(row);
  if (s) s.current_status = "ASSESSED";
  saveDB(db);
  postSheets({ action: "observation", observation: { Observation_ID: oid, Student_ID: pilotStudentId, ...res, Recorded_At: new Date().toISOString() } });
  return { observation_id: oid, attempt_id: attemptId };
}

function recordObservation(pilotStudentId, pilotClassId, obs) {
  const db = loadDB();
  const oid = nextId("OBS", db.PILOT_OBSERVATIONS, "observation_id");
  const row = { observation_id: oid, pilot_student_id: pilotStudentId, pilot_class_id: pilotClassId, ...obs, at: new Date().toISOString() };
  db.PILOT_OBSERVATIONS.push(row);
  saveDB(db);
  postSheets({ action: "observation", observation: { Observation_ID: oid, Student_ID: pilotStudentId, Class_ID: pilotClassId, ...obs, Recorded_At: new Date().toISOString() } });
  return oid;
}

/* Sheets sync queue (real API adaptor hook).
   KEAMANAN: endpoint HANYA dari config server-side yang di-inject sebagai
   window.KOLASE_SHEETS_ENDPOINT (lihat js/sheets-config.example.js — file
   sheets-config.js TIDAK di-commit). Input URL dari UI publik DIHAPUS;
   localStorage "kolase_sheets_endpoint" tidak lagi dibaca. */
function sheetsEndpoint() {
  return window.KOLASE_SHEETS_ENDPOINT || "";
}
function queueSheetsSync(tab, payload) {
  postSheets({ tab, payload });
}
/* Kirim action/body apa pun ke Apps Script (lihat apps-script/Code.gs).
   Selalu dicatat di antrean localStorage; di-POST hanya jika endpoint diisi. */
function postSheets(body) {
  const endpoint = sheetsEndpoint();
  const q = JSON.parse(localStorage.getItem("kolase_sheets_queue") || "[]");
  q.push({ at: new Date().toISOString(), sent: Boolean(endpoint), body });
  localStorage.setItem("kolase_sheets_queue", JSON.stringify(q));
  // Jika endpoint real diisi (lihat apps-script/DEPLOY.txt), kirim via POST:
  if (endpoint) {
    fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ ...body, key: window.KOLASE_SHEETS_KEY || "" })
    }).catch(() => {});
  }
}

// Sheets real: HANYA via js/sheets-config.js (tidak di-commit, lihat
// sheets-config.example.js) yang di-inject server-side. Jangan simpan URL
// endpoint di localStorage / input UI publik.

/* Materi kelas dari guru: link URL atau file kecil (dataURL ≤1,2MB agar
   muat di localStorage). Dibaca murid sekelas di dashboard. */
function materialsFor(classId) {
  const db = loadDB();
  return (db.MATERIALS || []).filter((m) => m.class_id === classId);
}
function addMaterialLink(classId, title, url) {
  const db = loadDB();
  const u = db.sessionUser;
  if (!u) throw new Error("Login dulu.");
  const t = String(title || "").trim();
  const link = String(url || "").trim();
  if (!classId || !t || !link) throw new Error("Kelas, judul, dan link wajib diisi.");
  const row = { id: nextId("MAT", db.MATERIALS, "id"), class_id: classId, title: t, kind: "link", url: link, name: "", size: 0, by: u.id, at: new Date().toISOString() };
  db.MATERIALS.unshift(row);
  saveDB(db);
  return row;
}
function addMaterialFile(classId, title, dataUrl, name, size) {
  const db = loadDB();
  const u = db.sessionUser;
  if (!u) throw new Error("Login dulu.");
  const t = String(title || "").trim();
  if (!classId || !t || !dataUrl) throw new Error("Kelas, judul, dan file wajib diisi.");
  if (String(dataUrl).length > 1400000) throw new Error("File kebesaran untuk browser ini (maks ~900KB). Pakai link Drive sebagai gantinya.");
  const row = { id: nextId("MAT", db.MATERIALS, "id"), class_id: classId, title: t, kind: "file", url: dataUrl, name: String(name || "materi"), size: Number(size || 0), by: u.id, at: new Date().toISOString() };
  db.MATERIALS.unshift(row);
  try { saveDB(db); } catch (e) { throw new Error("Penyimpanan browser penuh. Hapus materi lama dulu."); }
  return row;
}
function deleteMaterial(id) {
  const db = loadDB();
  db.MATERIALS = (db.MATERIALS || []).filter((m) => m.id !== id);
  saveDB(db);
  return true;
}

/* Chat per murid: 1 thread per STU-XXXXXX. Murid hanya thread sendiri;
   teacher/staff memegang semua thread (daftar + balas). */
function migrateLegacyChat(db) {
  if (!db.CHAT_THREADS || typeof db.CHAT_THREADS !== "object") db.CHAT_THREADS = {};
  if (Array.isArray(db.CHAT) && db.CHAT.length) {
    const u = db.sessionUser;
    const key = (u && u.role === "student") ? u.id : "ARSIP";
    const t = db.CHAT_THREADS[key] || { student_id: key, nama: (u && u.nama) || "Arsip", messages: [], updated_at: new Date().toISOString() };
    db.CHAT.forEach((m) => t.messages.push({ from: m.from === "me" ? "student" : "teacher", text: m.text, at: m.at || "" }));
    t.updated_at = new Date().toISOString();
    db.CHAT_THREADS[key] = t;
    db.CHAT = [];
  }
  return db;
}
function chatThread(sid) {
  const db = migrateLegacyChat(loadDB());
  saveDB(db);
  return db.CHAT_THREADS[sid] || null;
}
function listChatThreads() {
  const db = migrateLegacyChat(loadDB());
  saveDB(db);
  const u = db.sessionUser;
  const PRIV = ["staff", "admin", "owner", "author", "teacher", "founder", "academic", "systems"];
  if (!u || (u.role !== "teacher" && PRIV.indexOf(u.role) === -1)) throw new Error("Khusus teacher/staff.");
  return Object.values(db.CHAT_THREADS).sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
}
function sendChat(text) {
  const db = migrateLegacyChat(loadDB());
  const u = db.sessionUser;
  if (!u || u.role !== "student") throw new Error("Login sebagai student dulu.");
  const v = String(text || "").trim();
  if (!v) throw new Error("Pesan kosong.");
  if (v.length > 1000) throw new Error("Pesan maks. 1000 karakter.");
  const t = db.CHAT_THREADS[u.id] || { student_id: u.id, nama: u.nama, messages: [], updated_at: "" };
  t.student_id = u.id; t.nama = u.nama;
  t.messages.push({ from: "student", text: v, at: new Date().toTimeString().slice(0, 5) });
  if (t.messages.length > 500) t.messages = t.messages.slice(-500);
  t.updated_at = new Date().toISOString();
  db.CHAT_THREADS[u.id] = t;
  saveDB(db);
  return true;
}
function teacherSendChat(sid, text, asStaff) {
  const db = migrateLegacyChat(loadDB());
  const u = db.sessionUser;
  const PRIV = ["staff", "admin", "owner", "author", "teacher", "founder", "academic", "systems"];
  if (!u || (u.role !== "teacher" && PRIV.indexOf(u.role) === -1)) throw new Error("Khusus teacher/staff.");
  const v = String(text || "").trim();
  if (!sid || !v) throw new Error("Tujuan dan pesan wajib diisi.");
  if (v.length > 1000) throw new Error("Pesan maks. 1000 karakter.");
  const t = db.CHAT_THREADS[sid] || { student_id: sid, nama: sid, messages: [], updated_at: "" };
  t.messages.push({ from: asStaff ? "staff" : "teacher", text: v, at: new Date().toTimeString().slice(0, 5) });
  if (t.messages.length > 500) t.messages = t.messages.slice(-500);
  t.updated_at = new Date().toISOString();
  db.CHAT_THREADS[sid] = t;
  saveDB(db);
  return true;
}

/* Pengumuman (announcement): tulis oleh teacher/staff, dibaca semua di home.
   eBadge: terbit otomatis saat trial 7/7 & saat ulasan 1 paket dikirim
   (cermin kolom "Pending badge issuance" di Master Database V2.0). */
function addAnnouncement(title, body) {
  const db = loadDB();
  const u = db.sessionUser;
  const PRIV = ["staff", "admin", "owner", "author", "teacher", "founder", "academic", "systems"];
  if (!u || PRIV.indexOf(u.role) === -1) throw new Error("Khusus teacher/staff.");
  const t = String(title || "").trim();
  const b = String(body || "").trim();
  if (!t || !b) throw new Error("Judul dan isi wajib diisi.");
  if (t.length > 120 || b.length > 1000) throw new Error("Judul maks 120, isi maks 1000 karakter.");
  const row = { id: nextId("ANN", db.ANNOUNCEMENTS, "id"), title: t, body: b, by: u.nama + " • " + u.id, at: new Date().toISOString() };
  db.ANNOUNCEMENTS.unshift(row);
  if (db.ANNOUNCEMENTS.length > 50) db.ANNOUNCEMENTS = db.ANNOUNCEMENTS.slice(0, 50);
  saveDB(db);
  return row;
}
function listAnnouncements() {
  const db = loadDB();
  return (db.ANNOUNCEMENTS || []).slice(0, 20);
}
function deleteAnnouncement(id) {
  const db = loadDB();
  const u = db.sessionUser;
  const PRIV = ["staff", "admin", "owner", "author", "founder", "academic", "systems"];
  if (!u || PRIV.indexOf(u.role) === -1) throw new Error("Khusus staff.");
  db.ANNOUNCEMENTS = (db.ANNOUNCEMENTS || []).filter((a) => a.id !== id);
  saveDB(db);
  return true;
}
function studentNameOf(studentId) {
  const db = loadDB();
  const s = (db.MST_STUDENTS || []).find((x) => x.student_id === studentId);
  return s ? s.nama : studentId;
}
function issueBadge(kind, refId, studentId, label) {
  const db = loadDB();
  if ((db.EBADGES || []).some((b) => b.kind === kind && b.ref_id === refId)) {
    return (db.EBADGES || []).find((b) => b.kind === kind && b.ref_id === refId);
  }
  const row = {
    id: nextId("BDG", db.EBADGES, "id"),
    kind, ref_id: refId, student_id: studentId,
    student_name: studentNameOf(studentId),
    label: label || (kind === "TRIAL" ? "7 Sesi Trial Gratis" : "1 Paket Selesai"),
    at: new Date().toISOString().slice(0, 10),
  };
  db.EBADGES.unshift(row);
  saveDB(db);
  return row;
}
function badgesFor(studentId) {
  const db = loadDB();
  return (db.EBADGES || []).filter((b) => b.student_id === studentId);
}
function pendingBadgeCount() {
  const db = loadDB();
  const issued = new Set((db.EBADGES || []).map((b) => b.kind + "|" + b.ref_id));
  let trial = 0, paket = 0;
  (db.TRIALS || []).forEach((t) => {
    if (trialProgress(t).complete && !issued.has("TRIAL|" + t.trial_id)) trial++;
  });
  (db.CLASS_MEMBERSHIP || []).forEach((m) => {
    if (packageProgress(m.enrollment_id).complete && !issued.has("PAKET|" + m.enrollment_id)) paket++;
  });
  return { trial, paket, total: trial + paket };
}
/* Pemeriksaan ringan ala 99_AUDIT: peringatan sebelum pelaporan. */
function auditWarnings() {
  const db = loadDB();
  const out = [];
  const today = new Date().toISOString().slice(0, 10);
  (db.TXN_PAYMENTS || []).forEach((t) => {
    if (t.status === "PENDING") {
      const age = Math.floor(((Date.now() - new Date(t.tgl || Date.now()).getTime()) / 86400000));
      if (age >= 7) out.push({ level: "WARN", text: `TRX ${t.trx_id} PENDING ${age} hari (ENR ${t.enrollment_id}, Rp ${Number(t.nominal || 0).toLocaleString("id-ID")})` });
    }
  });
  (db.CLASS_MEMBERSHIP || []).forEach((m) => {
    if (m.status === "ACTIVE" && Number(m.sisa || 0) < 0) out.push({ level: "ERROR", text: `Sisa negatif ${m.enrollment_id} (${m.sisa}) — rekonsiliasi ledger (BP-011).` });
  });
  (db.CLASS_SESSIONS || []).forEach((s) => {
    if (s.status === "SCHEDULED" && String(s.tanggal || "") < today) out.push({ level: "WARN", text: `Sesi lewat belum dicatat: ${s.session_id} (${s.class_id} • ${s.tanggal})` });
  });
  (db.TRIALS || []).forEach((t) => {
    if (t.status === "STARTED") {
      const n = (t.sessions || []).filter((x) => x.hadir === "PRESENT" || x.hadir === "LATE").length;
      if (n === 0) {
        const age = Math.floor((Date.now() - new Date(t.sessions && t.sessions[0] ? t.sessions[0].tanggal : Date.now()).getTime()) / 86400000);
        if (age > 30) out.push({ level: "WARN", text: `Trial macet ${t.trial_id} (${t.student_id}, 0/7, >30 hari)` });
      }
    }
  });
  return out.slice(0, 30);
}
function outstandingBalance() {
  const db = loadDB();
  return (db.TXN_PAYMENTS || []).filter((t) => t.status === "PENDING").reduce((a, t) => a + Number(t.nominal || 0), 0);
}

/* Database staff: hapus teacher / student beserta seluruh data terkait. */
function deleteStaff(staffId) {
  requireFullPower();
  if (FULL_POWER_IDS.indexOf(staffId) !== -1) throw new Error("3 ID penuh (ACT-000001/002/003) tidak bisa dihapus.");
  const db = loadDB();
  const before = (db.MST_STAFF || []).length;
  db.MST_STAFF = (db.MST_STAFF || []).filter((r) => r.staff_id !== staffId);
  if (db.MST_STAFF.length === before) throw new Error("Staff tidak ditemukan.");
  if (db.sessionUser && db.sessionUser.id === staffId) db.sessionUser = null;
  saveDB(db);
  return true;
}
function deleteTeacher(teacherId) {
  requireFullPower();
  const db = loadDB();
  const before = (db.MST_TEACHERS || []).length;
  db.MST_TEACHERS = (db.MST_TEACHERS || []).filter((r) => r.teacher_id !== teacherId);
  if (db.MST_TEACHERS.length === before) throw new Error("Teacher tidak ditemukan.");
  saveDB(db);
  return true;
}
function deleteStudent(studentId) {
  requireFullPower();
  const db = loadDB();
  if (!(db.MST_STUDENTS || []).some((r) => r.student_id === studentId)) throw new Error("Student tidak ditemukan.");
  const enrs = new Set((db.CLASS_MEMBERSHIP || []).filter((m) => m.student_id === studentId).map((m) => m.enrollment_id));
  db.MST_STUDENTS = db.MST_STUDENTS.filter((r) => r.student_id !== studentId);
  db.CLASS_MEMBERSHIP = (db.CLASS_MEMBERSHIP || []).filter((m) => m.student_id !== studentId);
  db.TXN_PAYMENTS = (db.TXN_PAYMENTS || []).filter((t) => t.student_id !== studentId);
  db.TXN_ENTITLEMENT_LEDGER = (db.TXN_ENTITLEMENT_LEDGER || []).filter((l) => !enrs.has(l.enrollment_id));
  db.SESSIONS = (db.SESSIONS || []).filter((s) => !enrs.has(s.enrollment_id));
  db.SESSION_ATTENDANCE = (db.SESSION_ATTENDANCE || []).filter((a) => a.student_id !== studentId);
  db.TRIALS = (db.TRIALS || []).filter((t) => t.student_id !== studentId);
  db.PILOT_REGISTRATIONS = (db.PILOT_REGISTRATIONS || []).filter((p) => (p.student_id || p.pilot_student_id) !== studentId);
  db.PILOT_PLACEMENTS = (db.PILOT_PLACEMENTS || []).filter((p) => (p.student_id || p.pilot_student_id) !== studentId);
  db.PILOT_POSTCLASS = (db.PILOT_POSTCLASS || []).filter((p) => (p.student_id || p.pilot_student_id) !== studentId);
  db.PILOT_OBSERVATIONS = (db.PILOT_OBSERVATIONS || []).filter((o) => (o.student_id || o.pilot_student_id) !== studentId);
  db.REVIEWS = (db.REVIEWS || []).filter((r) => r.student_id !== studentId);
  if (db.CHAT_THREADS && db.CHAT_THREADS[studentId]) delete db.CHAT_THREADS[studentId];
  if (db.sessionUser && db.sessionUser.id === studentId) db.sessionUser = null;
  saveDB(db);
  return true;
}
window.KolaseStore = { loadDB, saveDB, registerPerson, portalFor, loginPerson, findUserByLogin, resetPassword, checkout, verifyPayment, recordAttendance, balanceOf, queueSheetsSync, postSheets, sheetsEndpoint, startTrial, trialProgress, recordTrialAttendance, decideTrial, submitReview, packageProgress, eligiblePackages, submitPackageReview, REVIEW_ASPECTS, submitPlacement, submitPostclass, submitEntryAssessment, recordObservation, materialsFor, addMaterialLink, addMaterialFile, deleteMaterial, chatThread, listChatThreads, sendChat, teacherSendChat, deleteTeacher, deleteStudent, deleteStaff, isFullPowerUser, FULL_POWER_IDS, addAnnouncement, listAnnouncements, deleteAnnouncement, issueBadge, badgesFor, pendingBadgeCount, auditWarnings, outstandingBalance };
