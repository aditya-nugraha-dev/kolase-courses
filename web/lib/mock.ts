// Mock data KOLASE Master — dipakai landing + dashboard preview.
// Format ID: STU-XXXXXX (siswa seumur hidup), CLS-XXXXXX (kelas pilot), ATM-###### (attempt).

export type A2Fit = "A2_CONFIRMED" | "PLACEMENT_PENDING" | "OTHER_LEVEL";
export type AttStatus = "ATTENDED" | "NO_SHOW" | "" ;
export type CurrentStatus = "REGISTERED" | "ASSIGNED" | "COMPLETED";

export interface StudentRow {
  studentId: string;
  fullName: string;
  preferredName: string;
  email: string;
  wa: string;
  placementScore: number | null; // 0-50
  preCheck: number | null; // 0-10
  postCheck: number | null; // 0-10
  gainScore: number | null; // post - pre
  a2Fit: A2Fit;
  classId: string;
  attendance: AttStatus;
  status: CurrentStatus;
  domicile: string;
}

export interface ClassRow {
  classId: string;
  name: string;
  schedule: string;
  teacher: string;
  slots: string;
  status: "OPEN" | "FULL" | "COMING_SOON";
}

export const MOCK_STUDENTS: StudentRow[] = [
  {
    studentId: "STU-000001",
    fullName: "Siswa Demo",
    preferredName: "Demo",
    email: "siswa@demo.id",
    wa: "0812000001",
    placementScore: 35,
    preCheck: 6,
    postCheck: 8,
    gainScore: 2,
    a2Fit: "A2_CONFIRMED",
    classId: "CLS-000001",
    attendance: "ATTENDED",
    status: "COMPLETED",
    domicile: "Tangerang",
  },
  {
    studentId: "STU-000002",
    fullName: "Aisyah Rahma",
    preferredName: "Aisyah",
    email: "aisyah.rahma@mail.id",
    wa: "081234567890",
    placementScore: 28,
    preCheck: 5,
    postCheck: 7,
    gainScore: 2,
    a2Fit: "A2_CONFIRMED",
    classId: "CLS-000001",
    attendance: "ATTENDED",
    status: "ASSIGNED",
    domicile: "Jakarta",
  },
  {
    studentId: "STU-000003",
    fullName: "Bagas Pratama",
    preferredName: "Bagas",
    email: "bagas.p@mail.id",
    wa: "081298765432",
    placementScore: 18,
    preCheck: 4,
    postCheck: null,
    gainScore: null,
    a2Fit: "PLACEMENT_PENDING",
    classId: "CLS-000002",
    attendance: "",
    status: "REGISTERED",
    domicile: "Bekasi",
  },
  {
    studentId: "STU-000004",
    fullName: "Citra Lestari",
    preferredName: "Citra",
    email: "citra.l@mail.id",
    wa: "081255501122",
    placementScore: 44,
    preCheck: 8,
    postCheck: 9,
    gainScore: 1,
    a2Fit: "OTHER_LEVEL",
    classId: "CLS-000002",
    attendance: "NO_SHOW",
    status: "COMPLETED",
    domicile: "Depok",
  },
];

export const MOCK_CLASSES: ClassRow[] = [
  {
    classId: "CLS-000001",
    name: "A2 Pilot — My Weekend (Past Simple)",
    schedule: "Sabtu 10:00 WIB • 90 menit • Google Meet",
    teacher: "Mr. Galang",
    slots: "4/5 terisi",
    status: "OPEN",
  },
  {
    classId: "CLS-000002",
    name: "A2 Pilot — My Weekend (Batch 2)",
    schedule: "Minggu 13:00 WIB • 90 menit • Google Meet",
    teacher: "Mr. Hilal",
    slots: "3/5 terisi",
    status: "OPEN",
  },
  {
    classId: "CLS-00000001",
    name: "A2 Discovery — Showcase + Feedback",
    schedule: "Segera diumumkan • 90 menit",
    teacher: "Tim KOLASE",
    slots: "Menunggu matching",
    status: "COMING_SOON",
  },
];

// Kurikulum A2 15 sesi (ringkas dari ENGLISH CURRICULUM KOLASE 1.0)
export const A2_CURRICULUM = [
  { sesi: 1, tema: "Introductions & Placement", output: "Berani perkenalan diri tanpa canggung" },
  { sesi: 2, tema: "Daily Routines (Present Simple)", output: "Menceritakan aktivitas harian" },
  { sesi: 3, tema: "Family & Describing People", output: "Mendeskripsikan orang terdekat" },
  { sesi: 4, tema: "Food & Ordering", output: "Simulasi memesan makan sopan" },
  { sesi: 5, tema: "My Weekend (Past Simple) — PILOT", output: "Recount 4–6 kalimat + speaking 60–90 detik" },
  { sesi: 6, tema: "Directions & Places in Town", output: "Memberi & memahami petunjuk arah" },
  { sesi: 7, tema: "Shopping & Comparing", output: "Membandingkan 2 pilihan + negosiasi" },
  { sesi: 8, tema: "Mini Alur KOLASE #1 — Kota vs Desa", output: "Mendengar 2 sudut pandang tanpa menghakimi" },
];

export const SCHEDULE_OPTIONS = [
  "Sabtu 10:00 WIB (Pilot Batch 1)",
  "Minggu 13:00 WIB (Pilot Batch 2)",
  "Weekday Malam (menunggu kuota)",
];

// Akun demo PREVIEW (dipakai bila database belum tersambung).
// Email di bawah ini publik — hanya untuk coba-coba, bukan data asli.
export interface TeacherRow {
  teacherId: string; // TCH-XXXXXX
  nama: string;
  email: string;
}

export interface StaffRow {
  staffId: string; // ACT-XXXXXX
  nama: string;
  email: string;
}

export const MOCK_TEACHERS: TeacherRow[] = [
  { teacherId: "TCH-000002", nama: "Galang", email: "galang@kolase.id" },
];

export const MOCK_STAFF: StaffRow[] = [
  { staffId: "ACT-000001", nama: "Mohammad Ahrenz Galang Maharsi", email: "kolaseenglish@gmail.com" },
];
