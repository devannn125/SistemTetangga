# Batasan Akses per Role — Sistem Informasi RT Digital

> Disusun berdasarkan `PRD_Gabungan_RT_Digital.md`, Bab 3 (Target Pengguna & Hak Akses) dan Bab 6 (Detail Modul). Dokumen ini menerjemahkan permission matrix PRD menjadi batasan konkret per role, siap dipakai sebagai acuan saat membangun sidebar, routing, dan middleware otorisasi di frontend/backend.

Level hierarki: **1 = tertinggi (read-only lintas RT)** → **5 = warga/operasional**. Level tidak berarti "lebih berkuasa" secara mutlak — tiap level tetap dibatasi ruang lingkup modulnya masing-masing.

---

## 1. Kelurahan (Level 1)

**Sifat akses**: Read-only, lintas banyak RT, untuk kebutuhan pelaporan wilayah. Tidak pernah melakukan input/approval.

| Modul | Akses |
|---|---|
| Dashboard | Read |
| Data Warga | Read |
| Perumahan | Read |
| Tamu | Tidak ada akses |
| Keuangan | Monitor (lihat ringkasan, bukan detail transaksi) |
| Iuran | Tidak ada akses |
| Surat Keterangan | Tidak ada akses |
| Siskamling | Tidak ada akses |
| Informasi & Statistik | Read + Export |
| Peraturan & Tata Tertib | Read |
| Struktur Organisasi | Read |
| Notifikasi & Pesan/Kesan | Tidak ada akses |
| User Management | Tidak ada akses |

**Data sensitif** (kurang mampu, penyakit, WNA, bansos): **tidak boleh diakses.**

**Catatan implementasi**: Role ini kemungkinan besar mengonsumsi endpoint agregat/statistik terpisah (bukan endpoint operasional RT), sesuai integrasi "Portal Kelurahan (Read-Only)" di Bab 8 PRD.

---

## 2. Ketua RW (Level 2)

**Sifat akses**: Agregat statistik & laporan seluruh RT di bawahnya, otorisasi terbatas (verifikasi data warga baru, monitor keuangan), bukan operasional harian RT.

| Modul | Akses |
|---|---|
| Dashboard | Read |
| Data Warga | Verify (verifikasi data warga baru, bukan CRUD) |
| Perumahan | Read |
| Tamu | Tidak ada akses |
| Keuangan | Monitor |
| Iuran | Tidak ada akses |
| Surat Keterangan | Read |
| Siskamling | Tidak ada akses |
| Informasi & Statistik | Read + Export |
| Peraturan & Tata Tertib | Read |
| Struktur Organisasi | Read |
| Notifikasi & Pesan/Kesan | Tidak ada akses |
| User Management | Tidak ada akses |

**Peran tambahan sesuai Bab 6**:
- Menerima eskalasi pengaduan (SIPANDU) yang tidak selesai dalam **3 hari** dari RT (6.10).
- Melihat statistik kependudukan & pengaduan (6.12.5) untuk seluruh RT di bawahnya.

**Data sensitif**: **tidak boleh diakses** — sama seperti Kelurahan, hanya RT/Sekretaris/Bendahara yang boleh.

---

## 3. Ketua RT (Level 3)

**Sifat akses**: Akses penuh operasional di ruang lingkup satu RT — approval final, kelola struktur organisasi, dashboard statistik lengkap. Ini role dengan cakupan terluas di dalam satu RT.

| Modul | Akses |
|---|---|
| Dashboard | Full |
| Data Warga | CRUD |
| Perumahan | CRUD |
| Tamu | Approve |
| Keuangan | Read |
| Iuran | Approve |
| Surat Keterangan | Approve (final) |
| Siskamling | CRUD/Approve jadwal |
| Informasi & Statistik | CRUD + Export |
| Peraturan & Tata Tertib | CRUD |
| Struktur Organisasi | CRUD |
| Notifikasi & Pesan/Kesan | Read (pesan warga) |
| User Management | RT Scope (kelola user dalam RT-nya sendiri) |

**Wewenang eksekutif spesifik dari Bab 6**:
- **Approval final** permohonan surat setelah verifikasi Sekretaris (6.5), lalu memicu proses tanda tangan digital via Privy (6.6).
- **Approve tamu** warga (permission matrix 3.2).
- Menyusun **jadwal shift siskamling** dan menerima notifikasi **panic button** dengan prioritas tertinggi (6.7).
- Menerima **eskalasi pengaduan** dari petugas, dan meng-**assign** petugas penanganan (6.10). Jika tidak selesai 3 hari → otomatis eskalasi ke RW (di luar kendali Ketua RT).
- Mengelola **struktur organisasi & periode jabatan pengurus** — perubahan ini **otomatis memicu penyesuaian RBAC** role lain (3.4, 6.1.3).
- Satu-satunya, bersama Sekretaris & Bendahara, yang boleh melihat **data sensitif** (kurang mampu, penyakit, WNA, bansos) (3.4, 6.8.2).

