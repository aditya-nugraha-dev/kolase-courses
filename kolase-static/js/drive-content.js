/* KOLASE Drive content — section Video, Materi, Info di homepage.
   Sumber: KOLASE MASTER (link berbagi Drive). Tambah/edit entri di bawah bila ada konten baru. */
(function () {
  // Section khusus: persembahan pembelajaran dari layanan KOLASE.
  const SHOWCASE = [
    { t: "Founder & Business Lead", d: "Cerita pembelajaran dari layanan KOLASE.", id: "1hJvLyS1dcjlKTSDNyqz9ibavMjYDIF9Z" },
    { t: "Co-Founder & Academic Lead", d: "Cuplikan suasana belajar di kelas KOLASE.", id: "1_lNpv2D0qFi9sqVOEwgsECAEN25SVjup" }
  ];
  // Hanya yang aman publik. Internal (keuangan, data siswa, manual perusahaan) TIDAK ditautkan.
  const MATERI = [
    { t: "Kebijakan Akademik", d: "Master policy Kids & Adult/Teen.", href: "https://drive.google.com/drive/folders/1jcmyEXSeqxvtVR5ABrfgmrtUkEZ0wcLK" },
    { t: "Books & Reference", d: "English for Everyone Level 1–2.", href: "https://drive.google.com/drive/folders/1CMSCIZ-DwgSYzGl0ahGLwVdSnbStBS_-" },
    { t: "Konten Publikasi", d: "Carousel & CNT terbaru.", href: "https://drive.google.com/drive/folders/1TTGcJUAuRCXEu60q1pwCo2eBZ9pBH7df" }
  ];
  const INFO = [
    { t: "SOP Pendaftaran & Asesmen", d: "Alur daftar + placement Kids & Adults (V1.5).", href: "https://docs.google.com/document/d/1CvhgweAMjM8Icq6IdvfQPmAXnRyq9s93NHqLql9ktf4/view" },
    { t: "SOP Kelas & Student Journey", d: "Pelaksanaan kelas (V2.6).", href: "https://docs.google.com/document/d/1MZt4omWlGgnLdBoxf5Bz6ujZJbU56pSMyhM8sk5s8lA/view" },
    { t: "Katalog & Public Class", d: "Lihat kelas & daftar di website.", href: "catalog.html" }
  ];

  function ext(href) {
    return /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener"' : "";
  }
  function showcaseCard(v) {
    return `<div class="card video-card"><div class="video-frame">`
      + `<iframe data-src="https://drive.google.com/file/d/${v.id}/preview" title="${v.t}" allow="autoplay; fullscreen" loading="lazy"></iframe></div>`
      + `<b>${v.t}</b><p class="small" style="margin:4px 0 0">${v.d}</p></div>`;
  }
  // Muat iframe saat di-scroll mendekati layar (hemat kuota + siap diputar).
  // Catatan: browser melarang play otomatis bersuara, jadi tetap perlu 1x klik play.
  function armAutoplay(scope) {
    const frames = (scope || document).querySelectorAll(".video-frame iframe[data-src]");
    if (!frames.length) return;
    const load = (f) => { try { if (!f.src) f.src = f.getAttribute("data-src"); } catch (e) {} f.removeAttribute("data-src"); };
    if (!("IntersectionObserver" in window)) { frames.forEach(load); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } });
    }, { rootMargin: "200px 0px" });
    frames.forEach((f) => io.observe(f));
  }
  function docCard(x) {
    return `<div class="card"><h3>${x.t}</h3><p class="small">${x.d}</p>`
      + `<a class="btn btn-ghost btn-sm" href="${x.href}"${ext(x.href)}>Buka →</a></div>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sc = document.querySelector("[data-drive-showcase]");
    if (sc) { sc.innerHTML = SHOWCASE.map(showcaseCard).join(""); armAutoplay(sc); }
    const mm = document.querySelector("[data-drive-materi]");
    if (mm) mm.innerHTML = MATERI.map(docCard).join("");
    const ii = document.querySelector("[data-drive-info]");
    if (ii) ii.innerHTML = INFO.map(docCard).join("");
  });
})();
