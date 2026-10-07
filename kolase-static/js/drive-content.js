/* KOLASE Drive content — section Video, Materi, Info di homepage.
   Sumber: KOLASE MASTER (link berbagi Drive). Tambah/edit entri di bawah bila ada konten baru. */
(function () {
  const VIDEOS = [
    { t: "Story 1", id: "1pi-8Pa_7LPvxtAkJePWTRNs54oOKjpXG" },
    { t: "Story Line CNT-000005", id: "1lJLt8bt3Ee8ZrzFARK6UcFO3wpt7-48H" },
    { t: "CNT-000019", id: "1_lNpv2D0qFi9sqVOEwgsECAEN25SVjup" },
    { t: "Konten Galang", id: "1hJvLyS1dcjlKTSDNyqz9ibavMjYDIF9Z" }
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
  function videoCard(v) {
    return `<div class="card video-card"><div class="video-frame">`
      + `<iframe src="https://drive.google.com/file/d/${v.id}/preview" title="${v.t}" allow="autoplay; fullscreen" loading="lazy"></iframe></div>`
      + `<b>${v.t}</b><div><a class="small" href="https://drive.google.com/file/d/${v.id}/view" target="_blank" rel="noopener">Buka di Drive →</a></div></div>`;
  }
  function docCard(x) {
    return `<div class="card"><h3>${x.t}</h3><p class="small">${x.d}</p>`
      + `<a class="btn btn-ghost btn-sm" href="${x.href}"${ext(x.href)}>Buka →</a></div>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const vv = document.querySelector("[data-drive-videos]");
    if (vv) vv.innerHTML = VIDEOS.map(videoCard).join("");
    const mm = document.querySelector("[data-drive-materi]");
    if (mm) mm.innerHTML = MATERI.map(docCard).join("");
    const ii = document.querySelector("[data-drive-info]");
    if (ii) ii.innerHTML = INFO.map(docCard).join("");
  });
})();
