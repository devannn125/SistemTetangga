# PRD Gabungan — Sistem Informasi Administrasi RT Digital

> **Catatan penyusunan dokumen**: Dokumen ini adalah hasil penggabungan dua PRD sumber:
> - **PRD "Tetangga" v1.0** (2025) — cakupan modul umum administrasi RT/RW, termasuk Keuangan & Iuran.
> - **PRD "Sistem Informasi Administrasi RT Digital" v2.0** (31 Juli 2026) — cakupan modul detail per domain, kategori statistik warga (a–j), dan integrasi Tanda Tangan Digital.
>
> **Perubahan yang disengaja dari kedua dokumen sumber:**
> 1. **Modul AI Assistant (OpenClaw) DIHILANGKAN dari scope dokumen ini.** Seluruh requirement terkait AI Agent, LLM, chat assistant, automation berbasis AI tidak dibahas di sini. Fokus dokumen ini murni pada sistem informasi administrasi.
> 2. **Arsitektur diubah dari Event-Driven Microservices menjadi Monolith Modular.** PRD sumber kedua awalnya merancang 17 microservice terpisah dengan database-per-service dan event bus (Kafka/RabbitMQ). Keputusan final: satu aplikasi Laravel dengan satu database MySQL, modul dipisah rapi di level folder/namespace, bukan di level service/database terpisah. Semua istilah "Service" pada dokumen asli (Citizen Service, Letter Service, dst) di dokumen ini dibaca sebagai **modul/domain dalam satu aplikasi**, bukan aplikasi terpisah.
> 3. **Tech stack dikunci ke: Laravel (backend) + MySQL (database) + React.js (frontend).** Bagian tech stack di kedua dokumen asli (Node.js/NestJS, PostgreSQL, Kafka/RabbitMQ, Prisma, dll) digantikan total. Hanya komponen pendukung yang kompatibel dengan stack ini yang dipertahankan.
> 4. Business rules dan alur kerja (workflow) dari kedua dokumen sumber **dipertahankan persis** — bagian ini yang paling penting untuk diikuti oleh AI model yang membaca dokumen ini, karena mendefinisikan perilaku sistem yang benar.

---

## 1. Ringkasan Eksekutif

Sistem Informasi Administrasi RT Digital adalah aplikasi web yang mendigitalisasi seluruh proses administrasi RT (Rukun Tetap) di Indonesia — menggantikan proses manual berbasis dokumen fisik, spreadsheet, dan grup WhatsApp.

Cakupan sistem: pendataan warga dan rumah, pelayanan surat keterangan dengan tanda tangan digital, keamanan lingkungan (siskamling), transparansi keuangan RT, distribusi informasi/pengumuman, dan notifikasi warga melalui Telegram Bot.

### Masalah yang Diselesaikan

| No | Masalah | Dampak |
|---|---|---|
| 1 | Data warga tidak sinkron antara buku administrasi, Excel, dan catatan RW/Kelurahan | Duplikasi data, rawan kehilangan data |
| 2 | Pembuatan surat keterangan lama karena proses manual dan tanda tangan basah | Warga frustrasi, birokrasi tidak efisien |
| 3 | Ketua RT/RW kesulitan memperoleh statistik warga secara real-time | Pengambilan keputusan tidak berbasis data |
| 4 | Pendataan tamu tidak konsisten | Menyulitkan pemantauan keamanan lingkungan |
| 5 | Monitoring rumah kos (penghuni, status pajak, kondisi kamar) tidak akurat | Data selalu tertinggal |
| 6 | Riwayat perpindahan warga tidak terdokumentasi | Hilangnya jejak historis |
| 7 | Informasi/pengumuman RT hanya lewat grup WhatsApp | Mudah tenggelam, sulit ditelusuri kembali |
| 8 | Transparansi keuangan RT rendah | Warga tidak percaya, potensi konflik |
| 9 | Pengaduan warga tidak tertangani terstruktur | Keluhan menumpuk, kepercayaan menurun |

### Nilai Proposisi

- **Transparansi** — laporan keuangan dan kegiatan dapat diakses warga secara real-time
- **Efisiensi** — otomasi administrasi mengurangi beban kerja pengurus RT/RW
- **Kepercayaan** — data terintegrasi dan terverifikasi
- **Single Source of Truth** — satu basis data warga yang konsisten, alur kerja persetujuan terstruktur
- **Aksesibilitas** — antarmuka sederhana untuk semua kalangan usia, mobile-first

---

## 2. Tujuan Bisnis & KPI

