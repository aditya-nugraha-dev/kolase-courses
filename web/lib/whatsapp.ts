// KOLASE — Template WhatsApp resmi (KOL-SOP-INT-001 Bab 5).
// Format 1-K/2-K (Kids), 1-A/2-A (Teens/Adults), 3 (kuitansi), 4 (H-1).
// Isi placeholder [...] sebelum kirim. Pengirim resmi: Business Lead.

export function wa1KundanganAssessment(ortu: string, anak: string, opsiWaktu: string) {
  return `Yth. Bapak/Ibu ${ortu},\n\nTerima kasih atas minat Ayah/Bunda untuk mendampingi kemajuan belajar ananda ${anak} bersama KOLASE English.\n\nGuna memetakan titik mulai belajar yang paling pas, nyaman, dan menyenangkan bagi ananda pada program kelompok kecil (Super Small Group: 3-5 anak), kami mengundang ananda untuk mengikuti sesi perkenalan dan asesmen lisan ramah anak (Kids Entry Assessment):\n- Format: Obrolan santai, tanya jawab ramah, dan permainan tebak gambar daring via Google Meet bersama Mr. Hilal Ibrahim\n- Durasi: 10-15 Menit saja (bebas rasa cemas/ujian formal)\n- Biaya Asesmen: Bebas Biaya (Gratis)\n- Pilihan Waktu: ${opsiWaktu}\n\nMohon konfirmasi waktu yang paling nyaman bagi ananda. Kami sangat menantikan kesempatan untuk berbincang akrab bersama ananda.\n\nSalam hangat,\nAhrenz Galang — KOLASE English`;
}

export function wa2KHasilAssessment(ortu: string, anak: string, stage: string, catatan: string, jadwal: string) {
  return `Yth. Bapak/Ibu ${ortu},\n\nTerima kasih telah mendampingi ananda ${anak} dalam sesi Kids Entry Assessment bersama Mr. Hilal Ibrahim.\n\nHasil observasi kemampuan lisan ananda menunjukkan perkembangan yang sangat positif:\n- Rekomendasi Tahap Belajar: Stage ${stage}\n- Catatan Guru: ${catatan}\n\nKami telah menyiapkan kelompok belajar bimbingan intensif kelompok kecil (3-5 anak) yang sebaya dan setara kemampuannya:\n- Jadwal Belajar: ${jadwal} (60 Menit via Google Meet)\n- Format Program: Term Program (10 Pertemuan Pembelajaran Terstruktur @ 60 Menit)\n- Laporan Perkembangan: Rapor berkala resmi (KOLASE Kids Progress Report) diterbitkan pada akhir Sesi ke-10\n\nUntuk informasi tata cara pendaftaran rombel dan administrasi kelas, silakan membalas pesan ini. Terima kasih atas kepercayaan Ayah/Bunda.\n\nSalam hangat,\nTim Akademik KOLASE English`;
}

export function wa1AUndanganPlacement(nama: string, linkForm: string) {
  return `Yth. ${nama},\n\nTerima kasih atas minat Anda untuk bergabung dalam program bimbingan bahasa Inggris intensif di KOLASE English.\n\nGuna memastikan penempatan level yang akurat dan homogen pada kelas kelompok kecil (3-5 siswa), seluruh calon siswa diwajibkan mengikuti Diagnostic Placement Test secara daring:\n- Format: Pilihan Ganda & Penulisan Narasi Singkat (Estimasi 40-50 Menit)\n- Tautan Asesmen: ${linkForm}\n- Biaya Asesmen: Bebas Biaya (Gratis)\n\nMohon mengerjakan secara mandiri dan jujur tanpa alat bantu penerjemah agar kami dapat mendiagnosis profil belajar Anda dengan tepat. Hasil evaluasi akan kami sampaikan maksimal 1x24 jam kerja.\n\nSalam hangat,\nAhrenz Galang — KOLASE English`;
}

export function wa2AHasilEvaluasi(nama: string, skor: number, level: string, catatan: string, jadwal: string, batasWaktu: string) {
  return `Yth. ${nama},\n\nHasil evaluasi Diagnostic Placement Test KOLASE English Anda telah selesai dinilai oleh tim akademik:\n- Total Skor: ${skor}/50 Poin\n- Rekomendasi Level Akademik: CEFR ${level}\n- Catatan Akademik: ${catatan}\n\nKami telah menyiapkan kelompok belajar bimbingan intensif (Super Small Group: 3-5 siswa) dengan jadwal:\n- Jadwal Belajar: ${jadwal} (60 Menit Daring via Google Meet)\n\nPilihan Katalog Paket Sesi Lanjutan:\n- Paket 6 Sesi (Kickstart)\n- Paket 10 Sesi (Short Term)\n- Paket 15 Sesi (Core 15)\n- Paket 30 Sesi (Core 30)\n- Paket 45 Sesi (Core 45)\n\nRekening Pembayaran Resmi:\nBank Central Asia (BCA) a.n. Ahrenz Galang.\n\nMohon konfirmasi pilihan paket dan bukti transfer sebelum ${batasWaktu}. Terima kasih.\n\nSalam hangat,\nAhrenz Galang — KOLASE English`;
}

export function wa3Kuitansi(nama: string, txn: string, stu: string, cls: string, program: string, kuota: number) {
  return `BUKTI KONFIRMASI PEMBAYARAN RESMI — KOLASE ENGLISH\n\nYth. ${nama},\n\nPembayaran Anda telah berhasil kami verifikasi pada mutasi rekening bank resmi. Status kepesertaan telah AKTIF:\n- No. Transaksi: ${txn}\n- Student ID: ${stu}\n- Class ID: ${cls}\n- Program Terdaftar: ${program}\n- Kuota Hak Hadir: ${kuota} Pertemuan @ 60 Menit\n- Status Pembayaran: LUNAS\n\nKursi belajar Anda telah terkunci permanen. Onboarding Kit dan tautan resmi Google Meet akan kami kirimkan paling lambat 24 jam sebelum sesi perdana dimulai.\n\nSelamat bergabung di KOLASE English!\n"Structured Learning, Confident Speaking"`;
}

export function wa4PengingatH1(nama: string, hariTanggal: string, waktu: string, meet: string) {
  return `PENGINGAT RESMI PERTEMUAN PERDANA (SESI 1) — KOLASE ENGLISH\n\nHalo ${nama},\n\nPertemuan perdana sesi pembelajaran bimbingan intensif Anda akan diselenggarakan BESOK SORE:\n- Hari/Tanggal: ${hariTanggal}\n- Waktu: ${waktu} (60 Menit Penuh)\n- Instruktur Utama: Mr. Hilal Ibrahim\n- Tautan Google Meet: ${meet}\n\nPanduan Persiapan:\n- Gunakan headset/earphone dengan mikrofon yang jernih dan pastikan koneksi internet stabil.\n- Berada di ruangan yang tenang dan berpenerangan baik.\n- Masuk ke ruang Google Meet 5-10 menit lebih awal untuk uji audio dan video.\n\nSampai jumpa di kelas besok!\nTim Operasional KOLASE English`;
}
