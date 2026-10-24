/* Shared UI: footer, catalog render, copy buttons, sheets queue badge */
function renderKolaseFooter() {
  const html = `<div class="wrap"><div class="kf-card"><div class="kf-grid">`
    + `<div class="kf-brand"><a class="kf-logo" href="home.html"><img src="assets/kolase-wordmark-black.png" alt="KOLASE English Academy"></a>`
    + `<p class="kf-tag">We believe in the power of play to foster creativity, problem-solving skills, and imagination.</p>`
    + `<ul class="kf-contact">`
    + `<li><a href="mailto:kolaseenglish@gmail.com"><span class="kf-ico">✉</span><span>kolaseenglish@gmail.com</span></a></li>`
    + `<li><a href="https://wa.me/628131191163" target="_blank" rel="noopener"><span class="kf-ico">☎</span><span>+62 813 1191 163</span></a></li>`
    + `<li><a href="https://www.instagram.com/kolaseacademy?stkn=a3RicXlmbnFwaWhk" target="_blank" rel="noopener"><span class="kf-ico">◎</span><span>@kolaseacademy</span></a></li>`
    + `</ul></div>`
    + `<nav class="kf-col" aria-label="Home"><h4>Home</h4><ul><li><a href="#">Features</a></li><li><a href="#">Our Testimonials</a></li><li><a href="#">FAQ</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="About Us"><h4>About Us</h4><ul><li><a href="#">Our Mission</a></li><li><a href="#">Our Vision</a></li><li><a href="#">Awards and Recognitions</a></li><li><a href="#">History</a></li><li><a href="#">Teachers</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="Academics"><h4>Academics</h4><ul><li><a href="#">Special Features</a></li><li><a href="#">Gallery</a></li><li data-fullpower-only><a href="direktori.html">Direktori Anggota</a></li></ul></nav>`
    + `<nav class="kf-col" aria-label="Contact Us"><h4>Contact Us</h4><ul><li><a href="mailto:kolaseenglish@gmail.com">Information</a></li><li><a href="https://maps.google.com/?q=Tangerang,Indonesia" target="_blank" rel="noopener">Map &amp; Direction</a></li></ul></nav>`
    + `</div><div class="kf-bottom"><div class="kf-legal"><a href="trust-legal.html">Terms of Service</a><span>|</span><a href="trust-legal.html">Privacy Policy</a><span>|</span><a href="trust-legal.html">Cookie Policy</a></div>`
    + `</div>`
    + `<div class="kf-copy">© 2026 KOLASE English Academy — In Your Voice We Trust</div>`
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
  // Footer: link khusus 3 ID penuh disembunyikan dari peran lain.
  try {
    var raw = localStorage.getItem("kolase_db_v1");
    var su = (raw && JSON.parse(raw).sessionUser) || null;
    var ok = su && ["founder", "academic", "systems"].indexOf(su.role) !== -1;
    document.querySelectorAll("footer [data-fullpower-only]").forEach(function (el) {
      el.style.display = ok ? "" : "none";
    });
  } catch (e) {}
}
function uiT(key) {
  try { if (window.KolaseI18n) return KolaseI18n.t(key); } catch (e) {}
  return key;
}
document.addEventListener("DOMContentLoaded", () => {
  try { renderKolaseFooter(); } catch (e) {}
  // Remember-me: bila login TANPA centang, sesi berakhir saat browser ditutup.
  // Deteksi sesi browser baru via sessionStorage (hilang saat browser ditutup).
  try {
    if (sessionStorage.getItem("kolase_remember") === "0" && !sessionStorage.getItem("kolase_alive")) {
      const raw = localStorage.getItem("kolase_db_v1");
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.sessionUser) {
          d.sessionUser = null;
          localStorage.setItem("kolase_db_v1", JSON.stringify(d));
          if (window.KolaseNav) { KolaseNav.render(); KolaseNav.markActive(); }
        }
      }
    }
    sessionStorage.setItem("kolase_alive", "1");
  } catch (e) {}
  // RBAC route guard — workflow box 1 Strict Segregation.
  // Halaman yang dijaga memakai <body data-guard="student,teacher"> dst.
  const need = (document.body.getAttribute("data-guard") || "").split(",").map((s) => s.trim()).filter(Boolean);
  // Peran internal bebas akses semua page/fitur. Siswa tetap dibatasi halamannya.
  const PRIVILEGED = ["staff", "admin", "owner", "author", "teacher", "founder", "academic", "systems"];
  const FULL_POWER_ROLES = ["founder", "academic", "systems"];
  if (need.length) {
    let u = null;
    try { u = (JSON.parse(localStorage.getItem("kolase_db_v1") || "null") || {}).sessionUser || null; } catch (e) { u = null; }
    const page = (location.pathname.split("/").pop() || "home.html").split("?")[0].split("#")[0];
    const here = page + location.search + location.hash;
    if (!u) { location.replace("login.html?notice=login&next=" + encodeURIComponent(here)); return; }
    // Direktori hanya untuk 3 ID penuh, walau peran internal lain punya akses global.
    if (page === "direktori.html" && FULL_POWER_ROLES.indexOf(u.role) === -1) {
      const dest = window.KolaseStore ? KolaseStore.portalFor(u.role) : "dashboard.html";
      if (page !== dest.split("?")[0]) location.replace(dest);
      return;
    }
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
  // Keluar global: hapus sesi saja (data tetap), lalu ke home.
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
  if (grid && grid.dataset.manual !== "true") {
    fetch("data/classes.json").then((r) => r.json()).then((classes) => {
      const params = new URLSearchParams(location.search);
      const level = grid.dataset.level || params.get("level") || "";
      const max = Number(params.get("max") || 0);
      const list = classes.filter((c) =>
        (!level || c.level === level) && (!max || Number(c.harga) <= max)
      );
      grid.innerHTML = list.map(cardHTML).join("");
    });
  }
});

