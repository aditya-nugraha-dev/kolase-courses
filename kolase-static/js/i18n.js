/* KOLASE i18n — kamus Indonesia (toggle EN dihapus; terjemahan via Google Translate).
   Pakai: <span data-i18n="nav.home"></span> (HTML), placeholder via
   data-i18n-ph="key", aria-label via data-i18n-aria="key".
   Bahasa tersimpan di localStorage "kolase_lang". Kamus bertambah tinggal
   tambah key di bawah + atribut data-i18n di HTML. */
(function () {
  var DICT = {
    id: {
      "nav.home": "Home", "nav.katalog": "Katalog", "nav.roadmap": "Jalur Belajar",
      "nav.masuk": "Masuk", "nav.masukDaftar": "Masuk / Daftar", "nav.dashboard": "Dashboard",
      "nav.chat": "Chat", "nav.chatGuru": "Chat Guru", "nav.chatTeacher": "Chat Teacher",
      "nav.profil": "Profil", "nav.portal": "Portal", "nav.materi": "Materi",
      "nav.jadwal": "Jadwal", "nav.kelas": "Kelas",       "nav.teacher": "Teacher",
      "nav.staff": "Staff", "nav.direktori": "Direktori",
      "nav.lms": "LMS Anak",
      "dir.title": "Direktori Anggota",
      "dir.desc": "Student, teacher, dan peran lain yang terdaftar di website. Khusus 3 ID penuh — kelola & hapus data langsung dari sini.",
      "dir.delete": "Hapus",
      "dir.del.confirm": "Hapus permanen beserta seluruh datanya? Tindakan ini tidak bisa dibatalkan.",
      "dir.c.student": "Student", "dir.c.teacher": "Teacher", "dir.c.staff": "Staff & Pimpinan",
      "dir.search": "Cari nama / ID…", "dir.all": "Semua", "dir.staff": "Staff",
      "hero.title": "Belajar Bahasa Inggris, Terjadwal & Terukur.",
      "hero.desc": 'Kids Public 4 sesi, Kids Term 10 sesi, Beginner 13+ 4 sesi, Small Group 6–45 sesi. ID permanen <span class="id-mono">STU-XXXXXX</span>, kuota ledger otomatis, sinkron Google Sheets + Calendar.',
      "hero.badge1": "Kids & Beginner", "hero.badge2": "Google Meet",
      "hero.badge3": "Chat Guru", "hero.badge4": "QRIS / VA / E-Wallet",
      "hero.catalog": "Lihat Katalog", "hero.register": "Daftar Gratis",
      "hero.sesi": "sesi/paket", "hero.mulai": "mulai", "hero.idperm": "ID permanen",
      "sec.populer": "Kelas Populer",
      "sec.roadmap": "Jalur Belajar",
      "sec.roadmap.d": "Selesai satu tahap, otomatis tahu lanjut ke kelas mana.",
      "sec.roadmap.cta": "Lihat Katalog Resmi →",
      "sec.populer.hint": "Geser ke samping di HP • Grid 3 kolom di desktop.",
      "sec.cara": "Cara Kami Mengajar",
      "sec.galeri.hint": "Ketuk gambar untuk buka ukuran penuh.",
      "sec.visi": "Visi & Misi",
      "sec.visi.desc": "Tujuan dan harapan kami dalam membangun peradaban berbasis ilmu pengetahuan. Ketuk gambar untuk buka ukuran penuh.",
      "sec.ulasan": "Ulasan Siswa",
      "sec.ulasan.desc": "Ditulis siswa yang menyelesaikan 1 paket (semua sesi). Selesaikan paketmu untuk ikut mengulas — nilai Kelas, Guru, Pembelajaran & Materi.",
      "sec.showcase": "Persembahan Pembelajaran",
      "sec.showcase.desc": "Intip suasana belajar dari layanan KOLASE — Public Class, Little Explorers (6–8 Tahun), hingga Young Speakers (9–12 Tahun).",
      "sec.showcase.katalog": "Lihat Katalog", "sec.showcase.public": "Ikut Public Class",
      "sec.materi": "Materi & Bahan Belajar Anak",
      "sec.materi.desc": "Buku, lembar latihan, dan bahan yang dipakai guru — supaya Ayah/Bunda bisa ikut mendampingi di rumah.",
      "sec.info": "Panduan untuk Orang Tua",
      "sec.info.desc": "Cara mendaftar, alur kelas, dan hal yang perlu disiapkan sebelum anak mulai belajar.",
      "sec.siap": "Siap mulai?",
      "sec.siap.desc": "Daftar 1 menit, ID permanen langsung jadi.",
      "sec.siap.btn": "Daftar Sekarang",
      "card.detail": "Lihat Detail", "card.checkout": "Checkout",
      "card.package": "Pilih Paket", "card.soon": "COMING SOON",
      "cat.title": "Katalog Kelas",
      "cat.desc": "Desktop: filter sidebar • Mobile: filter bottom-sheet.",
      "cat.filter": "Filter", "cat.level": "Level", "cat.all": "Semua",
      "cat.maxprice": "Harga maks", "cat.apply": "Terapkan",
      "cat.filterm": "Filter Kelas", "cat.show": "Tampilkan",
      "detail.structure": "Struktur Paket",
      "detail.ledger": "Ledger Otomatis", "detail.ledger.d": "Hadir → −1 sesi, sisa live di dashboard.",
      "detail.chatcal": "Chat + Kalender", "detail.chatcal.d": "Terbuka setelah pembayaran VERIFIED.",
      "detail.th.sesi": "Sesi", "detail.th.tanggal": "Tanggal (proyeksi)",
      "detail.th.topik": "Topik", "detail.th.status": "Status",
      "detail.enroll": "Daftar Kelas Sekarang",
      "detail.back": "← Katalog", "detail.soonmsg": "COMING SOON — pendaftaran belum dibuka",
      "login.title": "Welcome to KOLASE!",
      "login.tab.in": "Masuk", "login.tab.up": "Daftar",
      "login.desc.in": 'Masuk untuk melihat jadwal, chat guru, dan memantau perkembangan anak. ID permanen <span class="id-mono">STU-XXXXXX</span> berlaku seumur hidup.',
      "login.desc.up": 'Satu akun Ayah/Bunda untuk memantau kelas, jadwal, dan perkembangan anak.',
      "login.user": "Gmail", "login.pass": "Password",
      "login.user.ph": "Enter your Gmail",
      "login.pass.ph": "Enter your Password",
      "login.remember": " Remember me", "login.forgot": "Forgot Password?",
      "login.btn": "Login", "login.noacc": "Belum punya akun?",
      "login.reg": "Register", "login.email": "Email Address",
      "login.email.ph": "Enter your Email Address",
      "login.uname": "User name", "login.uname.ph": "Enter your User name",
      "login.newpass.ph": "Enter your Password (min. 4 karakter)",
      "login.wa": "No. WA", "login.role": "Peran",
      "login.role.pick": "Daftar sebagai",
      "login.role.student": "Student", "login.role.student.d": "Murid • ID STU",
      "login.role.teacher": "Teacher", "login.role.teacher.d": "Guru • ID TCH",
      "login.role.staff": "Staff", "login.role.staff.d": "Tim • ID ACT",
      "login.haveacc": "Sudah punya akun?",
      "login.loginlink": "Login",
      "co.title": "Checkout & Payment",
      "co.steps": "<span>1. Ringkasan</span>→<span>2. Bayar (PENDING)</span>→<span>3. Webhook VERIFIED</span>",
      "co.soon.t": "BELUM TERSEDIA",
      "co.soon.d": 'Pendaftaran online untuk paket/kelas ini belum dibuka. Pilih opsi lain atau hubungi tim KOLASE.',
      "co.method": "Metode bayar", "co.pay": "Buat Enrollment + Bayar",
      "co.pay.d": "Membuat <span class=\"id-mono\">ENR-XXXXXX</span> yang mengikat Student ID ↔ Class ID. Status awal PENDING.",
      "co.instr": "Instruksi Pembayaran",
      "co.simulate": "Simulasi Webhook VERIFIED",
      "co.simnote": "Di production: callback Midtrans/Xendit → verifyPayment().",
      "dash.title": "Dashboard E-Learning",
      "dash.review": "Ulasan 1 Paket ★",
      "dash.classarea": "Class Area",
      "dash.materi": "Materi E-Learning per Sesi",
      "dash.materi.d": "Tiap sesi: link GMeet + file materi. Kuis GForm hanya muncul di sesi terakhir.",
      "dash.chat": "Buka Teacher Chat →",
      "dash.kalender": "Kalender",
      "dash.badges": "Badge & Sertifikat Saya",
      "dash.badges.empty": "Belum ada badge. Selesaikan 1 paket + ulasan untuk menerbitkan badge.",
      "ann.label": "Pengumuman",
      "sched.real": "Jadwal Batch (Sumber: Sheets)",
      "sched.real.d": "Jadwal mengajar resmi per batch dari spreadsheet KOLASE. Perubahan jadwal hanya oleh admin.",
      "tp.mysched": "Jadwal Mengajar Saya (Sumber: Sheets)",
      "tp.mysched.d": "Sesi batch yang diampu akun ini. Perubahan jadwal hanya oleh admin.",
      "cert.title": "Sertifikat KOLASE",
      "cert.given": "Diberikan dengan bangga kepada",
      "cert.verify.note": "Verifikasi: cocokkan kode di atas dengan daftar badge di dashboard.",
      "cert.notfound.t": "Sertifikat tidak ditemukan",
      "cert.notfound.d": "Kode tidak cocok dengan badge di browser ini. Buka dari tombol “Lihat & Cetak” di dashboard.",
      "staff.ann": "Pengumuman",
      "staff.ann.d": "Tampil di home untuk semua pengunjung. Maks 50 terbaru.",
      "staff.audit": "Pemeriksaan (Audit)",
      "staff.balance": "Outstanding Balance",
      "staff.badges": "Badge Menunggu"
    },
  };
  var KEY = "kolase_lang";
  // Bahasa dikunci Indonesia — terjemahan diserahkan ke Google Translate browser.
  function getLang() {
    return "id";
  }
  function setLang(v) {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  function t(k) {
    var L = DICT[getLang()] || DICT.id;
    if (k in L) return L[k];
    return DICT.id[k] !== undefined ? DICT.id[k] : k;
  }
  function applyI18n() {
    try { document.documentElement.setAttribute("lang", getLang()); } catch (e) {}
    try {
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        el.innerHTML = t(el.getAttribute("data-i18n"));
      });
      document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
        el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
      });
      document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
        el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
      });
    } catch (e) {}
  }
  document.addEventListener("DOMContentLoaded", applyI18n);
  window.KolaseI18n = { getLang: getLang, setLang: setLang, t: t, apply: applyI18n };
})();
