/* Shared UI: nav, catalog render, copy buttons, sheets queue badge */
function renderKolaseFooter() {
  const year = new Date().getFullYear();
  const html = `<div class="wrap"><div class="kf-card"><div class="kf-grid">`
    + `<div class="kf-brand"><a class="kf-logo" href="home.html"><img src="assets/kolase-logo.png" alt="KOLASE"><span>KOLASE</span></a>`
    + `<p class="kf-tag">We believe in the power of play to foster creativity, problem-solving skills, and imagination.</p>`
    + `<ul class="kf-contact">`
    + `<li><a href="mailto:kolaseenglish@gmail.com"><span class="kf-ico">✉</span><span>kolaseenglish@gmail.com</span></a></li>`
    + `<li><a href="https://wa.me/628131191163" target="_blank" rel="noopener"><span class="kf-ico">☎</span><span>+62 813 1191 163</span></a></li>`
    + `<li><a href="https://www.instagram.com/kolaseacademy?stkn=a3RicXlmbnFwaWhk" target="_blank" rel="noopener"><span class="kf-ico">◎</span><span>@kolaseacademy</span></a></li>`
    + `</ul></div>`
    + `<nav class="kf-col" aria-label="Home"><h4>Home</h4><ul><li><a href="#">Features</a></li><li><a href="#">Our Testimonials</a></li><li><a href="#">FAQ</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="About Us"><h4>About Us</h4><ul><li><a href="#">Our Mission</a></li><li><a href="#">Our Vision</a></li><li><a href="#">Awards and Recognitions</a></li><li><a href="#">History</a></li><li><a href="#">Teachers</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="Academics"><h4>Academics</h4><ul><li><a href="#">Special Features</a></li><li><a href="#">Gallery</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="Contact Us"><h4>Contact Us</h4><ul><li><a href="mailto:kolaseenglish@gmail.com">Information</a></li><li><a href="https://maps.google.com/?q=Tangerang,Indonesia" target="_blank" rel="noopener">Map &amp; Direction</a></li></ul></nav>`
    + `</div><div class="kf-bottom"><div class="kf-legal"><a href="trust-legal.html">Terms of Service</a><span>|</span><a href="trust-legal.html">Privacy Policy</a><span>|</span><a href="trust-legal.html">Cookie Policy</a></div>`
    + `</div>`
    + `<div class="kf-copy">Copyright © (${year}) KOLASE Academy. All rights reserved.</div>`
    + `</div></div>`;
  let bars = document.querySelectorAll("footer");
  if (!bars.length) {
    const made = document.createElement("footer");
    document.body.appendChild(made);
    bars = document.querySelectorAll("footer");
  }
  bars.forEach((f) => {
    f.classList.add("kolase-footer");
    f.innerHTML = html;
  });
}
/* Navbar: ganti link "Profil" jadi foto profil saat sudah login.
   Foto dibaca dari sessionUser.photo (diisi halaman Profil) atau baris master. */
function refreshNavAvatar() {
  try {
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const raw = localStorage.getItem("kolase_db_v1");
    const db = raw ? JSON.parse(raw) : null;
    const u = (db && db.sessionUser) || null;
    const link = document.querySelector('[data-nav] a[href="profile.html"]');
    if (!u || !link) return false;
    let photo = u.photo || "";
    if (!photo && db) {
      const tbl = u.role === "student" ? db.MST_STUDENTS : u.role === "teacher" ? db.MST_TEACHERS : db.MST_STAFF;
      const idF = u.role === "student" ? "student_id" : u.role === "teacher" ? "teacher_id" : "staff_id";
      const row = (tbl || []).find((r) => r && r[idF] === u.id);
      if (row && row.photo) photo = row.photo;
    }
    const first = String((u.nama || "?").trim().split(/\s+/)[0] || "?");
    const face = photo
      ? `<img src="${photo}" alt="Foto profil">`
      : `<span class="nav-initial" aria-hidden="true">${esc(first.charAt(0).toUpperCase())}</span>`;
    link.classList.add("nav-avatar");
    link.innerHTML = face + `<span class="nav-uname">${esc(first)}</span>`;
    link.title = `${u.nama} • ${u.id}`;
    return true;
  } catch (e) { return false; }
}
window.KolaseNavAvatar = { refresh: refreshNavAvatar };
/* Navbar per peran — ditulis ulang tiap halaman agar konsisten:
   tamu: Home, Katalog, Kalender, Masuk • student: Dashboard, Kalender, Chat Teacher, Profil
   (tanpa Home; logo → dashboard) • teacher: Dashboard, Chat, Profil
   • staff: semua link student+teacher. Berlaku juga untuk mobile-tabs. */