| Goal | Deskripsi | Target |
|---|---|---|
| 1 | Digitalisasi Administrasi RT | 100% surat keterangan diproses secara digital |
| 2 | Single Source of Truth Data Warga | 0% duplikasi data warga/NIK pada sistem |
| 3 | Efisiensi Proses Layanan Surat | Waktu pembuatan surat turun dari ±30 menit menjadi ≤2 menit; ≤24 jam per surat end-to-end |
| 4 | Integrasi Kanal Komunikasi Warga (Telegram Bot) | ≥95% notifikasi layanan administrasi & informasi diterima warga |
| 5 | Transparansi Keamanan Lingkungan | 100% jadwal & kejadian siskamling tercatat digital |
| 6 | Peningkatan Partisipasi Warga | ≥70% warga aktif menggunakan kanal Telegram Bot |
| 7 | Adopsi Platform | 100 RT/RW aktif dalam 6 bulan |
| 8 | Transparansi Keuangan | 100% laporan keuangan dipublikasikan per bulan |
| 9 | Respons Pengaduan | Rata-rata waktu penyelesaian laporan ≤3 hari kerja |

---

## 3. Target Pengguna & Hak Akses

### 3.1 Daftar Role

| Role | Level Hierarki | Deskripsi Akses Utama |
|---|---|---|
| **Kelurahan** | 1 | Akses read-only terhadap data kependudukan dan statistik untuk kebutuhan pelaporan wilayah |
| **Ketua RW** | 2 | Akses agregat statistik dan laporan seluruh RT di bawahnya (read + limited approval), verifikasi data warga baru |
| **Ketua RT** | 3 | Approval surat keterangan, approval tamu warga, kelola struktur organisasi & pengurus, akses penuh dashboard statistik |
| **Sekretaris RT** | 4 | Input & kelola data warga/KK/rumah, memproses (verifikasi) permohonan surat, mengelola tata tertib dan informasi/pengumuman |
| **Bendahara RT** | 4 | Kelola keuangan & iuran RT, akses data warga terkait iuran dan bantuan sosial, laporan kependudukan penerima bansos |
| **Admin RT** | 4 | Administrasi umum sistem tingkat RT: manajemen user, master data, konfigurasi notifikasi |
| **Warga** | 5 | Mengajukan permohonan surat, melihat informasi & pengumuman, membayar iuran, menerima notifikasi Telegram, mengirim pesan dan kesan |
| **Pengurus Siskamling (Warga Ronda)** | 5 | Input jadwal ronda, absensi check-in GPS, pelaporan kejadian, panic button |
| **Ibu PKK** | 5 | Akses modul kesehatan dan kegiatan (jika modul kesehatan diaktifkan) |
| **Karang Taruna** | 5 | Akses agenda, dokumentasi, pengumuman kepemudaan |

### 3.2 Permission Matrix per Modul

| Modul | Kelurahan | Ketua RW | Ketua RT | Sekretaris RT | Bendahara RT | Warga |
|---|---|---|---|---|---|---|
| Dashboard | Read | Read | Full | Full | Full | Read |
| Data Warga | Read | Verify | CRUD | CRUD | Read | Own Data |
| Perumahan | Read | Read | CRUD | CRUD | Read | — |
| Tamu | — | — | Approve | Read | — | Create (Own) |
| Keuangan | Monitor | Monitor | Read | Read | CRUD | Read |
| Iuran | — | — | Approve | Read | CRUD | Own Data |
| Surat Keterangan | — | Read | Approve | Verify | Read | Request |
| Siskamling | — | — | CRUD/Approve jadwal | Read | Read | Read |
| Informasi & Statistik | Read + Export | Read + Export | CRUD + Export | CRUD | Read (kategori terbatas) | Read (non-sensitif) |
| Peraturan & Tata Tertib | Read | Read | CRUD | CRUD | Read | Read |
| Struktur Organisasi | Read | Read | CRUD | Read | Read | Read |
| Notifikasi & Pesan/Kesan | — | — | Read (pesan warga) | Read (pesan warga) | — | Create + Own |
| User Management | — | — | RT Scope | — | — | Own Profile |

### 3.3 Permission Actions

| Action | Deskripsi | Contoh |
|---|---|---|
| Create | Membuat data/entri baru | Bendahara membuat entri pengeluaran |
| Read | Melihat data yang ada | Warga melihat laporan keuangan |
| Update | Mengubah data yang ada | Sekretaris mengubah nomor surat |
| Delete | Menghapus/menonaktifkan data | Ketua RT menghapus pengumuman lama |
| Approve | Memberikan persetujuan final | Ketua RT approve surat domisili |
| Verify | Verifikasi data di level menengah | Sekretaris verifikasi data warga baru |
| Assign | Menugaskan ke pihak lain | Ketua RT assign pengaduan ke petugas |
| Sign | Memicu proses tanda tangan digital | Ketua RT sign surat via Privy |
| Export | Mengekspor data/laporan | Bendahara export laporan bulanan PDF/Excel |

### 3.4 Business Rules RBAC

- Satu jabatan strategis (**Ketua RT, Sekretaris, Bendahara**) hanya dapat dijabat oleh **satu warga aktif pada satu periode** dalam satu RT. Sistem harus mencegah dua warga aktif memegang jabatan yang sama secara bersamaan di RT yang sama.
- Pergantian pengurus **otomatis memicu penyesuaian hak akses (RBAC)** pada modul Auth — role lama dicabut/diakhiri, role baru diberikan sesuai periode jabatan.
- Data sensitif (**kurang mampu, penyakit, WNA, penerima bansos**) hanya dapat diakses oleh **Ketua RT, Sekretaris, dan Bendahara** — tidak boleh ditampilkan ke warga umum dalam bentuk apapun (termasuk di response API).

