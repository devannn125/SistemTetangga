# Database Schema — Sistem Tetangga (Sesuai Struktur Aktual)

> Dokumen ini mendeskripsikan skema database MySQL **persis sesuai struktur yang ada di database saat ini** (diregenerasi dari database aktif via `mysqldump`, 20 Agustus 2026 — menggantikan export phpMyAdmin 16 Agustus 2026 yang berisi beberapa id referensi tidak konsisten seperti `WIL-RT-001`/`WIL-RW-001`/`WIL-KEL-001` yang tidak sesuai PK tabel `wilayah`). Tujuannya agar AI coding assistant (Copilot, Claude, dsb) di VSCode dapat membaca konteks skema tanpa perlu query database langsung.
>
> **Konvensi penamaan yang berlaku di skema ini:**
> - Primary key setiap tabel: `id_<nama_tabel>` (contoh: `id_citizen`, `id_house`), kecuali tabel `users` yang PK-nya `id_users` (plural, mengikuti konvensi Laravel).
> - Semua PK bertipe `char(36)` (UUID) **kecuali**: `permission_action.id_permission_action` (`tinyint`, auto increment) dan `audit_log.id_action_log`, `citizen_history.id_citizen_history` (`bigint`, auto increment).
> - Kolom `created_at`/`updated_at` bertipe `datetime`, default `current_timestamp()`.
> - Kolom boolean disimpan sebagai `tinyint(1)` (standar MySQL, dibaca sebagai `true/false` di Laravel).
>
> **⚠️ Penyimpangan/hal yang perlu diperhatikan dari skema ini** (dicatat apa adanya, bukan diperbaiki otomatis):
> 1. `users.id_citizen` **tidak punya foreign key constraint** ke `citizen.id_citizen` di level database — relasinya cuma logis, harus divalidasi di application layer.
> 2. `audit_log.id_permission_action` bertipe `varchar(50)`, **bukan foreign key** ke `permission_action` — kolom ini menyimpan kode aksi sebagai teks bebas (denormalized), bukan referensi relasional.
> 3. `announcement_read_status.id_announcement_read_status` — nama kolom ini sebenarnya adalah **foreign key ke `announcement.id_announcement`**, bukan primary key baru. Kemungkinan besar hasil auto-naming dari tools desain skema. Perlakukan sebagai FK ke announcement, bukan identitas sendiri. **Data sudah diselaraskan** (nilai `ARS-001`/`ARS-002` lama diperbaiki menjadi `ANN-001`/`ANN-002`).
> 4. `citizen_history.changed_by`, `iuran_tagihan.dikonfirmasi_oleh`, `permission_override.created_by` — **tidak punya foreign key constraint** meski secara logis berisi `users.id_users`. Validasi harus dilakukan di application layer.
> 5. `notification_subscription` dan `announcement_read_status` adalah **tabel pivot dengan composite primary key** (tidak ada kolom PK tunggal beranama `id`).

---

## Daftar Tabel