var ROLE_NAVS = {
  guest: {
    brand: "home.html",
    links: [["home.html", "Home"], ["catalog.html", "Katalog"], ["schedule.html", "Kalender"], ["login.html", "Masuk"]],
    tabs: [["home.html", "Home"], ["catalog.html", "Katalog"], ["schedule.html", "Kalender"], ["login.html", "Masuk"]]
  },
  student: {
    brand: "dashboard.html",
    links: [["dashboard.html", "Dashboard"], ["schedule.html", "Kalender"], ["teacher-chat.html", "Chat Teacher"], ["profile.html", "Profil"]],
    tabs: [["dashboard.html", "Materi"], ["teacher-chat.html", "Chat"], ["schedule.html", "Jadwal"], ["profile.html", "Profil"]]
  },
  teacher: {
    brand: "teacher-portal.html",
    links: [["teacher-portal.html", "Dashboard"], ["teacher-chat.html", "Chat"], ["profile.html", "Profil"]],
    tabs: [["teacher-portal.html", "Kelas"], ["teacher-chat.html", "Chat"], ["schedule.html", "Jadwal"], ["profile.html", "Profil"]]
  },
  staff: {
    brand: "home.html",
    links: [["home.html", "Home"], ["catalog.html", "Katalog"], ["dashboard.html", "Dashboard"], ["schedule.html", "Kalender"], ["teacher-portal.html", "Teacher"], ["staff-portal.html", "Staff"], ["teacher-chat.html", "Chat"], ["profile.html", "Profil"]],
    tabs: [["home.html", "Home"], ["staff-portal.html", "Portal"], ["profile.html", "Profil"]]
  }
};
var STAFF_GROUP = ["staff", "admin", "owner", "author", "founder", "academic", "systems"];
function roleNavKey(role) {
  if (!role) return "guest";
  if (role === "student") return "student";
  if (role === "teacher") return "teacher";
  return "staff";
}
function renderRoleNav() {
  try {
    var db = JSON.parse(localStorage.getItem("kolase_db_v1") || "null");
    var u = (db && db.sessionUser) || null;
    var nav = ROLE_NAVS[roleNavKey(u && u.role)];
    var brand = document.querySelector(".topbar .brand");
    if (brand) brand.setAttribute("href", nav.brand);
    var navEl = document.querySelector("[data-nav]");
    if (navEl) navEl.innerHTML = nav.links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("");
    var tabs = document.querySelector(".mobile-tabs");
    if (tabs) tabs.innerHTML = nav.tabs.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("");
  } catch (e) {}
}
/* CTA global "Trial 7 Sesi Gratis" ([data-trial="CLS-ID"]): student → mulai
   trial lalu ke dashboard; tamu/peran lain → login/register dulu. */