**Batasan penting**: Ketua RT **tidak** melakukan input transaksi keuangan harian (itu wewenang Bendahara) — aksesnya di modul Keuangan adalah **Read**, bukan CRUD.

---

## 4. Sekretaris RT (Level 4)

**Sifat akses**: Operasional data warga/rumah/surat sehari-hari, verifikasi tingkat menengah sebelum naik ke approval Ketua RT.

| Modul | Akses |
|---|---|
| Dashboard | Full |
| Data Warga | CRUD |
| Perumahan | CRUD |
| Tamu | Read |
| Keuangan | Read |
| Iuran | Read |
| Surat Keterangan | Verify (bukan approve final) |
| Siskamling | Read |
| Informasi & Statistik | CRUD (kategori tidak sensitif + akses kategori sensitif karena termasuk pengecualian 3.4) |
| Peraturan & Tata Tertib | CRUD |
| Struktur Organisasi | Read |
| Notifikasi & Pesan/Kesan | Read (pesan warga) |
| User Management | Tidak ada akses |

**Wewenang spesifik dari Bab 6**:
- **Menginput/mengimpor data warga** (manual/Excel) dan melakukan validasi awal duplikasi NIK (6.2.1).
- **Verifikasi kelengkapan dokumen** permohonan surat sebelum diteruskan ke Ketua RT untuk approval (6.5).
- Verifikasi lapangan data usaha untuk Surat Keterangan Usaha (6.5.2).
- Membuat/mengubah **Tata Tertib** (satu-satunya, bersama Ketua RT, yang punya wewenang ini — 6.1.1).
- Meninjau **Pesan dan Kesan** dari warga melalui dashboard (6.9.3).
- Termasuk pihak yang boleh mengakses **data sensitif** (kurang mampu, penyakit, WNA, bansos) (3.4).

---

## 5. Bendahara RT (Level 4)

**Sifat akses**: Fokus sempit dan dalam — hanya modul Keuangan & Iuran, plus data warga terkait penerima bansos/iuran. Tidak punya akses CRUD di modul kependudukan umum.

| Modul | Akses |
|---|---|
| Dashboard | Full |
| Data Warga | Read (khusus untuk kebutuhan data terkait iuran & bansos) |
| Perumahan | Read |
| Tamu | Tidak ada akses |
| Keuangan | CRUD |
| Iuran | CRUD |
| Surat Keterangan | Read |
| Siskamling | Read |
| Informasi & Statistik | Read (kategori terbatas — termasuk kategori sensitif karena berkaitan langsung dengan bansos) |
| Peraturan & Tata Tertib | Read |
| Struktur Organisasi | Read |
| Notifikasi & Pesan/Kesan | Tidak ada akses |
| User Management | Tidak ada akses |

**Wewenang spesifik dari Bab 6**:
- **Input pemasukan & pengeluaran** kas RT dengan kategori dan bukti (6.11.1).
- **Kelola tagihan iuran per KK**, konfirmasi pembayaran manual, mendukung status **sebagian (partial)** (6.11.2).
- **Input status pajak** rumah warga (satu-satunya bersama Admin RT yang berwenang — 6.3.1).
- Menerima **reminder otomatis H-7 dan H-1** sebelum jatuh tempo iuran sebagai bagian alur kerjanya (6.11.2).
- Termasuk pihak yang boleh mengakses **data sensitif** karena berkaitan dengan penerima bansos (3.4).

**Batasan penting**: Bendahara **tidak** berwenang approve surat, tamu, atau siskamling — semua "Read" saja di luar Keuangan/Iuran.

---

## 6. Admin RT (Level 4)

**Sifat akses**: Administrasi teknis sistem tingkat RT — bukan pengambil keputusan operasional/konten, tapi pengelola infrastruktur data & konfigurasi.

Modul spesifik Admin RT **tidak ada di tabel permission matrix eksplisit PRD** (Bab 3.2 hanya mencantumkan Kelurahan/RW/RT/Sekretaris/Bendahara/Warga), tapi deskripsinya di Bab 3.1 menyebutkan cakupan:

