/* Shared UI: nav, catalog render, copy buttons, sheets queue badge */
document.addEventListener("DOMContentLoaded", () => {
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