---

## 4. Asumsi & Batasan

### Asumsi
- Setiap warga memiliki nomor telepon aktif untuk verifikasi OTP dan terhubung dengan akun Telegram.
- Ketua RT/Sekretaris bertindak sebagai admin operasional yang melakukan verifikasi data awal warga (data onboarding).
- Layanan tanda tangan digital pihak ketiga (**Privy**) tersedia dan dapat diintegrasikan melalui API.
- Struktur wilayah (RT/RW/Kelurahan/Kecamatan/Kabupaten/Provinsi) mengikuti data referensi resmi Kemendagri.

### Batasan
- Fase awal (MVP) hanya mencakup **2 jenis surat keterangan: Domisili dan Usaha**.
- Kanal chatbot resmi adalah **Telegram**; kanal WhatsApp hanya digunakan untuk **OTP autentikasi**, bukan sebagai bot notifikasi utama.
- Sistem **tidak menggantikan** basis data kependudukan resmi (Dukcapil); NIK dan data kependudukan bersifat pelengkap tingkat RT.
- **Modul AI Assistant tidak termasuk dalam scope dokumen ini** (lihat catatan di awal dokumen).

---

## 5. Arsitektur Sistem (Diadaptasi ke Stack yang Dipilih)

> Bagian ini menggantikan total bagian arsitektur di kedua dokumen sumber. Arsitektur asli (Event-Driven Microservices dengan 17 service, Kafka/RabbitMQ, database-per-service) **tidak dipakai**. Business rules dan alur kerja di Bab 6 tetap berlaku persis sama — hanya cara implementasinya yang berbeda (satu aplikasi monolith, bukan banyak service).

### 5.1 Prinsip Arsitektur

- **Monolith Modular** — satu aplikasi Laravel, satu database MySQL. Setiap domain bisnis (Kependudukan, Perumahan, Surat, Siskamling, dll) dipisahkan rapi sebagai modul/namespace di dalam aplikasi yang sama, bukan sebagai aplikasi/service terpisah.
- Tidak ada event bus (Kafka/RabbitMQ). Proses yang di PRD asli digambarkan sebagai "event-driven antar-service" (misal update statistik saat data warga berubah) diimplementasikan sebagai **Laravel Event & Listener** (in-process, bukan lintas jaringan) atau **Laravel Queue Job** (untuk proses asinkron seperti kirim notifikasi).
- Statistik (kategori a–j) dihitung via **query SQL langsung / VIEW**, bukan read-model CQRS terpisah — cukup untuk skala target (100 RT/RW).

### 5.2 Tech Stack (WAJIB — tidak menggunakan stack lain)

| Layer | Teknologi | Catatan |
|---|---|---|
| Backend | **Laravel** (PHP) | REST API + server-rendered admin bila diperlukan |
| Database | **MySQL** | Satu database untuk seluruh modul |
| Frontend | **React.js** | SPA terpisah, konsumsi REST API Laravel |
| Autentikasi | Laravel Sanctum (token-based) **atau** JWT custom | Untuk API yang dikonsumsi React SPA |
| Queue | Laravel Queue (driver: database atau Redis) | Menggantikan peran "job queue" untuk reminder, notifikasi |
| Cache | Redis **atau** file/database cache Laravel | Menggantikan peran Redis Cache di PRD asli, tetap kompatibel |
| Penyimpanan Dokumen | Laravel Filesystem — driver **local**, **S3**, atau kompatibel S3 (mis. MinIO) | Menggantikan Object Storage MinIO/S3 di PRD asli — tetap boleh pakai S3/MinIO karena Laravel filesystem driver mendukungnya secara native |
| Frontend State/Data Fetching | React Query / Axios (bebas dipilih tim) | Tidak diatur ketat, selama tetap React |
| PDF Generation | Library PHP kompatibel Laravel (mis. DomPDF, Snappy) | Untuk generate dokumen surat |
| Chatbot | Telegram Bot API | Dikonsumsi dari backend Laravel (HTTP client), bukan service Node terpisah |
| Digital Signature | Privy API | Dikonsumsi dari backend Laravel (HTTP client) |
| WhatsApp OTP | Provider WhatsApp OTP pihak ketiga | Dikonsumsi dari backend Laravel |

**Yang TIDAK dipakai dari PRD sumber** (karena tidak kompatibel dengan stack yang dipilih): Node.js/NestJS/Golang, PostgreSQL, Kafka/RabbitMQ, Prisma ORM, Kong/NGINX API Gateway terpisah, Kubernetes, Next.js.

### 5.3 Prinsip Desain yang Tetap Dipertahankan (diadaptasi konteks monolith)