| Tanggung jawab | Keterangan |
|---|---|
| Manajemen User | Membuat/menonaktifkan akun user dalam RT (mirip User Management RT Scope milik Ketua RT, kemungkinan didelegasikan) |
| Master Data | Kelola data referensi: wilayah, agama, pendidikan, profesi, kategori bansos/kos (6.12.4) |
| Konfigurasi Notifikasi | Mengatur pengaturan pengiriman notifikasi Telegram/WhatsApp OTP tingkat sistem |
| Status pajak rumah | Berwenang input bersama Bendahara (6.3.1) |

**Rekomendasi implementasi**: Karena PRD tidak merinci matrix Admin RT selengkap role lain, perlakukan sebagai **subset teknis dari kewenangan Ketua RT** yang didelegasikan khusus untuk urusan konfigurasi sistem — bukan approval konten (surat, tamu, siskamling).

---

## 7. Warga (Level 5)

**Sifat akses**: Hanya melihat/mengelola data miliknya sendiri ("Own Data"), tidak pernah CRUD data warga lain.

| Modul | Akses |
|---|---|
| Dashboard | Read |
| Data Warga | Own Data |
| Perumahan | Tidak ada akses |
| Tamu | Create (Own) — hanya mendaftarkan tamu miliknya sendiri |
| Keuangan | Read (laporan publik, bukan detail transaksi mentah) |
| Iuran | Own Data |
| Surat Keterangan | Request (mengajukan, tidak bisa verify/approve) |
| Siskamling | Read |
| Informasi & Statistik | Read (non-sensitif saja) |
| Peraturan & Tata Tertib | Read |
| Struktur Organisasi | Read |
| Notifikasi & Pesan/Kesan | Create + Own |
| User Management | Own Profile |

**Wewenang & batasan spesifik dari Bab 6**:
- **Mengajukan permohonan surat** via web/Telegram Bot (6.5), lalu menerima notifikasi status dan mengunduh surat setelah tanda tangan digital selesai.
- **Melapor pengaduan (SIPANDU)** dan menerima nomor tiket otomatis, bisa memberi rating kepuasan 1–5 setelah selesai (6.10).
- Mengirim **Pesan dan Kesan** ke pengurus, boleh anonim **kecuali kategori keluhan** yang memerlukan tindak lanjut langsung (6.9.3).
- Bisa **subscribe/unsubscribe** notifikasi informasi (pengumuman, agenda) — tapi **notifikasi administrasi wajib** dan tidak bisa dimatikan (6.9.1–6.9.2).
- **Tidak pernah** melihat data sensitif warga lain (kurang mampu, penyakit, WNA, bansos) dalam bentuk apapun, termasuk di response API (3.4) — ini batasan keras, bukan sekadar disembunyikan di UI.

---

## 8. Pengurus Siskamling / Warga Ronda (Level 5)

**Sifat akses**: Sama seperti Warga biasa untuk modul umum, ditambah kewenangan operasional khusus di modul Siskamling.

**Tambahan wewenang di luar hak akses Warga standar** (6.7):
- **Input jadwal ronda** (kemungkinan sebagai pengusul, bukan pengesah — pengesahan tetap wewenang Ketua RT/Admin sesuai 6.7 "Admin/Ketua RT menyusun jadwal shift").
- **Absensi check-in** dengan koordinat GPS (dan foto opsional).
- **Melaporkan kejadian** siskamling, termasuk mengaktifkan **panic button** yang langsung memicu notifikasi prioritas ke Ketua RT dan pengurus siskamling aktif lainnya.
- Menerima **alert kehadiran** bila belum check-in dalam 30 menit setelah jadwal shift dimulai.

**Batasan**: Tidak berwenang approve jadwal final, tidak berwenang menutup/mengubah status kejadian menjadi "selesai" (itu kewenangan RT/petugas yang di-assign berdasarkan alur SIPANDU/siskamling).

---

## 9. Ibu PKK (Level 5)

**Sifat akses**: Sama seperti Warga standar, ditambah akses ke modul kesehatan & kegiatan **jika modul kesehatan diaktifkan** (3.1).

**Catatan penting dari Bab 10 (Non-Goals)**: Modul Monitoring Kesehatan penuh (jadwal Posyandu, alert wabah) **di luar scope MVP** — yang tersedia hanya kategori data "Penyakit Warga" (kategori j) sebagai field data, bukan modul CRUD penuh. Artinya role ini **belum punya modul kesehatan aktif untuk digarap di MVP**, kecuali diputuskan lain di kemudian hari.

