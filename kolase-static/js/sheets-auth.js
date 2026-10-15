/* KOLASE auth via Google Sheets (Apps Script) — sinkron HP↔PC tanpa akun baru.
   Dipakai otomatis bila Supabase belum diset tapi SHEETS_ENDPOINT ada.
   Password dikirim via HTTPS hanya untuk dibandingkan di server;
   server menyimpan salt+hash SHA-256, TIDAK menyimpan password. */
(function () {
  function endpoint() {
    var u = String(window.KOLASE_SHEETS_ENDPOINT || "").trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) return "";
    return u;
  }
  function configured() { return !!endpoint(); }

  function call(body) {
    var ctrl = null, timer = null;
    try {
      if (typeof AbortController !== "undefined") {
        ctrl = new AbortController();
        timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 25000);
      }
    } catch (e) {}
    var opt = {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    };
    if (ctrl) opt.signal = ctrl.signal;
    return fetch(endpoint(), opt).then(function (r) { return r.json(); }).then(function (j) {
      if (timer) clearTimeout(timer);
      if (!j || j.ok !== true) throw new Error((j && j.error) || "Server Sheets tidak merespons.");
      return j;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw new Error("Tidak terhubung ke server Sheets. Cek koneksi lalu coba lagi.");
    });
  }
  function withKey(obj) {
    try {
      if (window.KOLASE_SHEETS_KEY) obj.key = window.KOLASE_SHEETS_KEY;
    } catch (e) {}
    return obj;
  }

  // Cermin operasional ke Sheets (login log + pilot). Tanpa endpoint = antre lokal.
  function sheetLog(body) {
    try {
      if (typeof postSheets === "function") postSheets(body);
      else if (window.KolaseStore && window.KolaseStore.postSheets) window.KolaseStore.postSheets(body);
    } catch (e) {}
  }

  // Cache identitas ke DB lokal (hash) agar dashboard/katalog/chat jalan offline.
  function syncToLocal(user, plainPw, wa) {
    try {
      if (!window.KolaseStore) return;
      var db = window.KolaseStore.loadDB();
      var lpw = "";
      try { lpw = window.KolaseStore.hashPassword ? window.KolaseStore.hashPassword(String(plainPw || "")) : ""; }
      catch (e) { lpw = ""; }
      var id = user.id, role = user.role;
      if (role === "student") {
        var s = (db.MST_STUDENTS || []).find(function (r) { return r.student_id === id; });
        if (!s) {
          db.MST_STUDENTS.push({ student_id: id, pilot_student_id: id, nama: user.nama, email: user.email, wa: wa || "", password: lpw, tgl_daftar: new Date().toISOString().slice(0, 10), current_status: "REGISTERED", confirmation_status: "PENDING" });
        } else {
          s.nama = user.nama || s.nama; s.email = user.email || s.email;
          if (lpw) s.password = lpw;
          if (wa) s.wa = wa;
        }
      } else if (role === "teacher") {
        var t = (db.MST_TEACHERS || []).find(function (r) { return r.teacher_id === id; });
        if (!t) {
          db.MST_TEACHERS.push({ teacher_id: id, nama: user.nama, email: user.email, wa: wa || "", password: lpw });
        } else {
          t.nama = user.nama || t.nama; t.email = user.email || t.email;
          if (lpw) t.password = lpw;
        }
      } else {
        var st = (db.MST_STAFF || []).find(function (r) { return r.staff_id === id; });
        if (!st) {
          db.MST_STAFF.push({ staff_id: id, nama: user.nama, email: user.email, wa: wa || "", role: role, password: lpw });
        } else {
          st.nama = user.nama || st.nama; st.email = user.email || st.email;
          if (lpw) st.password = lpw;
        }
      }
      db.sessionUser = { role: role, id: id, nama: user.nama, email: user.email };
      window.KolaseStore.saveDB(db);
    } catch (e) {}
  }

  function login(query, password) {
    var q = String(query || "").trim().replace(/\s+/g, " ");
    var pass = String(password || "").trim();
    if (!q || !pass) return Promise.reject(new Error("Gmail dan Password wajib diisi."));
    return call(withKey({ action: "auth_login", login: { query: q, password: pass } })).then(function (j) {
      var user = j.user;
      syncToLocal(user, pass, "");
      return user;
    });
  }

  function register(role, nama, email, wa, password) {
    var r = String(role || "").trim().toLowerCase();
    var nm = String(nama || "").trim() || "Pengguna Baru";
    var em = String(email || "").trim();
    var w = String(wa || "").trim();
    var pass = String(password || "").trim();
    if (!em || !w) return Promise.reject(new Error("Email dan No. WA wajib diisi."));
    if (!pass || pass.length < 4) return Promise.reject(new Error("Password min. 4 karakter."));
    return call(withKey({ action: "auth_register", nama: nm, email: em, wa: w, role: r, password: pass })).then(function (j) {
      var id = String(j.id || "");
      var user = { role: r, id: id, nama: nm, email: em };
      syncToLocal(user, pass, w);
      sheetLog({ action: "login", login: { at: new Date().toISOString(), user_id: id, nama: nm, email: em, role: r } });
      if (r === "student") {
        var now = new Date().toISOString();
        sheetLog({
          action: "register_pilot",
          registration: { "Cap waktu": now, "Full Name": nm, Email: em, "No. WhatsApp": w },
          student: { Student_ID: id, Full_Name: nm, Email: em, WhatsApp: w, Current_Status: "REGISTERED", Confirmation_Status: "PENDING", Registration_Date: now.slice(0, 10), Last_Updated: now },
        });
      }
      return id;
    });
  }

  function resetPassword(query, newPassword) {
    var q = String(query || "").trim().replace(/\s+/g, " ");
    var np = String(newPassword || "").trim();
    if (np.length < 4) return Promise.reject(new Error("Password baru min. 4 karakter."));
    return call(withKey({ action: "auth_reset", query: q, new_password: np })).then(function () {
      try {
        if (window.KolaseStore && window.KolaseStore.resetPassword) window.KolaseStore.resetPassword(q, np);
      } catch (e) {}
      return true;
    });
  }

  window.KolaseSheets = {
    configured: configured,
    login: login,
    register: register,
    resetPassword: resetPassword,
  };
})();