- **Idempotency** — proses yang bisa dipicu berulang (misal retry pengiriman notifikasi Telegram) harus aman dijalankan berulang tanpa duplikasi data.
- **Audit Trail** — seluruh perubahan data warga, approval surat, dan aktivitas keuangan tercatat immutable di tabel audit log.
- **Zero Trust dalam konteks monolith** — tetap terapkan validasi permission (RBAC) di setiap endpoint/controller, jangan asumsikan request internal otomatis dipercaya.

---

## 6. Detail Modul — Business Rules & Alur Kerja

> **Bagian ini adalah inti dokumen.** Business rules dan alur kerja di bawah ini diambil verbatim (atau seminimal mungkin diubah redaksinya) dari kedua PRD sumber, karena inilah yang mendefinisikan bagaimana sistem harus berperilaku — terlepas dari perubahan arsitektur/tech stack di atas.

### 6.1 Administrasi & Tata Tertib

#### 6.1.1 Tata Tertib Warga Tetap RT

**Data yang Dikelola**: Judul aturan, kategori aturan (keamanan, kebersihan, iuran, dll), isi/teks aturan, lampiran dokumen (opsional), tanggal berlaku, status (aktif/nonaktif), versi/riwayat perubahan.

**Business Rules**:
- Hanya **Sekretaris/Ketua RT** yang dapat membuat atau mengubah tata tertib.
- Perubahan tata tertib **tercatat sebagai versi baru** (riwayat tidak dihapus/ditimpa).
- Publikasi tata tertib baru **memicu notifikasi** ke seluruh warga.

#### 6.1.2 Tata Tertib Penghuni Tidak Tetap

**Data yang Dikelola**: Judul aturan, kategori (lapor diri, jam malam, sanksi, dll), isi aturan, target (kos putra/putri/campur/harian/bulanan), tanggal berlaku.

**Business Rules**:
- Tata tertib penghuni tidak tetap **ditampilkan otomatis** pada proses pendataan tamu/penghuni kos baru.
- Warga tidak tetap **wajib mengonfirmasi telah membaca** tata tertib saat check-in pertama.

#### 6.1.3 Struktur Organisasi

**Data yang Dikelola**: Nama pengurus (relasi ke data Warga), jabatan (Ketua RT, Sekretaris, Bendahara, PKK, Karang Taruna, Linmas, Siskamling), periode jabatan (mulai/selesai), foto/struktur bagan, status aktif.

**Business Rules**:
- Satu jabatan strategis (Ketua RT, Sekretaris, Bendahara) hanya dapat dijabat oleh **satu warga aktif** pada satu periode.
- Pergantian pengurus **otomatis memicu penyesuaian hak akses (RBAC)**.

---

### 6.2 Kependudukan

#### 6.2.1 Pendataan Warga

**Data yang Dikelola**: NIK, nama lengkap, No. KK, tempat & tanggal lahir, jenis kelamin, agama, status nikah, pendidikan terakhir, profesi, no. HP, email, status warga (tetap/tidak tetap), tanggal masuk/keluar RT, alamat lengkap (RT/RW/Kelurahan/Kecamatan/Kabupaten/Provinsi), status hidup, status aktif.

**Business Rules**:
- **NIK tidak boleh duplikat** dalam sistem.
- Satu warga hanya memiliki **satu KK aktif** pada satu waktu.
- Setiap **perubahan alamat/status wajib tersimpan sebagai riwayat** (tidak menimpa data lama).
- Data warga nonaktif (pindah/meninggal) **tetap tersimpan** untuk keperluan histori dan audit.

**Alur Kerja**:
1. Sekretaris/Admin menginput atau mengimpor data warga (manual/Excel).
2. Sistem melakukan validasi duplikasi NIK.
3. Data tersimpan dan memicu proses pembaruan agregat statistik (Laravel Event/Listener, bukan event lintas-service).
4. Statistik diperbarui secara asinkron (Laravel Queue Job).

#### 6.2.2 Informasi Keluarga (KK)

**Data yang Dikelola**: No. KK, kepala keluarga (relasi ke Warga), daftar anggota keluarga, hubungan keluarga (anak, istri, dsb), riwayat perubahan KK.

**Business Rules**:
- Satu KK dapat memiliki banyak anggota, namun **hanya satu kepala keluarga aktif**.
- Perpindahan anggota antar-KK **tercatat sebagai riwayat**.

---

### 6.3 Perumahan

#### 6.3.1 Rumah Warga Non-Kos

**Data yang Dikelola**: Alamat, koordinat GPS, data pemilik (relasi Warga), status kepemilikan (milik sendiri/kontrak), jumlah penghuni, status pajak, foto rumah.

**Business Rules**:
- Perubahan **status pajak wajib diinput oleh Bendahara/Admin RT**.

#### 6.3.2 Rumah Warga Kos

**Data yang Dikelola**: Kategori kos (**campur, putra, putri, harian, bulanan, tahunan, tidak aktif**), data pemilik/pengelola, koordinat GPS, foto rumah/kamar, jumlah kamar, jumlah penghuni saat ini, status pajak.

**Business Rules**:
- Setiap kamar kos memiliki **status okupansi (kosong/terisi)** yang diperbarui otomatis saat penghuni check-in/check-out.
- Rumah kos dengan status **"tidak aktif" tidak muncul** pada proses pendataan tamu baru.