**Rekomendasi implementasi**: Untuk MVP, perlakukan role ini identik dengan Warga (gunakan `WargaPage` yang sama), tanpa menu tambahan, sampai modul kesehatan resmi masuk scope.

---

## 10. Karang Taruna (Level 5)

**Sifat akses**: Sama seperti Warga standar, ditambah akses ke agenda, dokumentasi, dan pengumuman kepemudaan (3.1).

**Catatan dari Bab 10 (Non-Goals)**: Modul **Inventaris dan Agenda/Kalender penuh belum termasuk scope MVP**. Artinya kewenangan tambahan role ini juga **belum ada modul khusus untuk digarap** di fase sekarang.

**Rekomendasi implementasi**: Sama seperti Ibu PKK — untuk MVP, perlakukan sebagai Warga standar tanpa menu tambahan.

---

## Ringkasan Referensi Cepat (Actions per Modul)

| Action | Arti |
|---|---|
| Create | Membuat data/entri baru |
| Read | Melihat data yang ada |
| Update | Mengubah data yang ada |
| Delete | Menghapus/menonaktifkan data |
| Approve | Memberikan persetujuan final |
| Verify | Verifikasi data di level menengah (bukan keputusan akhir) |
| Assign | Menugaskan ke pihak lain |
| Sign | Memicu proses tanda tangan digital |
| Export | Mengekspor data/laporan |

---

## Business Rules Lintas-Role (Wajib Ditegakkan di Backend, Bukan Cuma UI)

1. **Satu jabatan strategis** (Ketua RT, Sekretaris, Bendahara) hanya boleh dipegang **satu warga aktif** dalam satu periode per RT. Backend wajib mencegah dua warga aktif memegang jabatan sama secara bersamaan.
2. **Pergantian pengurus otomatis memicu penyesuaian RBAC** — role lama dicabut/diakhiri, role baru diberikan sesuai periode jabatan baru. Ini proses otomatis, bukan manual toggle.
3. **Data sensitif** (kurang mampu, penyakit, WNA, penerima bansos) **hanya boleh diakses Ketua RT, Sekretaris, dan Bendahara** — dilarang tampil ke warga umum dalam bentuk apapun, **termasuk di response API** (bukan cuma disembunyikan di frontend). Ini berarti filtering harus terjadi di level backend/serializer, bukan cuma `if (role === 'warga') hide()` di React.
4. Semua endpoint tetap wajib validasi permission per request (**Zero Trust**, 5.3) — tidak boleh asumsikan request dari role tertentu otomatis dipercaya hanya karena datang dari middleware auth yang sama.

---

## Rekomendasi Struktur Sidebar per Role (untuk Frontend)

Berdasarkan tabel di atas, berikut menu yang relevan tampil di sidebar tiap role — dipetakan langsung dari kolom permission, supaya menu yang muncul = modul yang benar-benar punya akses (bukan menu kosong/disabled):

| Role | Menu Sidebar yang Relevan |
|---|---|
| **Warga** | Beranda, Pengaduan, Keuangan (read), Iuran (own), Surat Resmi (request), Siskamling (read), Peraturan, Struktur Organisasi, Pengumuman, Notifikasi, Feedback |
| **Ketua RT** | Beranda/Dashboard (full), Data Warga (CRUD), Perumahan, Tamu (approve), Keuangan (read), Iuran (approve), Surat Keterangan (approve), Siskamling (CRUD jadwal), Informasi & Statistik (CRUD+export), Peraturan (CRUD), Struktur Organisasi (CRUD), Pesan Warga, User Management (RT scope) |
| **Sekretaris RT** | Dashboard, Data Warga (CRUD), Perumahan (CRUD), Tamu (read), Surat Keterangan (verify), Peraturan (CRUD), Pesan Warga (read), Statistik |
| **Bendahara RT** | Dashboard, Keuangan (CRUD), Iuran (CRUD), Data Warga (read terbatas), Perumahan (read, khusus status pajak) |
| **Admin RT** | Dashboard, Master Data, Manajemen User, Konfigurasi Notifikasi |
| **Ketua RW** | Dashboard (read), Data Warga (verify), Keuangan (monitor), Surat Keterangan (read), Statistik (read+export), Eskalasi Pengaduan |
| **Kelurahan** | Dashboard (read), Data Warga (read), Statistik (read+export), Peraturan (read) — tanpa menu operasional |
| **Pengurus Siskamling** | Sama seperti Warga + Jadwal Ronda, Presensi (check-in GPS), Lapor Kejadian, Panic Button |
| **Ibu PKK / Karang Taruna** | Sama seperti Warga (belum ada modul tambahan aktif di MVP) |