function cardHTML(c) {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const open = (c.class_status || "OPEN") === "OPEN";
  const hasPkg = Array.isArray(c.packages) && c.packages.length > 0;
  const harga = Number(c.harga) || 0;
  const hargaMax = Number(c.harga_max) || 0;
  const hargaCoret = Number(c.harga_coret) || 0;
  const isKids = c.level === "KIDS";
  const sesiNum = c.sesi_label || String(c.sesi_count ?? 4);
  const sesiText = hasPkg ? `Pilih ${sesiNum} sesi` : `${sesiNum} sesi`;
  const durasi = `${Number(c.duration_minutes) || 60} menit / sesi`;
  const kuota = Number(c.kuota) || 0;
  const minSiswa = Number(c.min_students) || 0;
  const kapasitas = kuota && kuota <= 10
    ? (minSiswa ? `${minSiswa}–${kuota} anak` : `Maks. ${kuota} anak`)
    : kuota ? `Hingga ${kuota} peserta` : "Kelas kecil";
  const usia = c.usia_label || (isKids ? "Usia 6–12 Tahun" : "Usia 13+");
  const cocok = c.cocok_label ? `<span class="cc-tag">${esc(c.cocok_label)}</span>` : "";
  const trial = c.trial ? `<span class="cc-tag cc-tag-trial">Kelas Percobaan</span>` : "";
  const outcome = c.outcome || (Array.isArray(c.learn) && c.learn[0]) || "";
  const priceMain = hasPkg && hargaMax > harga
    ? `${rp(harga)} – ${rp(hargaMax)}`
    : rp(harga);
  const priceNote = hargaCoret > 0
    ? `<s>Normal ${rp(hargaCoret)}</s>`
    : c.harga_alumni ? `Alumni ${rp(c.harga_alumni)}`
      : (c.kategori === "PUBLIC" ? "per peserta" : "per paket");
  const primaryHref = hasPkg
    ? `class-details.html?id=${c.id}#paket`
    : `checkout.html?id=${c.id}`;
  const primary = open
    ? `<a class="btn btn-brand btn-sm cc-cta" href="${primaryHref}">Pilih Kelas Ini</a>`
    : `<span class="pill p-pending">${uiT("card.soon")}</span>`;
  return `<article class="card class-card${isKids ? "" : " is-teen"}">
    <div class="cc-head"><span class="cc-age">${esc(usia)}</span>${cocok}${trial}</div>
    <h3>${esc(c.nama)}</h3>
    <div class="cc-facts">
      <div><b>${esc(sesiText)}</b><span>Durasi ${durasi}</span></div>
      <div><b>${esc(kapasitas)}</b><span>${esc(c.jadwal || "")}</span></div>
    </div>
    <div class="cc-outcome"><b>Manfaat belajar</b><p>${esc(outcome)}</p></div>
    <div class="cc-foot">
      <div class="cc-price">${priceMain}<span>${priceNote}</span></div>
      ${primary}
    </div>
    <a class="cc-more" href="class-details.html?id=${c.id}">Lihat detail &amp; silabus →</a>
  </article>`;
}