function handleTrialCta(cid) {
  try {
    var db = JSON.parse(localStorage.getItem("kolase_db_v1") || "null");
    var u = (db && db.sessionUser) || null;
    if (!u || u.role !== "student") { location.href = "login.html?mode=register"; return; }
    if (window.KolaseStore && KolaseStore.startTrial) KolaseStore.startTrial(cid);
    location.href = "dashboard.html";
  } catch (err) { alert(err && err.message ? err.message : "Gagal memulai trial."); }
}
document.addEventListener("click", function (e) {
  var b = e.target && e.target.closest ? e.target.closest("[data-trial]") : null;
  if (!b) return;
  e.preventDefault();
  handleTrialCta(b.getAttribute("data-trial"));
});
document.addEventListener("DOMContentLoaded", () => {
  try { renderRoleNav(); } catch (e) {}
  try { renderKolaseFooter(); } catch (e) {}
  try { refreshNavAvatar(); } catch (e) {}
  // RBAC route guard — workflow box 1 Strict Segregation.
  // Halaman yang dijaga memakai <body data-guard="student,teacher"> dst.
  const need = (document.body.getAttribute("data-guard") || "").split(",").map((s) => s.trim()).filter(Boolean);
  // Peran internal bebas akses semua page/fitur. Siswa tetap dibatasi halamannya.
  const PRIVILEGED = ["staff", "admin", "owner", "author", "teacher", "founder", "academic", "systems"];
  if (need.length) {
    let u = null;
    try { u = (JSON.parse(localStorage.getItem("kolase_db_v1") || "null") || {}).sessionUser || null; } catch (e) { u = null; }
    const here = ((location.pathname.split("/").pop() || "home.html").split("?"))[0];
    if (!u) { location.replace("login.html"); return; }
    if (PRIVILEGED.includes(u.role)) { /* akses penuh, lewati guard */ }
    else if (!need.includes(u.role)) {
      const dest = window.KolaseStore ? KolaseStore.portalFor(u.role) : "dashboard.html";
      if (here !== dest.split("?")[0]) location.replace(dest);
      return;
    }
  }
  // Tandai mode login: sembunyikan ajakan login/daftar (khusus pengunjung baru)
  try {
    const u = (JSON.parse(localStorage.getItem("kolase_db_v1") || "null") || {}).sessionUser || null;
    if (u) document.body.classList.add("is-logged-in");
  } catch (e) {}
  // Keluar global: hapus sesi saja (data demo tetap), lalu ke home.
  document.querySelectorAll("[data-logout]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        const raw = localStorage.getItem("kolase_db_v1");
        if (raw) { const db = JSON.parse(raw); db.sessionUser = null; localStorage.setItem("kolase_db_v1", JSON.stringify(db)); }
      } catch (err) {}
      location.replace("home.html");
    });
  });
  // burger pojok kanan atas (HP): toggle dropdown nav
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");
  if (burger && nav) {
    burger.setAttribute("aria-label", "Menu navigasi");
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.textContent = open ? "✕" : "☰";
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "☰";
      }
    });
  }

  // active nav
  const path = location.pathname.split("/").pop() || "home.html";
  document.querySelectorAll("[data-nav] a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  // copy buttons
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const t = btn.getAttribute("data-copy");
      try { await navigator.clipboard.writeText(t); btn.textContent = "Tersalin!"; }
      catch { prompt("Salin manual:", t); }
      setTimeout(() => (btn.textContent = "Salin Kode"), 1500);
    });
  });

  // bottom sheet
  const sheet = document.querySelector("[data-sheet]");
  const scrim = document.querySelector("[data-scrim]");
  document.querySelectorAll("[data-open-sheet]").forEach((b) =>
    b.addEventListener("click", () => { sheet?.classList.add("open"); scrim?.classList.add("open"); }));
  document.querySelectorAll("[data-close-sheet]").forEach((b) =>
    b.addEventListener("click", () => { sheet?.classList.remove("open"); scrim?.classList.remove("open"); }));

  // sheets queue count
  const q = JSON.parse(localStorage.getItem("kolase_sheets_queue") || "[]");
  document.querySelectorAll("[data-sheets-count]").forEach((el) => (el.textContent = q.length));

  // catalog render (catalog.html + home.html [data-catalog])
  const grid = document.querySelector("[data-catalog]");
  if (grid) {
    fetch("data/classes.json").then((r) => r.json()).then((classes) => {
      const level = new URLSearchParams(location.search).get("level") || "";
      const list = level ? classes.filter((c) => c.level === level) : classes;
      grid.innerHTML = list.map(cardHTML).join("");
    });
  }
});

function cardHTML(c) {
  const sesi = c.sesi_count ?? 4;
  const coret = Number(c.harga_coret || 0) > 0 ? `<s>Rp ${Number(c.harga_coret).toLocaleString("id-ID")}</s>` : ``;
  const open = (c.class_status || "OPEN") === "OPEN";
  const cta = open
    ? `<a class="btn btn-ghost btn-sm" href="checkout.html?id=${c.id}">Checkout</a>`
    : `<span class="pill p-pending">COMING SOON</span>`;
  const trial = open ? `<button class="btn btn-ghost btn-sm" data-trial="${c.id}">🎁 Trial 7 Sesi</button>` : ``;
  return `<div class="card">
    <div class="meta"><span class="pill p-verified">${c.level}</span><span>${c.jadwal}</span>${open ? `` : `<span class="pill p-pending">COMING SOON</span>`}</div>
    <h3>${c.nama}</h3>
    <div class="small">${c.guru} • ${c.kuota} kursi • ${sesi} sesi</div>
    <div style="margin:8px 0"><span class="price">Rp ${Number(c.harga).toLocaleString("id-ID")}</span>${coret}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <a class="btn btn-brand btn-sm" href="class-details.html?id=${c.id}">Lihat Detail</a>
      ${cta}
      ${trial}
    </div>
  </div>`;
}
