/* KOLASE Public Class — interaksi dasar: pilih program, buka stages, pilih stage, daftar. */
(function () {
  const burger = document.getElementById("burger");
  const nav = document.querySelector(".topbar .nav");
  if (burger && nav) {
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

  const optionButtons = Array.from(document.querySelectorAll(".option"));
  const continueBtn = document.getElementById("continueBtn");
  const stagesSection = document.getElementById("stages");
  const selectedSummary = document.getElementById("selectedSummary");
  const stageButtons = Array.from(document.querySelectorAll(".stage"));
  const stageNote = document.getElementById("stageNote");
  const programSelect = document.getElementById("program");
  const stageSelect = document.getElementById("stage");
  const form = document.getElementById("registerForm");
  const formStatus = document.getElementById("formStatus");

  const state = {
    program: "kids",
    programName: "Kids Public Class",
    programPrice: "Rp 50.000 / Siswa",
    stage: "1",
    stageName: "Kids Stage 1 - Explorer"
  };

  function selectProgram(button) {
    optionButtons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle("is-selected", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    state.program = button.dataset.program;
    state.programName = button.dataset.name;
    state.programPrice = button.dataset.price;

    if (selectedSummary) {
      selectedSummary.innerHTML = `Dipilih: <strong>${state.programName}</strong> — ${state.programPrice}`;
    }
    if (programSelect) programSelect.value = state.program;
  }

  function revealStages() {
    if (!stagesSection) return;
    stagesSection.hidden = false;
    stagesSection.classList.remove("is-hidden");
    stagesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectStage(button) {
    stageButtons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    state.stage = button.dataset.stage;
    state.stageName = button.dataset.stageName;
    if (stageSelect) stageSelect.value = state.stage;
    if (stageNote) {
      stageNote.textContent = state.stage === "1"
        ? "Contoh Term di atas memakai Stage 1 — Explorer."
        : `Dipilih: ${state.stageName}. Contoh Term di bawah memakai Stage 1 — Explorer.`;
    }
  }

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => selectProgram(button));
  });

  if (continueBtn) {
    continueBtn.addEventListener("click", revealStages);
  }

  stageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectStage(button);
      document.getElementById("kompetensi").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (programSelect) {
    programSelect.addEventListener("change", () => {
      const match = optionButtons.find((btn) => btn.dataset.program === programSelect.value);
      if (match) selectProgram(match);
    });
  }

  if (stageSelect) {
    stageSelect.addEventListener("change", () => {
      const match = stageButtons.find((btn) => btn.dataset.stage === stageSelect.value);
      if (match) selectStage(match);
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nama = document.getElementById("nama").value.trim();
      const wa = document.getElementById("wa").value.trim();

      if (nama.length < 3) {
        formStatus.textContent = "Isi nama lengkap minimal 3 huruf.";
        return;
      }
      if (!/^[0-9+()\-\s]{9,18}$/.test(wa)) {
        formStatus.textContent = "Isi nomor WhatsApp yang valid.";
        return;
      }
      if (state.program === "adult-teen") {
        formStatus.textContent = "Beginner English (Adult/Teen) COMING SOON — pendaftaran belum dibuka. Silakan pilih Kids Public Class.";
        return;
      }

      formStatus.textContent = `Terima kasih, ${nama}. Pendaftaran ${state.programName} dan ${state.stageName} dicatat. Tim KOLASE akan menghubungi via WhatsApp.`;
      form.reset();
      if (programSelect) programSelect.value = state.program;
      if (stageSelect) stageSelect.value = state.stage;
    });
  }

  // Footer kaya referensi + CTA kontak (sama seperti js/app.js)
  try {
    const year = new Date().getFullYear();
    const fhtml = `<div class="wrap"><div class="kf-card"><div class="kf-grid">`
      + `<div class="kf-brand"><a class="kf-logo" href="home.html"><img src="assets/kolase-logo.png" alt="KOLASE"><span>KOLASE</span></a>`
      + `<p class="kf-tag">Belajar Bahasa Inggris 4 sesi, terjadwal &amp; terukur. Kids &amp; Beginner, Google Meet, QRIS / VA / E-Wallet.</p>`
      + `<ul class="kf-contact">`
      + `<li><a href="mailto:kolaseenglish@gmail.com"><span class="kf-ico">✉</span><span>kolaseenglish@gmail.com</span></a></li>`
      + `<li><a href="https://wa.me/628131191163" target="_blank" rel="noopener"><span class="kf-ico">☎</span><span>+62 813 1191 163</span></a></li>`
      + `<li><a href="https://www.instagram.com/kolaseacademy?stkn=a3RicXlmbnFwaWhk" target="_blank" rel="noopener"><span class="kf-ico">◎</span><span>@kolaseacademy</span></a></li>`
      + `</ul><div class="kf-cta"><a class="btn btn-brand btn-sm" href="mailto:kolaseenglish@gmail.com">Email Kami</a>`
      + `<a class="btn btn-ghost btn-sm" href="https://wa.me/628131191163" target="_blank" rel="noopener">Chat WA</a></div></div>`
      + `<nav class="kf-col" aria-label="Home"><h4>Home</h4><ul><li><a href="home.html">Home</a></li><li><a href="catalog.html">Katalog</a></li><li><a href="public-class.html">Public Class</a></li></ul></nav>`
      + `<nav class="kf-col" aria-label="About Us"><h4>About Us</h4><ul><li><a href="tim.html">Tim Kami</a></li><li><a href="ownership.html">Ownership</a></li><li><a href="trust-legal.html">Terms &amp; Privacy</a></li></ul></nav>`
      + `<nav class="kf-col" aria-label="Academics"><h4>Academics</h4><ul><li><a href="dashboard.html">Dashboard</a></li><li><a href="schedule.html">Kalender</a></li><li><a href="teacher-chat.html">Chat Guru</a></li></ul></nav>`
      + `<nav class="kf-col" aria-label="Contact Us"><h4>Contact Us</h4><ul><li><a href="mailto:kolaseenglish@gmail.com">Information</a></li><li><a href="https://www.instagram.com/kolaseacademy?stkn=a3RicXlmbnFwaWhk" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://wa.me/628131191163" target="_blank" rel="noopener">Map &amp; Direction</a></li></ul></nav>`
      + `</div><div class="kf-bottom"><div class="kf-legal"><a href="trust-legal.html">Terms of Service</a><span>|</span><a href="trust-legal.html">Privacy Policy</a><span>|</span><a href="trust-legal.html">Cookie Policy</a></div>`
      + `<div class="kf-social"><a href="mailto:kolaseenglish@gmail.com" aria-label="Email">✉</a>`
      + `<a href="https://wa.me/628131191163" target="_blank" rel="noopener" aria-label="WhatsApp">☎</a>`
      + `<a href="https://www.instagram.com/kolaseacademy?stkn=a3RicXlmbnFwaWhk" target="_blank" rel="noopener" aria-label="Instagram">◎</a></div></div>`
      + `<div class="kf-copy">Copyright © ${year} KOLASE Academy. All rights reserved.</div>`
      + `</div></div>`;
    document.querySelectorAll("footer").forEach((f) => {
      f.classList.add("kolase-footer");
      f.innerHTML = fhtml;
    });
  } catch (e) {}
})();
