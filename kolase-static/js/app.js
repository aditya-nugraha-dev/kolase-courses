/* Shared UI: nav, catalog render, copy buttons, sheets queue badge */
function renderKolaseFooter() {
  const year = new Date().getFullYear();
  const FB = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>`;
  const TW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.7-.8-1.8-1.3-3-1.3-2.3 0-4.1 1.8-4.1 4.1 0 .3 0 .6.1.9-3.4-.2-6.4-1.8-8.4-4.3-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4-.3.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8-1.4 1.1-3.1 1.7-5 1.7-.3 0-.6 0-1-.1 1.8 1.1 3.9 1.8 6.2 1.8 7.4 0 11.4-6.1 11.4-11.4 0-.2 0-.3 0-.5.8-.5 1.4-1.2 2-1.9z"/></svg>`;
  const IN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.8v12H2.7v-12h3.8zM4.6 2.5c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2-2.2-1-2.2-2.2 1-2.2 2.2-2.2zm7.2 6.3h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6v6.7h-3.8v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6.1h-3.5V8.8z"/></svg>`;
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
    + `<div class="kf-social"><a href="#" aria-label="Facebook" title="Facebook">${FB}</a>`
    + `<a href="#" aria-label="Twitter" title="Twitter">${TW}</a>`
    + `<a href="#" aria-label="LinkedIn" title="LinkedIn">${IN}</a></div></div>`
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
document.addEventListener("DOMContentLoaded", () => {
  try { renderKolaseFooter(); } catch (e) {}
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
  return `<div class="card">
    <div class="meta"><span class="pill p-verified">${c.level}</span><span>${c.jadwal}</span>${open ? `` : `<span class="pill p-pending">COMING SOON</span>`}</div>
    <h3>${c.nama}</h3>
    <div class="small">${c.guru} • ${c.kuota} kursi • ${sesi} sesi</div>
    <div style="margin:8px 0"><span class="price">Rp ${Number(c.harga).toLocaleString("id-ID")}</span>${coret}</div>
    <div style="display:flex;gap:8px;align-items:center">
      <a class="btn btn-brand btn-sm" href="class-details.html?id=${c.id}">Lihat Detail</a>
      ${cta}
    </div>
  </div>`;
}