**Alur Kerja**:
1. Pengelola/pemilik kos mendaftarkan rumah kos beserta jumlah kamar.
2. Penghuni baru dicatat melalui modul Tamu/Warga (status tidak tetap).
3. Sistem memperbarui okupansi kamar secara real-time.
4. Data rumah kos diagregasi untuk dashboard.

---

### 6.4 Pendataan Tamu

**Data yang Dikelola**: Nama tamu, NIK/identitas, asal, rumah tujuan (relasi Perumahan), jam masuk/keluar, lama tinggal, foto identitas, status (menunggu, disetujui, ditolak, check-out).

**Business Rules**:
- Tamu yang menginap **lebih dari 1x24 jam wajib mendapat approval RT**.
- Data tamu tersimpan sesuai kebijakan retensi data untuk kebutuhan keamanan.

**Alur Kerja**:
1. Warga/pemilik rumah melakukan check-in tamu melalui web/Telegram Bot.
2. Sistem mengirim notifikasi permohonan approval ke Ketua RT (**untuk tamu menginap**).
3. Ketua RT menyetujui/menolak melalui dashboard.
4. Petugas siskamling dapat memantau status tamu aktif secara real-time.
5. Tamu melakukan check-out, status diperbarui otomatis.

---

### 6.5 Layanan Surat Keterangan

> Fase awal (MVP) mencakup **dua jenis surat keterangan**: Surat Keterangan Domisili dan Surat Keterangan Usaha. Keduanya menggunakan alur kerja dan integrasi tanda tangan digital yang sama.

#### 6.5.1 Surat Keterangan Domisili

**Data yang Dikelola**: Data pemohon (relasi Warga), keperluan surat, alamat domisili, nomor surat (auto-generate), tanggal terbit, status (diajukan, diverifikasi, disetujui, ditandatangani, terbit).

**Business Rules**:
- Pemohon **harus berstatus warga aktif**.
- **Nomor surat mengikuti format penomoran resmi RT** dan tidak boleh duplikat — format: `[Kode]/[Jenis]/[RT]/[RW]/[Bulan]/[Tahun]`.

#### 6.5.2 Surat Keterangan Usaha

**Data yang Dikelola**: Data pemohon (relasi Warga), nama usaha, jenis/bidang usaha, alamat usaha, lama usaha berjalan, nomor surat (auto-generate), status permohonan.

**Business Rules**:
- Data usaha **dapat diverifikasi lapangan** oleh Sekretaris/Ketua RT sebelum approval.

**Alur Kerja Umum Layanan Surat**:
1. Warga mengajukan permohonan surat melalui web/Telegram Bot beserta data pendukung.
2. **Sekretaris RT** melakukan verifikasi data pemohon dan kelengkapan dokumen.
3. **Ketua RT** melakukan approval permohonan.
4. Sistem men-generate dokumen PDF (server-side, Laravel PDF library).
5. Dokumen dikirim ke **Digital Signature (Privy)** untuk ditandatangani.
6. Sistem mengirim notifikasi surat terbit ke pemohon melalui Telegram Bot.
7. Warga mengunduh surat yang telah ditandatangani secara digital.

**Fitur Teknis Tambahan** (dari PRD Tetangga, tetap berlaku):
- **QR Code verifikasi keaslian surat** pada dokumen fisik/digital — dipindai tanpa login, menampilkan status keabsahan.
- Notifikasi WhatsApp/email sebagai kanal cadangan saat status berubah.
- Arsip digital surat yang telah diterbitkan.

---

### 6.6 Tanda Tangan Digital (Integrasi Privy)

**Data yang Dikelola**: Dokumen PDF (referensi), status tanda tangan (menunggu, ditandatangani, gagal), ID transaksi Privy, URL QR code, URL dokumen hasil tanda tangan, waktu tanda tangan.

**Fungsi**: Menyediakan kemampuan penandatanganan dokumen surat keterangan secara digital dan sah secara hukum melalui integrasi API Privy, termasuk verifikasi keaslian dokumen melalui QR code.

---

### 6.7 Siskamling (Keamanan Lingkungan)

**Data yang Dikelola**:
- **Jadwal**: petugas, shift (pagi/sore/malam), tanggal jadwal.
- **Presensi**: waktu check-in, koordinat GPS, foto (opsional).
- **Kejadian**: pelapor, jenis kejadian, lokasi, deskripsi, foto, status (baru, ditindaklanjuti, selesai), flag panic button.

**Business Rules**:
- Kejadian yang dilaporkan melalui **panic button diprioritaskan** dan langsung memicu notifikasi ke Ketua RT dan pengurus siskamling aktif.
- Admin/Ketua RT menyusun jadwal shift dan regu ronda.
- Sistem mengirim notifikasi real-time ke Ketua RT dan pengurus terkait melalui Telegram Bot.
- (Dari PRD Tetangga) **Petugas yang tidak check-in dalam 30 menit** setelah jadwal shift dimulai memicu alert kehadiran ke Ketua RT dan petugas cadangan.

