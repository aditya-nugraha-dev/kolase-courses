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
    { t: "Kurikulum & Cara Belajar", d: "Panduan kurikulum Kids & Teen yang dipakai guru.", href: "https://drive.google.com/drive/folders/1jcmyEXSeqxvtVR5ABrfgmrtUkEZ0wcLK" },
    { t: "Buku & Referensi Belajar", d: "Buku pendamping English for Everyone Level 1–2.", href: "https://drive.google.com/drive/folders/1CMSCIZ-DwgSYzGl0ahGLwVdSnbStBS_-" },
    { t: "Bahan Latihan di Rumah", d: "Lembar latihan dan aktivitas yang bisa dipakai di rumah.", href: "https://drive.google.com/drive/folders/1Hv_1Lv8nbRBlR46JKWOqDj-ArGjXe5vh" },
    { t: "Galeri & Media Kelas", d: "Foto, poster, dan media belajar KOLASE.", href: "https://drive.google.com/drive/folders/1mBGXZGps5loyQfllEFi_9adOoWbN2pjG" },
    { t: "Artikel & Konten Orang Tua", d: "Tips belajar dan kabar terbaru KOLASE.", href: "https://drive.google.com/drive/folders/1TTGcJUAuRCXEu60q1pwCo2eBZ9pBH7df" }
  ];
  const INFO = [
    { t: "Panduan Pendaftaran & Asesmen", d: "Alur daftar dan penempatan kelas anak — tanpa tes yang memberatkan.", href: "https://docs.google.com/document/d/1CvhgweAMjM8Icq6IdvfQPmAXnRyq9s93NHqLql9ktf4/view" },
    { t: "Panduan Kelas & Perjalanan Anak", d: "Apa yang terjadi di kelas dan bagaimana perkembangan anak dipantau.", href: "https://docs.google.com/document/d/1MZt4omWlGgnLdBoxf5Bz6ujZJbU56pSMyhM8sk5s8lA/view" },
    { t: "Pilih Kelas & Public Class", d: "Lihat kelas dan daftar langsung di website.", href: "catalog.html" }
  ];

  function ext(href) {
    return /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener"' : "";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  // Kartu video anti-error: thumbnail Drive + tonton di tab Drive (iframe
  // preview sering diblokir sehingga menampilkan "Terjadi error saat memutar").
  // Bila thumbnail gagal (file belum publik), tampil placeholder + tombol tonton.
  function showcaseCard(v) {
    const view = `https://drive.google.com/file/d/${v.id}/view`;
    const thumb = `https://drive.google.com/thumbnail?id=${v.id}&sz=w1000`;
    return `<div class="card video-card"><a href="${view}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">`
      + `<div class="video-frame" style="position:relative">`
      + `<img src="${thumb}" alt="${esc(v.t)}" loading="lazy" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
      + `<span style="display:none;align-items:center;justify-content:center;aspect-ratio:16/9;background:#203248;color:#fff;font-weight:800;font-size:15px">▶ ${esc(v.t)}</span>`
      + `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none"><span style="width:56px;height:56px;border-radius:50%;background:#b29e84ee;color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center">▶</span></span>`
      + `</div></a>`
      + `<b>${esc(v.t)}</b><p class="small" style="margin:4px 0 8px">${esc(v.d)}</p>`
      + `<a class="btn btn-brand btn-sm" href="${view}" target="_blank" rel="noopener">▶ Tonton di Drive</a></div>`;
  }
  function docCard(x) {
    return `<div class="card"><h3>${x.t}</h3><p class="small">${x.d}</p>`
      + `<a class="btn btn-ghost btn-sm" href="${x.href}"${ext(x.href)}>Buka →</a></div>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sc = document.querySelector("[data-drive-showcase]");
    if (sc) { sc.innerHTML = SHOWCASE.map(showcaseCard).join(""); }
    const mm = document.querySelector("[data-drive-materi]");
    if (mm) mm.innerHTML = MATERI.map(docCard).join("");
    const ii = document.querySelector("[data-drive-info]");
    if (ii) ii.innerHTML = INFO.map(docCard).join("");
  });
})();
