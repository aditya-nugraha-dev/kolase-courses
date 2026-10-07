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

  // Footer plek referensi (sama seperti js/app.js)
  try {
    const year = new Date().getFullYear();
    const FB = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z"/></svg>`;
    const TW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.7-.8-1.8-1.3-3-1.3-2.3 0-4.1 1.8-4.1 4.1 0 .3 0 .6.1.9-3.4-.2-6.4-1.8-8.4-4.3-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4-.3.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8-1.4 1.1-3.1 1.7-5 1.7-.3 0-.6 0-1-.1 1.8 1.1 3.9 1.8 6.2 1.8 7.4 0 11.4-6.1 11.4-11.4 0-.2 0-.3 0-.5.8-.5 1.4-1.2 2-1.9z"/></svg>`;
    const IN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.8v12H2.7v-12h3.8zM4.6 2.5c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2-2.2-1-2.2-2.2 1-2.2 2.2-2.2zm7.2 6.3h3.6v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6v6.7h-3.8v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6.1h-3.5V8.8z"/></svg>`;
    const fhtml = `<div class="wrap"><div class="kf-card"><div class="kf-grid">`
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
      f.innerHTML = fhtml;
    });
  } catch (e) {}
})();
