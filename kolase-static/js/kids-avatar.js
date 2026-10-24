(function () {
  "use strict";

  var STORAGE_PREFIX = "kolase_mascot_v1_";
  var AVATARS = [
    { id: "lion", emoji: "🦁", name: "Singa Pemberani", bg: "#FEF3C7", ring: "#F59E0B" },
    { id: "astro", emoji: "🚀", name: "Astronot Penjelajah", bg: "#DBEAFE", ring: "#2563EB" },
    { id: "robot", emoji: "🤖", name: "Robot Pintar", bg: "#E2E8F0", ring: "#475569" },
    { id: "star", emoji: "⭐", name: "Bintang Bersinar", bg: "#FEF9C3", ring: "#B45309" },
    { id: "owl", emoji: "🦉", name: "Burung Hantu Bijak", bg: "#D1FAE5", ring: "#047857" }
  ];

  function copy(avatar) {
    return { id: avatar.id, emoji: avatar.emoji, name: avatar.name, bg: avatar.bg, ring: avatar.ring };
  }

  function storageKey(studentId) {
    return STORAGE_PREFIX + String(studentId || "guest").replace(/[^a-zA-Z0-9_-]/g, "");
  }

  function byId(avatarId) {
    for (var i = 0; i < AVATARS.length; i += 1) {
      if (AVATARS[i].id === avatarId) return AVATARS[i];
    }
    return null;
  }

  function list() {
    return AVATARS.map(copy);
  }

  function get(studentId) {
    try {
      var saved = localStorage.getItem(storageKey(studentId));
      var hit = byId(saved);
      if (hit) return copy(hit);
    } catch (e) {}
    return copy(AVATARS[0]);
  }

  function set(studentId, avatarId) {
    var hit = byId(avatarId);
    if (!hit) return null;
    try {
      localStorage.setItem(storageKey(studentId), hit.id);
      return copy(hit);
    } catch (e) {
      return null;
    }
  }

  function clear(studentId) {
    try {
      localStorage.removeItem(storageKey(studentId));
      return true;
    } catch (e) {
      return false;
    }
  }

  window.KolaseAvatar = { list: list, get: get, set: set, clear: clear };
})();
