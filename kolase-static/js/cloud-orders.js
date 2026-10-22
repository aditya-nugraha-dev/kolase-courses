/* KOLASE cloud orders — pembayaran manual lintas perangkat (butuh §13-14 auth_sync.sql).
   Tanpa config = baca resolve [] (halaman pakai alur lokal), tulis reject.
   Materialisasi lokal (ensureLocalPending/applyVerified) memakai window.KolaseStore. */
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

  function rpcError(err) {
    return (err && err.message) ? err.message : "Cloud error.";
  }

  function call(fn, args) {
    return client().rpc(fn, args).then(function (res) {
      if (res.error) throw new Error(rpcError(res.error));
      return res.data;
    });
  }

  function asArr(d) { return Array.isArray(d) ? d : []; }

  function sessionIdent() {
    try {
      if (window.KolaseStore && window.KolaseStore.loadDB) {
        var u = window.KolaseStore.loadDB().sessionUser || null;
        if (u) return String(u.email || u.id || "").trim().toLowerCase();
      }
    } catch (e) {}
    return "";
  }

  // ===== Metode pembayaran (dibaca checkout, ditulis owner dari staff portal) =====
  function payMethods() {
    if (!configured()) return Promise.resolve([]);
    return call("kolase_pay_methods", {}).then(asArr, function () { return []; });
  }

  function saveMethod(m) {
    return call("kolase_pay_method_save", {
      p_id: (m && m.id) || "", p_type: m.type, p_label: m.label,
      p_account: (m.account || ""), p_holder: (m.holder || ""),
      p_qr: (m.qr || ""), p_active: m.is_active !== false
    });
  }

  function deleteMethod(id) {
    return call("kolase_pay_method_delete", { p_id: id });
  }

  // ===== Order (ditulis checkout, dibaca admin + murid) =====
  // Sesi paket bisa hilang di RPC lama; infer dari class + nominal resmi.
  function sessionsFor(o) {
    var direct = Number((o && o.sessions) || 0);
    if (direct > 0) return direct;
    var cid = String((o && o.class_id) || "");
    var n = Number((o && o.nominal) || 0);
    if (cid === "CLS-SMALL-GROUP-01") return n >= 3150000 ? 45 : n >= 450000 ? 6 : 0;
    if (cid === "CLS-KIDS-TERM-01") return 10;
    if (cid.indexOf("CLS-PUB-") === 0) return 4;
    return 0;
  }

  function upsertOrder(o) {
    return call("kolase_order_upsert", {
      p_order_id: o.order_id, p_trx_id: o.trx_id, p_student_id: o.student_id,
      p_nama: o.student_nama || "", p_email: o.student_email || "",
      p_class_id: o.class_id || "", p_class_nama: o.class_nama || "",
      p_nominal: Number(o.nominal || 0), p_method: o.method || "",
      p_proof: o.proof || "", p_status: o.status || "PENDING"
    });
  }

  function pendingOrders() {
    if (!configured()) return Promise.resolve([]);
    return call("kolase_orders_pending", {}).then(asArr, function () { return []; });
  }

  function verifyOrder(orderId, v) {
    return call("kolase_order_verify", {
      p_order_id: orderId, p_status: v.status,
      p_sisa: Number(v.sisa || 0), p_grant: Number(v.grant || 0),
      p_activated_at: v.activated_at || null,
      p_expires_at: v.expires_at || null
    });
  }

  function myOrders() {
    var q = sessionIdent();
    if (!q || !configured()) return Promise.resolve([]);
    return call("kolase_my_orders", { p_query: q }).then(asArr, function () { return []; });
  }

  // ===== Materialisasi lokal (agar dashboard/portal jalan offline) =====
  function pad6(n) { return String(n).padStart(6, "0"); }

  function ensureMasterStub(db, o) {
    if (!o || String(o.student_id || "").indexOf("STU-") !== 0) return;
    var s = (db.MST_STUDENTS || []).find(function (r) { return r.student_id === o.student_id; });
    if (s) return;
    // Password marker acak: login lokal SELALU gagal; hanya login cloud yang bisa
    // membuka akun ini (syncToLocal menimpa password saat login cloud sukses).
    var rnd = "";
    try {
      var b = new Uint8Array(16);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(b);
      else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
      for (var j = 0; j < 16; j++) rnd += (b[j] < 16 ? "0" : "") + b[j].toString(16);
    } catch (e) { rnd = String(Date.now()) + String(Math.random()); }
    (db.MST_STUDENTS || (db.MST_STUDENTS = [])).push({
      student_id: o.student_id, pilot_student_id: o.student_id,
      nama: o.student_nama || o.student_id, email: o.student_email || "", wa: "",
      password: "$kolase1$cloud-only$" + rnd,
      tgl_daftar: new Date().toISOString().slice(0, 10),
      current_status: "REGISTERED", confirmation_status: "PENDING"
    });
  }

  // Cerminkan order cloud sebagai PENDING lokal (idempoten via ENR/TRX).
  function ensureLocalPending(o) {
    var KS = window.KolaseStore;
    if (!KS || !o || !o.order_id) return false;
    var db = KS.loadDB();
    var changed = false;
    if (!(db.TXN_PAYMENTS || []).some(function (t) { return t.trx_id === o.trx_id; })) {
      db.TXN_PAYMENTS.push({
        trx_id: o.trx_id, enrollment_id: o.order_id, student_id: o.student_id,
        class_id: o.class_id, nominal: Number(o.nominal || 0), method: o.method || "",
        status: "PENDING", tgl: o.created_at || new Date().toISOString(),
        sessions: sessionsFor(o) || null
      });
      changed = true;
    }
    if (!(db.CLASS_MEMBERSHIP || []).some(function (m) { return m.enrollment_id === o.order_id; })) {
      db.CLASS_MEMBERSHIP.push({
        enrollment_id: o.order_id, student_id: o.student_id, class_id: o.class_id,
        status: "PENDING", sisa: 0, sesi_package: sessionsFor(o) || null
      });
      changed = true;
    }
    var before = (db.MST_STUDENTS || []).length;
    ensureMasterStub(db, o);
    if ((db.MST_STUDENTS || []).length !== before) changed = true;
    if (changed) KS.saveDB(db);
    return changed;
  }

  function nextSesId(list) {
    var max = 0;
    (list || []).forEach(function (r) {
      var m = /^SES-(\d+)$/.exec(String(r.session_id || ""));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return "SES-" + pad6(max + 1);
  }

  function genSessions(db, m, count, anchorIso) {
    var n = Number(count || 0);
    if (!(n > 0)) return;
    var anchor = new Date(anchorIso || Date.now());
    if (isNaN(anchor.getTime())) anchor = new Date();
    var day = function (i) {
      var d = new Date(anchor);
      d.setDate(d.getDate() + (i - 1) * 7);
      return d.toISOString().slice(0, 10);
    };
    var i;
    for (i = 1; i <= n; i++) {
      var dupCs = (db.CLASS_SESSIONS || []).some(function (x) { return x.class_id === m.class_id && x.seq === i; });
      if (!dupCs) {
        db.CLASS_SESSIONS.push({
          session_id: nextSesId(db.CLASS_SESSIONS),
          class_id: m.class_id, seq: i, tanggal: day(i), status: "SCHEDULED"
        });
      }
    }
    for (i = 1; i <= n; i++) {
      var dupS = (db.SESSIONS || []).some(function (x) { return x.enrollment_id === m.enrollment_id && x.seq === i; });
      if (!dupS) {
        db.SESSIONS.push({
          session_id: "SES-" + pad6(i) + "-" + m.enrollment_id,
          enrollment_id: m.enrollment_id, seq: i,
          tanggal: day(i), status: "SCHEDULED", hadir: null
        });
      }
    }
  }

  // Terapkan order VERIFIED cloud ke perangkat ini (idempoten). Return true bila berubah.
  function applyVerified(o) {
    var KS = window.KolaseStore;
    if (!KS || !o || !o.order_id || o.status !== "VERIFIED") return false;
    var db = KS.loadDB();
    var changed = false;
    var pay = (db.TXN_PAYMENTS || []).find(function (t) { return t.trx_id === o.trx_id; });
    if (!pay) {
      db.TXN_PAYMENTS.push({
        trx_id: o.trx_id, enrollment_id: o.order_id, student_id: o.student_id,
        class_id: o.class_id, nominal: Number(o.nominal || 0), method: o.method || "",
        status: "VERIFIED", tgl: o.created_at || new Date().toISOString(),
        sessions: sessionsFor(o) || null,
        tgl_verifikasi: o.activated_at || new Date().toISOString()
      });
      changed = true;
    } else if (pay.status !== "VERIFIED") {
      pay.status = "VERIFIED";
      pay.tgl_verifikasi = pay.tgl_verifikasi || o.activated_at || new Date().toISOString();
      changed = true;
    }
    var m = (db.CLASS_MEMBERSHIP || []).find(function (x) { return x.enrollment_id === o.order_id; });
    if (!m) {
      m = {
        enrollment_id: o.order_id, student_id: o.student_id, class_id: o.class_id,
        status: "ACTIVE", sisa: Number(o.sisa || 0),
        sesi_package: sessionsFor(o) || null,
        activated_at: o.activated_at || new Date().toISOString(), expires_at: o.expires_at || null
      };
      db.CLASS_MEMBERSHIP.push(m);
      changed = true;
    } else if (m.status !== "ACTIVE" || Number(m.sisa || 0) !== Number(o.sisa || 0)) {
      m.status = "ACTIVE";
      m.sisa = Number(o.sisa || 0);
      m.activated_at = m.activated_at || o.activated_at;
      m.expires_at = m.expires_at || o.expires_at;
      changed = true;
    }
    var before = (db.MST_STUDENTS || []).length;
    ensureMasterStub(db, o);
    if ((db.MST_STUDENTS || []).length !== before) changed = true;
    var beforeSess = (db.SESSIONS || []).length;
    genSessions(db, m, Number(o.grant_n || o.sisa || 0), m.activated_at);
    if ((db.SESSIONS || []).length !== beforeSess) changed = true;
    var hasGrant = (db.TXN_ENTITLEMENT_LEDGER || []).some(function (l) {
      return l.enrollment_id === m.enrollment_id && l.reason === "PAYMENT_VERIFIED";
    });
    if (!hasGrant) {
      db.TXN_ENTITLEMENT_LEDGER.push({
        enrollment_id: m.enrollment_id, student_id: m.student_id,
        delta: Number(o.grant_n || o.sisa || 0), reason: "PAYMENT_VERIFIED",
        at: new Date().toISOString(), balance_after: m.sisa
      });
      changed = true;
    }
    if (changed) KS.saveDB(db);
    return changed;
  }

  // Kompres gambar jadi dataURL JPEG (dipakai bukti transfer & foto QRIS).
  function compressImage(file, maxPx, maxLen) {
    return new Promise(function (res, rej) {
      if (!file || !/image\/(jpeg|png|webp)/.test(file.type)) {
        rej(new Error("Format harus JPG/PNG/WebP."));
        return;
      }
      var img = new Image();
      img.onload = function () {
        try {
          var max = maxPx || 512, w = img.width, h = img.height;
          if (w > max || h > max) { var s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          var q = 0.85, out = c.toDataURL("image/jpeg", q);
          var cap = maxLen || 380000;
          while (out.length > cap && q > 0.4) { q -= 0.15; out = c.toDataURL("image/jpeg", q); }
          try { URL.revokeObjectURL(img.src); } catch (e) {}
          res(out);
        } catch (e) { rej(new Error("Gagal memproses gambar.")); }
      };
      img.onerror = function () { rej(new Error("File tidak terbaca sebagai gambar.")); };
      img.src = URL.createObjectURL(file);
    });
  }

  window.KolaseOrders = {
    configured: configured,
    payMethods: payMethods,
    saveMethod: saveMethod,
    deleteMethod: deleteMethod,
    upsertOrder: upsertOrder,
    pendingOrders: pendingOrders,
    verifyOrder: verifyOrder,
    myOrders: myOrders,
    ensureLocalPending: ensureLocalPending,
    applyVerified: applyVerified,
    compressImage: compressImage
  };
})();