---

### 6.8 Informasi & Statistik

> Modul ini menyediakan informasi keluarga dan **sepuluh (10) kategori informasi warga** sebagai turunan analitik dari data Kependudukan, Keluarga, dan Perumahan. Seluruh data bersifat **read-only bagi Warga**, dan dapat difilter/diekspor oleh Ketua RT, Sekretaris, dan Ketua RW.

#### 6.8.1 Informasi Keluarga

Ringkasan data keluarga (jumlah KK, anggota per KK, struktur keluarga), disajikan dalam bentuk daftar dan detail per KK.

#### 6.8.2 Informasi Warga (Kategori a–j)

| Kode | Kategori Informasi | Deskripsi |
|---|---|---|
| a | Warga Berhak Mengikuti Pemilu | Daftar warga yang memenuhi syarat usia dan status kependudukan sebagai pemilih (DPT tingkat RT) |
| b | Warga Berdomisili di Luar | Warga terdaftar pada KK/RT namun berdomisili di luar wilayah RT |
| c | Warga Alamat KK Luar | Warga yang tinggal di RT namun alamat KK berada di luar wilayah RT (pendatang/kos) |
| d | Warga Berdasarkan Usia | Segmentasi warga per kelompok usia: balita, batita, anak, produktif, lansia |
| e | Warga Kurang Mampu | Daftar warga dengan status sosial-ekonomi kurang mampu berdasarkan data yang diinput/diverifikasi RT |
| f | Warga Negara Asing (WNA) | Daftar warga berkewarganegaraan asing yang berdomisili di wilayah RT |
| g | Profesi Warga | Distribusi warga berdasarkan profesi/pekerjaan |
| h | Warga Penerima Bantuan Sosial | Daftar warga penerima program bantuan sosial (by kategori program) |
| i | Statistik Kependudukan | Statistik agregat: gender, status perkawinan, usia produktif/tidak produktif, balita, batita, warga tidak tetap, dll |
| j | Penyakit Warga | Data kondisi kesehatan/penyakit warga yang **diinput secara sukarela** untuk kebutuhan mitigasi kesehatan lingkungan (mis. penyakit menular) |

**Business Rules**:
- Data sensitif (**kurang mampu, penyakit, WNA**) hanya dapat diakses oleh **Ketua RT, Sekretaris, dan Bendahara** — tidak ditampilkan ke warga umum.
- Data statistik diperbarui otomatis setiap terjadi perubahan pada data warga/keluarga/rumah (via Laravel Event/Listener/Queue, bukan event bus lintas-service).

---

### 6.9 Notifikasi & Chatbot Telegram

> Modul ini menggantikan peran grup WhatsApp sebagai kanal komunikasi utama RT dengan chatbot Telegram terstruktur.

#### 6.9.1 Notifikasi Layanan Administrasi Warga

**Data yang Dikelola**: Jenis notifikasi (status surat, approval tamu, dsb), penerima (relasi Warga), isi pesan, status pengiriman (terkirim/gagal), waktu kirim.

**Business Rules**:
- Notifikasi administrasi **bersifat wajib** (tidak dapat dimatikan warga) karena terkait status permohonan aktif.
- Kegagalan pengiriman Telegram **di-retry otomatis maksimal 3 kali** sebelum ditandai gagal.

#### 6.9.2 Notifikasi Layanan Informasi Warga

**Data yang Dikelola**: Jenis informasi (pengumuman, agenda, tata tertib, dokumen), target penerima (semua warga/segmentasi tertentu), isi pesan & lampiran.

**Business Rules**:
- Warga **dapat memilih untuk berlangganan/berhenti berlangganan** kategori notifikasi informasi tertentu (opsional, tidak wajib seperti notifikasi administrasi).

#### 6.9.3 Pesan dan Kesan

Kanal dua arah bagi warga untuk menyampaikan pesan, masukan, keluhan, atau kesan kepada pengurus RT melalui chatbot Telegram.

**Data yang Dikelola**: Pengirim (relasi Warga), isi pesan/kesan, kategori (masukan, keluhan, apresiasi, lainnya), waktu kirim, status tindak lanjut (baru, dibaca, ditindaklanjuti).

**Business Rules**:
- Setiap pesan warga tercatat dan dapat ditinjau oleh **Sekretaris/Ketua RT** melalui dashboard.
- Identitas pengirim **dapat disembunyikan (anonim)** sesuai preferensi warga, **kecuali untuk kategori keluhan** yang memerlukan tindak lanjut langsung.

**Arsitektur Notifikasi (diadaptasi)**: Proses notifikasi bertindak sebagai orchestrator (Laravel Job/Listener) yang bereaksi terhadap perubahan data dari modul lain (Surat, Tamu, Siskamling, Informasi/Peraturan) dan menentukan kanal pengiriman. Telegram Bot menjadi kanal utama pengiriman pesan keluar (outbound) sekaligus penerima pesan masuk (inbound: pesan & kesan, konfirmasi tamu, dsb). Kanal WhatsApp dipertahankan terbatas untuk OTP autentikasi saja.

