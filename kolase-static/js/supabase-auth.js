/* KOLASE cloud auth — sinkron HP <-> PC via Supabase RPC.
   Tanpa config (js/supabase-config.js) = mode offline localStorage seperti dulu.
   Dengan config = cloud-first, localStorage jadi cache offline.
   Hash: SHA-256 hex dari password yang sudah di-trim (SubtleCrypto, HTTPS). */
(function () {
  var _client = null;

  function cfg() {
    var url = (window.KOLASE_SUPABASE_URL || "").trim();
    var key = (window.KOLASE_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) return null;
    if (url.indexOf("xxxx") !== -1 || key.indexOf("isi-anon") !== -1) return null;
    if (!/^https:\/\/.+\.supabase\.co/.test(url)) return null;
    return { url: url, key: key };
  }

  function configured() { return !!cfg(); }

  function client() {
    if (_client) return _client;
    var c = cfg();
    if (!c) throw new Error("Cloud belum dikonfigurasi.");
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Library Supabase CDN belum termuat (cek koneksi).");
    }
    _client = window.supabase.createClient(c.url, c.key);
    return _client;
  }

  function bufToHex(buf) {
    var a = new Uint8Array(buf), s = "";
    for (var i = 0; i < a.length; i++) {
      var h = a[i].toString(16);
      s += h.length === 1 ? "0" + h : h;
    }
    return s;
  }

  function sha256hex(text) {
    var v = String(text == null ? "" : text);
    if (window.crypto && window.crypto.subtle && window.isSecureContext !== false) {
      return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)).then(bufToHex);
    }
    return Promise.reject(new Error("Browser butuh HTTPS untuk login cloud (buka via https://)."));
  }

  function normQuery(q) {
    return String(q || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  // Tulis user cloud ke DB lokal agar dashboard/katalog/chat tetap jalan offline.
  function syncToLocal(user, extra) {
    try {
      if (!window.KolaseStore) return;
      var db = window.KolaseStore.loadDB();
      var ex = extra || {};
      var id = user.id, role = user.role;
      if (role === "student") {
        var s = (db.MST_STUDENTS || []).find(function (r) { return r.student_id === id; });
        if (!s) {
          s = { student_id: id, pilot_student_id: id, nama: user.nama, email: user.email, wa: ex.wa || "", password: ex.password || "", tgl_daftar: new Date().toISOString().slice(0, 10), current_status: "REGISTERED", confirmation_status: "PENDING" };
          db.MST_STUDENTS.push(s);
        } else {
          s.nama = user.nama || s.nama; s.email = user.email || s.email;
          if (ex.password) s.password = ex.password;
          if (ex.wa) s.wa = ex.wa;
        }
      } else if (role === "teacher") {
        var t = (db.MST_TEACHERS || []).find(function (r) { return r.teacher_id === id; });
        if (!t) {
          db.MST_TEACHERS.push({ teacher_id: id, nama: user.nama, email: user.email, wa: ex.wa || "", password: ex.password || "" });
        } else {
          t.nama = user.nama || t.nama; t.email = user.email || t.email;
          if (ex.password) t.password = ex.password;
        }
      } else {
        var st = (db.MST_STAFF || []).find(function (r) { return r.staff_id === id; });
        if (!st) {
          db.MST_STAFF.push({ staff_id: id, nama: user.nama, email: user.email, wa: ex.wa || "", role: role, password: ex.password || "" });
        } else {
          st.nama = user.nama || st.nama; st.email = user.email || st.email;
          if (ex.password) st.password = ex.password;
        }
      }
      db.sessionUser = { role: role, id: id, nama: user.nama, email: user.email };
      window.KolaseStore.saveDB(db);
    } catch (e) { /* cache lokal opsional, jangan gagalkan login cloud */ }
  }

  function rpcError(err) {
    var m = (err && err.message) ? err.message : "Cloud error.";
    // Pesan Postgres("...") -> ambil inti agar ramah HP
    var cut = m.match(/NEED_APPROVAL:[^"]*/);
    if (cut) return cut[0];
    return m;
  }

  function login(query, password) {
    var q = normQuery(query);
    var pass = String(password || "").trim();
    if (!q || !pass) return Promise.reject(new Error("User name/Email dan Password wajib diisi."));
    return sha256hex(pass).then(function (h) {
      return client().rpc("kolase_login", { p_query: q, p_password_hash: h });
    }).then(function (res) {
      if (res.error) throw new Error(rpcError(res.error));
      var d = res.data;
      var user = { role: d.role, id: d.id, nama: d.nama, email: d.email };
      syncToLocal(user, { password: String(password || "").trim() });
      return user;
    });
  }

  function register(role, nama, email, wa, password, pin) {
    var r = String(role || "").trim().toLowerCase();
    var nm = String(nama || "").trim();
    var em = String(email || "").trim();
    var w = String(wa || "").trim();
    var pass = String(password || "").trim();
    if (!em || !w) return Promise.reject(new Error("Email dan No. WA wajib diisi."));
    if (!pass || pass.length < 4) return Promise.reject(new Error("Password min. 4 karakter."));
    return sha256hex(pass).then(function (h) {
      return client().rpc("kolase_register", {
        p_nama: nm || "Pengguna Baru", p_email: em, p_wa: w,
        p_role: r, p_password_hash: h, p_pin: String(pin || "")
      });
    }).then(function (res) {
      if (res.error) throw new Error(rpcError(res.error));
      var id = String(res.data || "");
      var user = { role: r, id: id, nama: nm || "Pengguna Baru", email: em };
      syncToLocal(user, { password: pass, wa: w });
      return id;
    });
  }

  function resetPassword(query, newPassword) {
    var q = normQuery(query);
    var np = String(newPassword || "").trim();
    if (np.length < 4) return Promise.reject(new Error("Password baru min. 4 karakter."));
    return sha256hex(np).then(function (h) {
      return client().rpc("kolase_reset_password", { p_query: q, p_new_hash: h });
    }).then(function (res) {
      if (res.error) throw new Error(rpcError(res.error));
      // Samakan juga cache lokal agar tidak bentrok saat offline
      try {
        if (window.KolaseStore && window.KolaseStore.resetPassword) {
          window.KolaseStore.resetPassword(q, np);
        }
      } catch (e) {}
      return true;
    });
  }

  window.KolaseCloud = {
    configured: configured,
    login: login,
    register: register,
    resetPassword: resetPassword
  };
})();