1. [wilayah](#wilayah)
2. [master_data](#master_data)
3. [users](#users)
4. [role](#role)
5. [module](#module)
6. [permission_action](#permission_action)
7. [user_role](#user_role)
8. [role_permission](#role_permission)
9. [permission_override](#permission_override)
10. [user_session](#user_session)
11. [audit_log](#audit_log)
12. [family](#family)
13. [citizen](#citizen)
14. [citizen_history](#citizen_history)
15. [house](#house)
16. [house_photo](#house_photo)
17. [kos_room](#kos_room)
18. [guest](#guest)
19. [letter_request](#letter_request)
20. [digital_signature](#digital_signature)
21. [siskamling_schedule](#siskamling_schedule)
22. [siskamling_checkin](#siskamling_checkin)
23. [siskamling_incident](#siskamling_incident)
24. [organization_member](#organization_member)
25. [regulation](#regulation)
26. [announcement](#announcement)
27. [announcement_read_status](#announcement_read_status)
28. [notification_log](#notification_log)
29. [notification_subscription](#notification_subscription)
30. [feedback](#feedback)
31. [keuangan_transaksi](#keuangan_transaksi)
32. [iuran_tagihan](#iuran_tagihan)
33. [inventory](#inventory)
34. [inventory_purchase](#inventory_purchase)

---

## wilayah

Hierarki wilayah: Provinsi → Kabupaten → Kecamatan → Kelurahan → RW → RT (self-referencing via `parent_id`).

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_wilayah` | char(36) | No | uuid() | **PK** |
| `nama_wilayah` | varchar(100) | No | | |
| `tipe` | enum | No | | `PROVINSI, KABUPATEN, KECAMATAN, KELURAHAN, RW, RT` |
| `kode_wilayah` | varchar(20) | No | | |
| `parent_id` | char(36) | Yes | NULL | FK → `wilayah.id_wilayah`, ON DELETE CASCADE |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## master_data

Tabel referensi umum (agama, pendidikan, profesi, kategori bansos, kategori kos, jenis kejadian siskamling).

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_master` | char(36) | No | uuid() | **PK** |
| `tipe` | enum | No | | `AGAMA, PENDIDIKAN, PROFESI, KATEGORI_BANSOS, KATEGORI_KOS, JENIS_KEJADIAN_SISKAMLING` |
| `kode_master` | varchar(50) | No | | |
| `nama_master` | varchar(100) | No | | |
| `urutan` | smallint(6) | No | 0 | |
| `is_active` | tinyint(1) | No | 1 | |

---

## users

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_users` | char(36) | No | uuid() | **PK** (perhatikan: plural, bukan `id_user`) |
| `nama_users` | varchar(150) | No | | |
| `email` | varchar(150) | Yes | NULL | |
| `no_hp` | varchar(20) | No | | |
| `password_hash` | varchar(255) | Yes | NULL | |
| `telegram_chat_id` | varchar(50) | Yes | NULL | |
| `telegram_linked_at` | datetime | Yes | NULL | |
| `auth_provider` | enum | No | WHATSAPP_OTP | `EMAIL, GOOGLE, WHATSAPP_OTP` |
| `status` | enum | No | PENDING_VERIFICATION | `PENDING_VERIFICATION, ACTIVE, SUSPENDED, INACTIVE` |
| `id_citizen` | char(36) | Yes | NULL | ⚠️ Tidak ada FK constraint (lihat catatan di atas) |
| `last_login_at` | datetime | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## role

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_role` | char(36) | No | uuid() | **PK** |
| `kode` | varchar(50) | No | | ⚠️ Namanya `kode`, bukan `kode_role` |
| `nama_role` | varchar(100) | No | | |
| `level` | tinyint(4) | No | | |
| `is_strategic` | tinyint(1) | No | 0 | |
| `deskripsi` | varchar(255) | Yes | NULL | |

---

## module

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_module` | char(36) | No | uuid() | **PK** |
| `kode_module` | varchar(50) | No | | |
| `nama_module` | varchar(100) | No | | |
| `urutan` | tinyint(4) | No | 0 | |

---

## permission_action

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_permission_action` | tinyint(4) | No | auto_increment | **PK** |
| `kode_permission` | varchar(20) | No | | |
| `deskripsi` | varchar(150) | Yes | NULL | |

---

## user_role

Junction: user memegang role di wilayah tertentu, dengan periode jabatan.

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_user_role` | char(36) | No | uuid() | **PK** |
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `id_role` | char(36) | No | | FK → `role.id_role`, ON DELETE CASCADE |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE CASCADE |
| `periode_mulai` | date | Yes | NULL | |
| `periode_selesai` | date | Yes | NULL | |
| `status` | enum | No | ACTIVE | `ACTIVE, ENDED, REVOKED` |
| `assigned_by` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE SET NULL |
| `assigned_at` | datetime | No | current_timestamp() | |

---

## role_permission

Matriks RBAC: role × module × action × scope.

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_role_permission` | char(36) | No | uuid() | **PK** |
| `id_role` | char(36) | No | | FK → `role.id_role`, ON DELETE CASCADE |
| `id_module` | char(36) | No | | FK → `module.id_module`, ON DELETE CASCADE |
| `id_permission_action` | tinyint(4) | No | | FK → `permission_action.id_permission_action`, ON DELETE CASCADE |
| `resource_scope` | varchar(100) | No | `*` | |
| `scope_level` | enum | No | | `OWN, RT, RW, KELURAHAN, ALL` |

---

## permission_override

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_permission_override` | char(36) | No | uuid() | **PK** |
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `id_module` | char(36) | No | | FK → `module.id_module`, ON DELETE CASCADE |
| `id_permission_action` | tinyint(4) | No | | FK → `permission_action.id_permission_action`, ON DELETE CASCADE |
| `id_wilayah` | char(36) | Yes | NULL | FK → `wilayah.id_wilayah`, ON DELETE CASCADE |
| `is_granted` | tinyint(1) | No | | |
| `reason` | varchar(255) | Yes | NULL | |
| `created_by` | char(36) | Yes | NULL | ⚠️ Tidak ada FK constraint |
| `created_at` | datetime | No | current_timestamp() | |
| `expires_at` | datetime | Yes | NULL | |

---

## user_session

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_user_session` | char(36) | No | uuid() | **PK** |
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `refresh_token_hash` | varchar(255) | No | | |
| `device_info` | varchar(255) | Yes | NULL | |
| `ip_address` | varchar(45) | Yes | NULL | |
| `is_active` | tinyint(1) | No | 1 | |
| `created_at` | datetime | No | current_timestamp() | |
| `expires_at` | datetime | No | | |

---

## audit_log

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_action_log` | bigint(20) | No | auto_increment | **PK** |
| `id_users` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE SET NULL |
| `id_module` | char(36) | Yes | NULL | FK → `module.id_module`, ON DELETE SET NULL |
| `id_permission_action` | varchar(50) | No | | ⚠️ **Bukan FK** — teks bebas (contoh: `"CREATE"`, `"UPDATE"`) |
| `entity_type` | varchar(50) | Yes | NULL | Nama tabel/entitas terkait, contoh: `"citizen"`, `"letter_request"` |
| `entity_id` | char(36) | Yes | NULL | |
| `old_value` | longtext | Yes | NULL | |
| `new_value` | longtext | Yes | NULL | |
| `ip_address` | varchar(45) | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |

---

## family

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_family` | char(36) | No | uuid() | **PK** |
| `no_kk` | varchar(32) | No | | |
| `id_kepala_keluarga` | char(36) | Yes | NULL | FK → `citizen.id_citizen`, ON DELETE SET NULL |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `status` | enum | No | ACTIVE | `ACTIVE, PINDAH, DIHAPUS` |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## citizen

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_citizen` | char(36) | No | uuid() | **PK** |
| `nik` | varchar(32) | No | | Terenkripsi di application layer |
| `nama_lengkap` | varchar(150) | No | | |
| `id_family` | char(36) | Yes | NULL | FK → `family.id_family`, ON DELETE SET NULL |
| `hubungan_keluarga` | enum | Yes | NULL | `KEPALA_KELUARGA, ISTRI, ANAK, LAINNYA` |
| `tempat_lahir` | varchar(100) | Yes | NULL | |
| `tanggal_lahir` | date | Yes | NULL | |
| `jenis_kelamin` | enum | No | | `L, P` |
| `id_agama` | char(36) | Yes | NULL | FK → `master_data.id_master`, ON DELETE SET NULL |
| `status_nikah` | enum | Yes | NULL | `BELUM_KAWIN, KAWIN, CERAI_HIDUP, CERAI_MATI` |
| `id_pendidikan` | char(36) | Yes | NULL | FK → `master_data.id_master`, ON DELETE SET NULL |
| `id_profesi` | char(36) | Yes | NULL | FK → `master_data.id_master`, ON DELETE SET NULL |
| `no_hp` | varchar(20) | Yes | NULL | |
| `email` | varchar(150) | Yes | NULL | |
| `status_warga` | enum | No | TETAP | `TETAP, TIDAK_TETAP` |
| `kewarganegaraan` | enum | No | WNI | `WNI, WNA` |
| `status_ekonomi` | enum | Yes | NULL | `MAMPU, KURANG_MAMPU` — **data sensitif** |
| `penerima_bansos` | tinyint(1) | No | 0 | **data sensitif** |
| `tanggal_masuk_rt` | date | Yes | NULL | |
| `tanggal_keluar_rt` | date | Yes | NULL | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `alamat_kk_luar_rt` | tinyint(1) | No | 0 | |
| `berdomisili_luar_rt` | tinyint(1) | No | 0 | |
| `status_hidup` | enum | No | HIDUP | `HIDUP, MENINGGAL` |
| `status_aktif` | tinyint(1) | No | 1 | |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## citizen_history

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_citizen_history` | bigint(20) | No | auto_increment | **PK** |
| `id_citizen` | char(36) | No | | FK → `citizen.id_citizen`, ON DELETE CASCADE |
| `field_changed` | varchar(50) | No | | |
| `old_value` | varchar(255) | Yes | NULL | |
| `new_value` | varchar(255) | Yes | NULL | |
| `changed_by` | char(36) | Yes | NULL | ⚠️ Tidak ada FK constraint |
| `changed_at` | datetime | No | current_timestamp() | |

---

## house

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_house` | char(36) | No | uuid() | **PK** |
| `tipe` | enum | No | | `NON_KOS, KOS` |
| `alamat` | varchar(255) | No | | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `latitude` | decimal(10,7) | Yes | NULL | |
| `longitude` | decimal(10,7) | Yes | NULL | |
| `id_pemilik_citizen` | char(36) | Yes | NULL | FK → `citizen.id_citizen`, ON DELETE SET NULL |
| `status_kepemilikan` | enum | Yes | NULL | `MILIK_SENDIRI, KONTRAK` |
| `id_kategori_kos` | char(36) | Yes | NULL | FK → `master_data.id_master`, ON DELETE SET NULL |
| `jumlah_kamar` | smallint(6) | Yes | NULL | |
| `jumlah_penghuni` | smallint(6) | No | 0 | |
| `status_pajak` | enum | Yes | NULL | `LUNAS, BELUM_LUNAS` |
| `status_aktif` | tinyint(1) | No | 1 | |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## house_photo

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_house_photo` | char(36) | No | uuid() | **PK** |
| `id_house` | char(36) | No | | FK → `house.id_house`, ON DELETE CASCADE |
| `file_url` | varchar(500) | No | | |
| `uploaded_at` | datetime | No | current_timestamp() | |

---

## kos_room

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_kos_room` | char(36) | No | uuid() | **PK** |
| `id_house` | char(36) | No | | FK → `house.id_house`, ON DELETE CASCADE |
| `nomor_kamar` | varchar(20) | No | | |
| `status_okupansi` | enum | No | KOSONG | `KOSONG, TERISI` |
| `id_penghuni_citizen` | char(36) | Yes | NULL | FK → `citizen.id_citizen`, ON DELETE SET NULL |

---

## guest

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_guest` | char(36) | No | uuid() | **PK** |
| `nama` | varchar(150) | No | | |
| `nik` | varchar(32) | Yes | NULL | |
| `asal` | varchar(150) | Yes | NULL | |
| `id_house` | char(36) | No | | FK → `house.id_house`, ON DELETE RESTRICT |
| `foto_identitas_url` | varchar(500) | Yes | NULL | |
| `jam_masuk` | datetime | No | | |
| `jam_keluar` | datetime | Yes | NULL | |
| `lama_tinggal_hari` | smallint(6) | Yes | NULL | |
| `status` | enum | No | MENUNGGU | `MENUNGGU, DISETUJUI, DITOLAK, CHECK_OUT` |
| `approved_by` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE SET NULL |
| `approved_at` | datetime | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |

---

## letter_request

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_letter_request` | char(36) | No | uuid() | **PK** |
| `nomor_surat` | varchar(50) | Yes | NULL | |
| `jenis_surat` | enum | No | | `DOMISILI, USAHA` |
| `id_pemohon_citizen` | char(36) | No | | FK → `citizen.id_citizen`, ON DELETE RESTRICT |
| `keperluan` | varchar(255) | Yes | NULL | |
| `nama_usaha` | varchar(150) | Yes | NULL | |
| `jenis_usaha` | varchar(150) | Yes | NULL | |
| `alamat_usaha` | varchar(255) | Yes | NULL | |
| `lama_usaha_tahun` | decimal(4,1) | Yes | NULL | |
| `status` | enum | No | DIAJUKAN | `DIAJUKAN, DIVERIFIKASI, DISETUJUI, DITANDATANGANI, TERBIT, DITOLAK` |
| `verified_by` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE SET NULL |
| `verified_at` | datetime | Yes | NULL | |
| `approved_by` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE SET NULL |
| `approved_at` | datetime | Yes | NULL | |
| `document_url` | varchar(500) | Yes | NULL | |
| `tanggal_terbit` | date | Yes | NULL | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## digital_signature

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_digital_signature` | char(36) | No | uuid() | **PK** |
| `id_letter_request` | char(36) | No | | FK → `letter_request.id_letter_request`, ON DELETE CASCADE |
| `document_hash` | varchar(255) | No | | |
| `status` | enum | No | MENUNGGU | `MENUNGGU, DITANDATANGANI, GAGAL` |
| `id_privy_transaction` | varchar(100) | Yes | NULL | |
| `qr_code_url` | varchar(500) | Yes | NULL | |
| `signed_document_url` | varchar(500) | Yes | NULL | |
| `signed_at` | datetime | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |

---

## siskamling_schedule

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_siskamling_schedule` | char(36) | No | uuid() | **PK** |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `id_petugas_citizen` | char(36) | No | | FK → `citizen.id_citizen`, ON DELETE RESTRICT |
| `shift` | enum | No | | `PAGI, SORE, MALAM` |
| `tanggal_jadwal` | date | No | | |
| `created_at` | datetime | No | current_timestamp() | |

---

## siskamling_checkin

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_siskamling_checkin` | char(36) | No | uuid() | **PK** |
| `id_siskamling_schedule` | char(36) | No | | FK → `siskamling_schedule.id_siskamling_schedule`, ON DELETE CASCADE |
| `checkin_time` | datetime | No | | |
| `latitude` | decimal(10,7) | No | | |
| `longitude` | decimal(10,7) | No | | |
| `foto_url` | varchar(500) | Yes | NULL | |

---

## siskamling_incident

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_siskamling_incident` | char(36) | No | uuid() | **PK** |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `dilaporkan_oleh` | char(36) | No | | FK → `users.id_users`, ON DELETE RESTRICT |
| `id_jenis_kejadian` | char(36) | Yes | NULL | FK → `master_data.id_master`, ON DELETE SET NULL |
| `lokasi` | varchar(255) | Yes | NULL | |
| `deskripsi` | text | Yes | NULL | |
| `foto_url` | varchar(500) | Yes | NULL | |
| `is_panic` | tinyint(1) | No | 0 | |
| `status` | enum | No | BARU | `BARU, DITINDAKLANJUTI, SELESAI` |
| `created_at` | datetime | No | current_timestamp() | |

---

## organization_member

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_organization_member` | char(36) | No | uuid() | **PK** |
| `id_citizen` | char(36) | No | | FK → `citizen.id_citizen`, ON DELETE RESTRICT |
| `jabatan` | varchar(100) | No | | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `periode_mulai` | date | No | | |
| `periode_selesai` | date | Yes | NULL | |
| `foto_url` | varchar(500) | Yes | NULL | |
| `status_aktif` | tinyint(1) | No | 1 | |

---

## regulation

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_regulation` | char(36) | No | uuid() | **PK** |
| `kategori` | enum | No | | `WARGA_TETAP, PENGHUNI_TIDAK_TETAP, LINGKUNGAN, TAMU` |
| `judul` | varchar(200) | No | | |
| `isi` | text | No | | |
| `lampiran_url` | varchar(500) | Yes | NULL | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `versi` | smallint(6) | No | 1 | |
| `tanggal_berlaku` | date | No | | |
| `status` | enum | No | AKTIF | `AKTIF, NONAKTIF` |
| `created_by` | char(36) | No | | FK → `users.id_users`, ON DELETE RESTRICT |
| `created_at` | datetime | No | current_timestamp() | |

---

## announcement

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_announcement` | char(36) | No | uuid() | **PK** |
| `judul` | varchar(200) | No | | |
| `isi` | text | No | | |
| `kategori` | enum | No | | `KESEHATAN, KEAMANAN, INFRASTRUKTUR, SOSIAL, LAINNYA` |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `target` | enum | No | SEMUA_WARGA | `SEMUA_WARGA, PENGURUS_SAJA, WARGA_TERTENTU` |
| `lampiran_url` | varchar(500) | Yes | NULL | |
| `is_pinned` | tinyint(1) | No | 0 | |
| `status_approval` | enum | No | DRAFT | `DRAFT, RT, RW, DUKUH_DISETUJUI` |
| `created_by` | char(36) | No | | FK → `users.id_users`, ON DELETE RESTRICT |
| `created_at` | datetime | No | current_timestamp() | |

---

## announcement_read_status

Tabel pivot (composite PK: `id_announcement_read_status` + `id_users`).

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_announcement_read_status` | char(36) | No | | ⚠️ FK → `announcement.id_announcement`, ON DELETE CASCADE (bukan PK independen, lihat catatan di atas) |
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `read_at` | datetime | No | current_timestamp() | |

---

## notification_log

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_notification_log` | char(36) | No | uuid() | **PK** |
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `jenis` | varchar(50) | No | | |
| `channel` | enum | No | TELEGRAM | `TELEGRAM, WHATSAPP_OTP, EMAIL` |
| `isi_pesan` | text | No | | |
| `status_kirim` | enum | No | PENDING | `PENDING, TERKIRIM, GAGAL` |
| `retry_count` | tinyint(4) | No | 0 | |
| `related_entity_type` | varchar(50) | Yes | NULL | |
| `id_related_entity` | char(36) | Yes | NULL | |
| `sent_at` | datetime | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |

---

## notification_subscription

Tabel pivot (composite PK: `id_users` + `kategori`).

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_users` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `kategori` | varchar(50) | No | | |
| `is_subscribed` | tinyint(1) | No | 1 | |

---

## feedback

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_feedback` | char(36) | No | uuid() | **PK** |
| `id_pengirim_user` | char(36) | No | | FK → `users.id_users`, ON DELETE CASCADE |
| `isi_pesan` | text | No | | |
| `kategori` | enum | No | | `MASUKAN, KELUHAN, APRESIASI, LAINNYA` |
| `is_anonim` | tinyint(1) | No | 0 | |
| `status` | enum | No | BARU | `BARU, DIBACA, DITINDAKLANJUTI` |
| `created_at` | datetime | No | current_timestamp() | |

---

## keuangan_transaksi

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_keuangan_transaksi` | char(36) | No | uuid() | **PK** |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `tipe` | enum | No | | `PEMASUKAN, PENGELUARAN` |
| `kategori` | varchar(100) | Yes | NULL | |
| `jumlah` | decimal(15,2) | No | | |
| `deskripsi` | varchar(255) | Yes | NULL | |
| `bukti_url` | varchar(500) | Yes | NULL | |
| `tanggal` | date | No | | |
| `dicatat_oleh` | char(36) | No | | FK → `users.id_users`, ON DELETE RESTRICT |
| `created_at` | datetime | No | current_timestamp() | |

---

## iuran_tagihan

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_iuran_tagihan` | char(36) | No | uuid() | **PK** |
| `id_family` | char(36) | No | | FK → `family.id_family`, ON DELETE CASCADE |
| `periode` | char(7) | No | | Format `YYYY-MM` |
| `jumlah_tagihan` | decimal(12,2) | No | | |
| `status` | enum | No | BELUM_BAYAR | `LUNAS, BELUM_BAYAR, SEBAGIAN` |
| `jatuh_tempo` | date | No | | |
| `dikonfirmasi_oleh` | char(36) | Yes | NULL | ⚠️ Tidak ada FK constraint |
| `dikonfirmasi_at` | datetime | Yes | NULL | |

---

## inventory

Master data barang inventaris RT.

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_inventory` | char(36) | No | uuid() | **PK** |
| `nama_barang` | varchar(150) | No | | |
| `kategori` | varchar(100) | Yes | NULL | |
| `jumlah` | unsigned int | No | | |
| `satuan` | varchar(50) | Yes | NULL | |
| `kondisi` | enum | Yes | NULL | `BAIK, RUSAK, DIPERBAIKI` |
| `lokasi` | varchar(150) | Yes | NULL | |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `status_aktif` | tinyint(1) | No | 1 | |
| `created_by` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE RESTRICT |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## inventory_purchase

Pengajuan pembelian barang inventaris (workflow: Diajukan → Disetujui/Ditolak).

| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| `id_inventory_purchase` | char(36) | No | uuid() | **PK** |
| `nama_barang` | varchar(150) | No | | |
| `jumlah` | unsigned int | No | | |
| `satuan` | varchar(50) | Yes | NULL | |
| `perkiraan_biaya` | decimal(15,2) | Yes | NULL | |
| `alasan` | text | Yes | NULL | |
| `status` | enum | No | DIAJUKAN | `DIAJUKAN, DISETUJUI, DITOLAK` |
| `id_wilayah` | char(36) | No | | FK → `wilayah.id_wilayah`, ON DELETE RESTRICT |
| `diajukan_oleh` | char(36) | No | | FK → `users.id_users`, ON DELETE RESTRICT |
| `disetujui_oleh` | char(36) | Yes | NULL | FK → `users.id_users`, ON DELETE RESTRICT |
| `disetujui_at` | datetime | Yes | NULL | |
| `created_at` | datetime | No | current_timestamp() | |
| `updated_at` | datetime | No | current_timestamp() on update | |

---

## Ringkasan Foreign Key & ON DELETE Behavior

| Pola | Tabel yang menerapkan |
|---|---|
| `CASCADE` (hapus induk → hapus anak) | `wilayah.parent_id`, semua tabel pivot/anak langsung (`house_photo`, `kos_room`, `citizen_history`, `siskamling_checkin`, `digital_signature`, `user_role`, `user_session`, `permission_override`, `role_permission`, `notification_log`, `notification_subscription`, `feedback`, `iuran_tagihan`, `announcement_read_status`) |
| `SET NULL` (hapus induk → anak jadi NULL) | Relasi opsional: `citizen.id_family`, `citizen.id_agama/id_pendidikan/id_profesi`, `family.id_kepala_keluarga`, `house.id_pemilik_citizen`, `house.id_kategori_kos`, `kos_room.id_penghuni_citizen`, `guest.approved_by`, `letter_request.verified_by/approved_by`, `siskamling_incident.id_jenis_kejadian`, `audit_log.id_users/id_module` |
| `RESTRICT` (cegah hapus jika masih dipakai) | Relasi wajib/struktural: semua `id_wilayah` di tabel operasional, `citizen.id_wilayah`, `letter_request.id_pemohon_citizen`, `guest.id_house`, `organization_member.id_citizen`, `siskamling_schedule.id_petugas_citizen`, `siskamling_incident.dilaporkan_oleh`, `keuangan_transaksi.dicatat_oleh`, `regulation.created_by`, `announcement.created_by` |