---

### 6.10 Sistem Pengaduan (SIPANDU) — dari PRD Tetangga

> Modul ini berbeda dari "Pesan dan Kesan" di atas — ini adalah sistem pengaduan formal dengan tiket dan eskalasi berjenjang.

**Data yang Dikelola**: Judul (maks 100 karakter, wajib, min 10 karakter), kategori (Infrastruktur/Keamanan/Kebersihan/Sosial/Lainnya), deskripsi (maks 1000 karakter, wajib, min 30 karakter), foto (opsional, maks 3 foto @5MB), lokasi (teks atau pin peta, opsional), tingkat urgensi (Rendah/Sedang/Tinggi/Darurat).

**Alur Kerja**:
1. Warga input laporan → **nomor tiket otomatis** ter-generate (format: `#ADU-[TAHUN]-[NOMOR URUT]`).
2. Ketua RT menerima notifikasi → RT review dan **assign petugas**.
3. Petugas menangani → update progress dengan komentar dan foto bukti.
4. Jika **tidak selesai dalam 3 hari** → **eskalasi otomatis ke RW**.
5. Jika **tidak selesai dalam 7 hari** → **eskalasi otomatis ke Dukuh/Kelurahan**.
6. Selesai → warga dapat memberi **rating kepuasan (1–5 bintang)**.

**Status Badge**: Pending (kuning) → Diproses (biru) → Eskalasi (oranye) → Selesai (hijau) / Ditolak (merah).

> **Catatan implementasi**: modul ini terpisah dari tabel `feedback`/"Pesan dan Kesan" — keduanya melayani kebutuhan berbeda (pesan & kesan bersifat informal dua arah, SIPANDU bersifat formal dengan SLA dan eskalasi).

---

### 6.11 Keuangan & Iuran RT — dari PRD Tetangga

> Modul ini tidak ada di PRD "RT Digital", namun tetap dipertahankan karena relevan untuk kebutuhan transparansi RT secara keseluruhan.

#### 6.11.1 Keuangan RT

**Fitur & Permission**:
| Fitur | Deskripsi | Permission |
|---|---|---|
| Input Pemasukan | Catat sumber dan jumlah pemasukan kas RT | Bendahara (Create) |
| Input Pengeluaran | Catat pengeluaran dengan kategori dan bukti | Bendahara (Create) |
| Laporan Bulanan | Rangkuman keuangan per bulan dengan export | RT ke atas (Read) |
| Cashflow Chart | Visualisasi arus kas dalam periode tertentu | Semua (Read) |
| Export Laporan | Download laporan PDF/Excel | Bendahara, RT, RW |
| Audit Trail | Log setiap perubahan data keuangan | RT ke atas (Read) |

#### 6.11.2 Iuran Warga

**Fitur**: Data tagihan (sistem tagihan per KK), status pembayaran (Lunas/Belum Bayar/Sebagian), riwayat transaksi, reminder otomatis sebelum jatuh tempo, konfirmasi manual oleh Bendahara, rekap bulanan iuran masuk vs target.

**Business Rules (implisit dari deskripsi PRD)**:
- Reminder otomatis dikirim **H-7 dan H-1** sebelum jatuh tempo.
- Status tagihan harus mendukung pembayaran **sebagian (partial)**, bukan hanya lunas/belum.

---

### 6.12 Layanan Pendukung

#### 6.12.1 Document Service (Modul Dokumen)
Generate dokumen PDF dari template resmi RT/RW untuk surat keterangan dan laporan.

#### 6.12.2 Audit Log
Seluruh perubahan data warga, approval surat, dan aktivitas keuangan **tercatat immutable**.

#### 6.12.3 Reporting
Ekspor laporan lintas modul (kependudukan, surat, siskamling, keuangan) dalam format Excel/PDF untuk kebutuhan pelaporan ke RW/Kelurahan.

#### 6.12.4 Master Data
**Data yang Dikelola**: Wilayah (Provinsi, Kabupaten, Kecamatan, Kelurahan, RT/RW), Agama, Pendidikan, Profesi, Kategori bantuan sosial.

#### 6.12.5 Dashboard

**Widget & Role yang Melihat**:
| Widget | Deskripsi | Role |
|---|---|---|
| Statistik Penduduk | Total warga, KK, warga baru bulan ini | Semua role admin |
| Statistik Laporan (Pengaduan) | Total pengaduan, status breakdown, tren | RT, RW, Kelurahan |
| Statistik Keuangan | Pemasukan, pengeluaran, saldo kas RT | RT, RW, Kelurahan, Bendahara |
| Statistik Surat | Surat masuk/keluar, pending approval | RT, Sekretaris, RW |
| Activity Timeline | Log aktivitas terkini | Semua role admin |
| Grafik Keuangan | Bar chart pemasukan vs pengeluaran bulanan | RT, Bendahara, RW, Kelurahan |
| Pie Chart Pengaduan | Breakdown kategori pengaduan | RT, RW, Kelurahan |

---

