(function () {
  "use strict";

  var NAV_LABELS = {
    "nav.home": "Home",
    "nav.katalog": "Katalog",
    "nav.roadmap": "Jalur Belajar",
    "nav.masukDaftar": "Masuk / Daftar",
    "nav.kelas": "Kelas",
    "nav.kalender": "Kalender",
    "nav.chatGuru": "Chat Guru",
    "nav.chat": "Chat",
    "nav.profil": "Profil",
    "nav.dashboard": "Dashboard",
    "nav.teacher": "Teacher",
    "nav.staff": "Staff",
    "nav.portal": "Portal",
    "nav.direktori": "Direktori",
    "nav.lms": "LMS Anak"
  };

  var GUEST_LINKS = [
    ["home.html", "nav.home"],
    ["catalog.html", "nav.katalog"],
    ["lms.html", "nav.lms"],
    ["home.html#roadmap", "nav.roadmap"],
    ["login.html", "nav.masukDaftar"]
  ];

  var STUDENT_LINKS = [
    ["home.html", "nav.home"],
    ["catalog.html", "nav.katalog"],
    ["dashboard.html", "nav.kelas"],
    ["lms.html", "nav.lms"],
    ["schedule.html", "nav.kalender"],
    ["teacher-chat.html", "nav.chatGuru"],
    ["profile.html", "nav.profil"]
  ];

  var ROLE_NAVS = {
    guest: {
      brand: "home.html",
      links: GUEST_LINKS,
      tabs: GUEST_LINKS
    },
    student: {
      brand: "dashboard.html",
      links: STUDENT_LINKS,
      tabs: [
        ["home.html", "nav.home"],
        ["dashboard.html", "nav.kelas"],
        ["lms.html", "nav.lms"],
        ["schedule.html", "nav.kalender"],
        ["teacher-chat.html", "nav.chatGuru"],
        ["profile.html", "nav.profil"]
      ]
    },
    teacher: {
      brand: "teacher-portal.html",
      links: [
        ["home.html", "nav.home"],
        ["catalog.html", "nav.katalog"],
        ["teacher-portal.html", "nav.kelas"],
        ["schedule.html", "nav.kalender"],
        ["teacher-chat.html", "nav.chatGuru"],
        ["profile.html", "nav.profil"]
      ],
      tabs: [
        ["home.html", "nav.home"],
        ["catalog.html", "nav.katalog"],
        ["teacher-portal.html", "nav.kelas"],
        ["schedule.html", "nav.kalender"],
        ["teacher-chat.html", "nav.chatGuru"],
        ["profile.html", "nav.profil"]
      ]
    },
    staff: {
      brand: "home.html",
      links: [
        ["home.html", "nav.home"],
        ["catalog.html", "nav.katalog"],
        ["dashboard.html", "nav.dashboard"],
        ["schedule.html", "nav.kalender"],
        ["teacher-portal.html", "nav.teacher"],
        ["staff-portal.html", "nav.staff"],
        ["teacher-chat.html", "nav.chatGuru"],
        ["direktori.html", "nav.direktori"],
        ["profile.html", "nav.profil"]
      ],
      tabs: [
        ["home.html", "nav.home"],
        ["dashboard.html", "nav.dashboard"],
        ["staff-portal.html", "nav.staff"],
        ["teacher-chat.html", "nav.chatGuru"],
        ["profile.html", "nav.profil"]
      ]
    }
  };

  var FULL_ROLES = ["founder", "academic", "systems"];
  var STAFF_GROUP = ["staff", "admin", "owner", "author", "founder", "academic", "systems"];
  var GUEST_BLOCKED = [
    "dashboard.html",
    "schedule.html",
    "teacher-chat.html",
    "profile.html",
    "teacher-portal.html",
    "staff-portal.html",
    "review-package.html",
    "direktori.html",
    "ownership.html",
    "checkout.html",
    "certificate.html"
  ];
  var SECTION_MATCH = {
    "class-details.html": "catalog.html",
    "review-package.html": "dashboard.html",
    "checkout.html": "catalog.html",
    "certificate.html": "dashboard.html"
  };

  function currentPage() {
    return (location.pathname.split("/").pop() || "home.html").split("?")[0].split("#")[0];
  }

  function navBase(href) {
    return String(href || "").split("#")[0].split("?")[0];
  }

  function navHref(href) {
    if (href === "home.html#roadmap" && currentPage() === "home.html") return "#roadmap";
    return href;
  }

  function isLoginLink(href) {
    return href === "login.html";
  }

  function readUser() {
    try {
      var db = JSON.parse(localStorage.getItem("kolase_db_v1") || "null");
      var u = (db && db.sessionUser) || null;
      return u && (u.role || u.id) ? u : null;
    } catch (e) {
      return null;
    }
  }

  function loginTarget(href) {
    var raw = String(href || "").trim();
    var next = raw && raw.charAt(0) !== "#" ? raw : currentPage() + (location.search || "") + (location.hash || "");
    return "login.html?notice=login&next=" + encodeURIComponent(next);
  }

  function navT(key) {
    try {
      if (window.KolaseI18n) {
        var text = window.KolaseI18n.t(key);
        if (text && text !== key) return text;
      }
    } catch (e) {}
    return NAV_LABELS[key] || key;
  }

  function roleNavKey(role) {
    if (!role) return "guest";
    if (role === "student") return "student";
    if (role === "teacher") return "teacher";
    if (STAFF_GROUP.indexOf(role) !== -1) return "staff";
    return "student";
  }

  function navBadgeFor(role, href) {
    try {
      var raw = localStorage.getItem("kolase_db_v1");
      if (!raw) return 0;
      var db = JSON.parse(raw);
      if (STAFF_GROUP.indexOf(role) !== -1 && href === "staff-portal.html") {
        if (role === "systems") {
          try { if (window.KolaseStore) return KolaseStore.pendingStaffRequestCount(); } catch (e) {}
          return (db.STAFF_REQUESTS || []).filter(function (r) { return r.status === "PENDING"; }).length;
        }
        return (db.TXN_PAYMENTS || []).filter(function (t) { return t.status === "PENDING"; }).length;
      }
      if (role === "student" && href === "teacher-chat.html" && db.sessionUser) {
        var thread = (db.CHAT_THREADS || {})[db.sessionUser.id];
        if (!thread) return 0;
        var seen = 0;
        try { seen = Number(localStorage.getItem("kolase_chat_seen_" + db.sessionUser.id) || 0); } catch (e) {}
        var fromStaff = (thread.messages || []).filter(function (m) { return m.from !== "student"; }).length;
        return Math.max(0, fromStaff - seen);
      }
      if ((role === "teacher" || STAFF_GROUP.indexOf(role) !== -1) && href === "teacher-chat.html") {
        var threads = Object.values(db.CHAT_THREADS || {});
        return threads.filter(function (th) {
          var messages = th.messages || [];
          var last = messages[messages.length - 1];
          return last && last.from === "student";
        }).length;
      }
    } catch (e) {}
    return 0;
  }

  function renderRoleNav() {
    try {
      var u = readUser();
      var rk = roleNavKey(u && u.role);
      var nav = ROLE_NAVS[rk] || ROLE_NAVS.guest;
      var links = nav.links.slice();
      if (!u || FULL_ROLES.indexOf(u.role) === -1) {
        links = links.filter(function (l) { return l[0] !== "direktori.html"; });
      }

      document.querySelectorAll("[data-fullpower-only]").forEach(function (el) {
        el.style.display = (!u || FULL_ROLES.indexOf(u.role) === -1) ? "none" : "";
      });

      var brand = document.querySelector(".topbar .brand");
      if (brand) brand.setAttribute("href", nav.brand);

      var navEl = document.querySelector("[data-nav]");
      if (navEl) {
        navEl.setAttribute("aria-label", "Navigasi utama");
        navEl.innerHTML = links.map(function (l) {
          var count = navBadgeFor(u && u.role, l[0]);
          var cls = isLoginLink(l[0]) ? ' class="nav-cta"' : "";
          return '<a href="' + navHref(l[0]) + '"' + cls + '>' + navT(l[1])
            + (count > 0 ? ' <span class="nav-badge">' + (count > 99 ? "99+" : count) + "</span>" : "")
            + "</a>";
        }).join("");
      }

      var tabs = document.querySelector(".mobile-tabs");
      if (tabs) {
        tabs.setAttribute("aria-label", "Navigasi bawah");
        tabs.innerHTML = nav.tabs.map(function (l) {
          var cls = isLoginLink(l[0]) ? ' class="is-cta"' : "";
          return '<a href="' + navHref(l[0]) + '"' + cls + '>' + navT(l[1]) + "</a>";
        }).join("");
      }

      syncTabsClass();
    } catch (e) {}
  }

  function markOneActive(link, path) {
    var href = link.getAttribute("href") || "";
    if (href.indexOf("#") !== -1) return;
    if (navBase(href) !== path) return;
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }

  function markActiveNav() {
    var path = SECTION_MATCH[currentPage()] || currentPage();
    document.querySelectorAll("[data-nav] a").forEach(function (a) { markOneActive(a, path); });
    document.querySelectorAll(".mobile-tabs a").forEach(function (a) { markOneActive(a, path); });
  }

  function refreshNavAvatar() {
    try {
      var esc = function (s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      };
      var raw = localStorage.getItem("kolase_db_v1");
      var db = raw ? JSON.parse(raw) : null;
      var u = (db && db.sessionUser) || null;
      var link = document.querySelector('[data-nav] a[href="profile.html"]');
      if (!u || !link) return false;
      var photo = u.photo || "";
      if (!photo && db) {
        var table = u.role === "student" ? db.MST_STUDENTS : u.role === "teacher" ? db.MST_TEACHERS : db.MST_STAFF;
        var idField = u.role === "student" ? "student_id" : u.role === "teacher" ? "teacher_id" : "staff_id";
        var row = (table || []).find(function (r) { return r && r[idField] === u.id; });
        photo = (row && row.photo) || "";
      }
      var name = String(u.nama || "").trim() || String(u.id || "");
      var first = name.split(/\s+/)[0] || name;
      var face = photo
        ? '<img src="' + esc(photo) + '" alt="Foto profil">'
        : '<span class="nav-initial" aria-hidden="true">' + esc(first.charAt(0).toUpperCase()) + "</span>";
      link.classList.add("nav-avatar");
      link.innerHTML = face + '<span class="nav-uname">' + esc(first) + "</span>";
      link.setAttribute("aria-label", "Profil: " + name);
      link.title = name + " " + String(u.id || "");
      return true;
    } catch (e) {
      return false;
    }
  }

  function attachBurger() {
    var burger = document.querySelector("[data-burger]");
    var nav = document.querySelector("[data-nav]");
    if (!burger || !nav) return;
    if (!nav.id) nav.id = "kolaseMainNav";
    burger.setAttribute("aria-label", "Menu navigasi");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", nav.id);
    burger.textContent = "\u2630";

    function closeMenu() {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.textContent = "\u2630";
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.textContent = open ? "\u2715" : "\u2630";
    });

    nav.addEventListener("click", function (e) {
      if (e.target && e.target.tagName === "A") closeMenu();
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !nav.classList.contains("open")) return;
      closeMenu();
      burger.focus();
    });
  }

  function guardGuestNavClicks() {
    document.addEventListener("click", function (e) {
      if (readUser()) return;
      var link = e.target && e.target.closest
        ? e.target.closest("[data-nav] a, .mobile-tabs a, .topbar .brand")
        : null;
      if (!link) return;
      var target = navBase(link.getAttribute("href"));
      if (GUEST_BLOCKED.indexOf(target) === -1) return;
      e.preventDefault();
      location.href = loginTarget(link.getAttribute("href"));
    });
  }

  function syncTabsClass() {
    var tabs = document.querySelector(".mobile-tabs");
    if (!tabs || !document.body) return;
    try {
      document.body.classList.toggle("has-mobile-tabs", getComputedStyle(tabs).display !== "none");
    } catch (e) {}
  }

  window.KolaseNav = { render: renderRoleNav, markActive: markActiveNav, refreshAvatar: refreshNavAvatar };
  window.KolaseNavAvatar = { refresh: refreshNavAvatar };

  function refresh() {
    renderRoleNav();
    refreshNavAvatar();
    markActiveNav();
  }

  refresh();
  attachBurger();
  guardGuestNavClicks();
  window.addEventListener("resize", syncTabsClass);
  // Sesi berubah di tab lain / kembali dari bfcache: menu ikut menyesuaikan.
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key === "kolase_db_v1") refresh();
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) refresh();
  });
})();