## 7. Kebutuhan Non-Fungsional (NFR)

| Kategori | Kebutuhan |
|---|---|
| Keamanan | Enkripsi data at-rest & in-transit (TLS 1.2+); RBAC granular per role; audit log untuk seluruh aksi sensitif; JWT/Sanctum dengan expiry wajar (mis. access token pendek, refresh token lebih panjang); rate limiting pada endpoint login |
| Kepatuhan Data Pribadi | Kepatuhan terhadap **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP)**: consent eksplisit untuk data sensitif (kesehatan, kondisi ekonomi), hak akses & penghapusan data warga; NIK dienkripsi at-rest |
| Ketersediaan | Target SLA 99.5% untuk fungsi inti (Auth, Kependudukan, Surat, Notifikasi) |
| Performa | Waktu respons API rata-rata < 500ms untuk operasi baca; generate surat + tanda tangan digital selesai < 2 menit; Page Load Time < 2 detik (LCP) |
| Skalabilitas | Arsitektur monolith dengan connection pooling database; horizontal scaling di level aplikasi (multiple instance Laravel di belakang load balancer) bila diperlukan — bukan scaling per-modul seperti microservices |
| Observability | Logging terpusat (Laravel Log/Sentry), monitoring dashboard |
| Backup & Disaster Recovery | Backup database harian otomatis, RPO ≤ 24 jam, RTO ≤ 4 jam |
| Aksesibilitas | Web responsif mobile-first, WCAG 2.1 AA compliance, mendukung akses browser umum tanpa instalasi tambahan |
| Auditabilitas | Seluruh perubahan data warga, approval surat, dan aktivitas keuangan tercatat immutable |
| Kompatibilitas | Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+; Mobile: iOS 14+ Safari, Android Chrome 90+ |
| Lokalisasi | Bahasa Indonesia penuh, format tanggal lokal (DD/MM/YYYY) |

---

## 8. Integrasi Eksternal

| Integrasi | Digunakan Untuk | Tujuan |
|---|---|---|
| Privy API | Modul Tanda Tangan Digital | Tanda tangan digital dokumen surat keterangan yang sah secara hukum |
| Telegram Bot API | Modul Notifikasi | Kanal notifikasi utama dan pesan/kesan dua arah dengan warga |
| WhatsApp OTP Provider | Modul Autentikasi | Pengiriman kode OTP untuk verifikasi login/registrasi |
| Portal Kelurahan (Read-Only) | Modul Statistik & Reporting | Penyediaan data agregat kependudukan RT untuk pelaporan wilayah |

---

## 9. Kebutuhan Data Dummy/Seed (Development & Testing)

| Entitas | Jumlah Minimum | Detail |
|---|---|---|
| Data Warga | 25 warga | Variasi status: tetap, kos, tamu; mix gender & usia |
| Pengaduan (SIPANDU) | 20 laporan | Semua kategori dan status workflow terwakili |
| Transaksi Keuangan | 15 entri | Mix pemasukan & pengeluaran, 3 bulan terakhir |
| Tagihan Iuran | 25 tagihan | Mix status lunas, belum bayar, sebagian |
| Surat Digital | 12 surat | Semua jenis surat, berbagai status workflow |
| Jadwal Ronda | 8 minggu data | Lengkap dengan presensi dan minimal 3 kejadian |
| User Accounts | 15 akun | Satu per role utama, beberapa warga biasa |

---

## 10. Non-Goals (Eksplisit di luar scope dokumen ini)

- **Modul AI Assistant / Chat Agent (OpenClaw)** — termasuk Q&A otomatis, ringkasan berbasis AI, draft dokumen otomatis, insight analytics berbasis AI, reminder cerdas berbasis AI. Seluruh requirement ini **dihilangkan dari scope saat ini** dan dapat dibahas sebagai fase terpisah di masa depan.
- Arsitektur event-driven microservices, Kafka/RabbitMQ, database-per-service, Kubernetes — digantikan oleh arsitektur monolith modular sesuai Bab 5.
- Modul Monitoring Kesehatan penuh (jadwal Posyandu, alert wabah) — hanya kategori statistik (j) Penyakit Warga yang dipertahankan sebagai field data, bukan modul CRUD penuh, kecuali diputuskan lain di kemudian hari.
- Modul Inventaris dan Agenda/Kalender penuh — belum termasuk scope MVP dokumen ini, dapat ditambahkan di fase berikutnya.

---

## 11. Glosarium

| Istilah | Definisi |
|---|---|
| RT | Rukun Tetap, unit administratif terkecil di bawah RW |
| RW | Rukun Warga |
| KK | Kartu Keluarga |
| Siskamling | Sistem Keamanan Lingkungan (ronda malam) |
| RBAC | Role-Based Access Control, pengaturan hak akses berdasarkan peran |
| SIPANDU | Sistem Pengaduan Warga (modul pengaduan formal dengan tiket & eskalasi) |
| NIK | Nomor Induk Kependudukan |
| Privy | Penyedia layanan tanda tangan digital pihak ketiga yang sah secara hukum |
