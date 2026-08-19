-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2026 at 06:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistem_tetangga`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `id_announcement` char(36) NOT NULL DEFAULT uuid(),
  `judul` varchar(200) NOT NULL,
  `isi` text NOT NULL,
  `kategori` enum('KESEHATAN','KEAMANAN','INFRASTRUKTUR','SOSIAL','LAINNYA') NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `target` enum('SEMUA_WARGA','PENGURUS_SAJA','WARGA_TERTENTU') NOT NULL DEFAULT 'SEMUA_WARGA',
  `lampiran_url` varchar(500) DEFAULT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `status_approval` enum('DRAFT','RT','RW','DUKUH_DISETUJUI') NOT NULL DEFAULT 'DRAFT',
  `created_by` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`id_announcement`, `judul`, `isi`, `kategori`, `id_wilayah`, `target`, `lampiran_url`, `is_pinned`, `status_approval`, `created_by`, `created_at`) VALUES
('ANN-001', 'Kerja Bakti Lingkungan', 'Warga dimohon mengikuti kegiatan kerja bakti pada hari Minggu pukul 07.00 WIB.', 'SOSIAL', 'KEL01', 'SEMUA_WARGA', NULL, 1, 'DUKUH_DISETUJUI', 'USR-001', '2026-08-17 00:03:15'),
('ANN-002', 'Jadwal Siskamling', 'Berikut jadwal ronda malam untuk RT 01 dan RT 02.', 'KEAMANAN', 'RW01', 'PENGURUS_SAJA', NULL, 0, 'RW', 'USR-003', '2026-08-17 00:03:15');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_read_status`
--

CREATE TABLE `announcement_read_status` (
  `id_announcement_read_status` char(36) NOT NULL,
  `id_users` char(36) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement_read_status`
--

INSERT INTO `announcement_read_status` (`id_announcement_read_status`, `id_users`, `read_at`) VALUES
('ARS-001', 'USR-002', '2026-08-17 00:03:23'),
('ARS-002', 'USR-003', '2026-08-17 00:03:23');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id_action_log` bigint(20) NOT NULL,
  `id_users` char(36) DEFAULT NULL,
  `id_module` char(36) DEFAULT NULL,
  `id_permission_action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id_action_log`, `id_users`, `id_module`, `id_permission_action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address`, `created_at`) VALUES
(1, 'USR-003', 'MOD-002', '3', 'citizen', 'CIT-006', '{\"no_hp\":\"081200000006\"}', '{\"no_hp\":\"081234567806\"}', '127.0.0.1', '2026-08-17 00:08:53');

-- --------------------------------------------------------

--
-- Table structure for table `citizen`
--

CREATE TABLE `citizen` (
  `id_citizen` char(36) NOT NULL DEFAULT uuid(),
  `nik` varchar(32) NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `id_family` char(36) DEFAULT NULL,
  `hubungan_keluarga` enum('KEPALA_KELUARGA','ISTRI','ANAK','LAINNYA') DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `id_agama` char(36) DEFAULT NULL,
  `status_nikah` enum('BELUM_KAWIN','KAWIN','CERAI_HIDUP','CERAI_MATI') DEFAULT NULL,
  `id_pendidikan` char(36) DEFAULT NULL,
  `id_profesi` char(36) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `status_warga` enum('TETAP','TIDAK_TETAP') NOT NULL DEFAULT 'TETAP',
  `kewarganegaraan` enum('WNI','WNA') NOT NULL DEFAULT 'WNI',
  `status_ekonomi` enum('MAMPU','KURANG_MAMPU') DEFAULT NULL,
  `penerima_bansos` tinyint(1) NOT NULL DEFAULT 0,
  `tanggal_masuk_rt` date DEFAULT NULL,
  `tanggal_keluar_rt` date DEFAULT NULL,
  `id_wilayah` char(36) NOT NULL,
  `alamat_kk_luar_rt` tinyint(1) NOT NULL DEFAULT 0,
  `berdomisili_luar_rt` tinyint(1) NOT NULL DEFAULT 0,
  `status_hidup` enum('HIDUP','MENINGGAL') NOT NULL DEFAULT 'HIDUP',
  `status_aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `citizen`
--

INSERT INTO `citizen` (`id_citizen`, `nik`, `nama_lengkap`, `id_family`, `hubungan_keluarga`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `id_agama`, `status_nikah`, `id_pendidikan`, `id_profesi`, `no_hp`, `email`, `status_warga`, `kewarganegaraan`, `status_ekonomi`, `penerima_bansos`, `tanggal_masuk_rt`, `tanggal_keluar_rt`, `id_wilayah`, `alamat_kk_luar_rt`, `berdomisili_luar_rt`, `status_hidup`, `status_aktif`, `created_at`, `updated_at`) VALUES
('CIT-001', '3471000000000001', 'Budi Santoso', 'FAM-001', 'KEPALA_KELUARGA', 'Yogyakarta', '1985-05-12', 'L', 'MST-AGAMA-001', 'KAWIN', 'MST-PEND-003', 'MST-PROF-003', '081234567801', 'budi@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-001', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-002', '3471000000000002', 'Siti Aminah', 'FAM-001', 'ISTRI', 'Yogyakarta', '1987-08-20', 'P', 'MST-AGAMA-001', 'KAWIN', 'MST-PEND-003', 'MST-PROF-004', '081234567802', 'siti@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-001', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-003', '3471000000000003', 'Andi Santoso', 'FAM-001', 'ANAK', 'Yogyakarta', '2010-03-10', 'L', 'MST-AGAMA-001', 'BELUM_KAWIN', 'MST-PEND-002', 'MST-PROF-001', '081234567803', NULL, 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-001', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-004', '3471000000000004', 'Rudi Hartono', 'FAM-002', 'KEPALA_KELUARGA', 'Sleman', '1980-02-14', 'L', 'MST-AGAMA-002', 'KAWIN', 'MST-PEND-004', 'MST-PROF-004', '081234567804', 'rudi@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-001', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-005', '3471000000000005', 'Maria Hartono', 'FAM-002', 'ISTRI', 'Sleman', '1982-11-01', 'P', 'MST-AGAMA-002', 'KAWIN', 'MST-PEND-004', 'MST-PROF-004', '081234567805', 'maria@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-001', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-006', '3471000000000006', 'Dedi Pratama', 'FAM-003', 'KEPALA_KELUARGA', 'Bantul', '1978-06-18', 'L', 'MST-AGAMA-003', 'KAWIN', 'MST-PEND-003', 'MST-PROF-003', '081234567806', 'dedi@example.com', 'TETAP', 'WNI', 'KURANG_MAMPU', 1, '2020-01-01', NULL, 'WIL-RT-002', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-007', '3471000000000007', 'Rina Pratama', 'FAM-003', 'ISTRI', 'Bantul', '1981-09-22', 'P', 'MST-AGAMA-003', 'KAWIN', 'MST-PEND-003', 'MST-PROF-004', '081234567807', 'rina@example.com', 'TETAP', 'WNI', 'KURANG_MAMPU', 1, '2020-01-01', NULL, 'WIL-RT-002', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-008', '3471000000000008', 'Agus Wijaya', 'FAM-004', 'KEPALA_KELUARGA', 'Yogyakarta', '1988-01-25', 'L', 'MST-AGAMA-001', 'KAWIN', 'MST-PEND-004', 'MST-PROF-002', '081234567808', 'agus@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-003', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00'),
('CIT-009', '3471000000000009', 'Nur Aisyah', 'FAM-005', 'KEPALA_KELUARGA', 'Yogyakarta', '1990-04-05', 'P', 'MST-AGAMA-001', 'BELUM_KAWIN', 'MST-PEND-004', 'MST-PROF-002', '081234567809', 'nur@example.com', 'TETAP', 'WNI', 'MAMPU', 0, '2020-01-01', NULL, 'WIL-RT-004', 0, 0, 'HIDUP', 1, '2026-08-17 00:02:00', '2026-08-17 00:02:00');

-- --------------------------------------------------------

--
-- Table structure for table `citizen_history`
--

CREATE TABLE `citizen_history` (
  `id_citizen_history` bigint(20) NOT NULL,
  `id_citizen` char(36) NOT NULL,
  `field_changed` varchar(50) NOT NULL,
  `old_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `changed_by` char(36) DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `citizen_history`
--

INSERT INTO `citizen_history` (`id_citizen_history`, `id_citizen`, `field_changed`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES
(1, 'CIT-001', 'status_ekonomi', 'KURANG_MAMPU', 'MAMPU', 'USR-002', '2026-08-17 00:05:29'),
(2, 'CIT-006', 'no_hp', '081200000006', '081234567806', 'USR-003', '2026-08-17 00:05:29');

-- --------------------------------------------------------

--
-- Table structure for table `complaint`
--

CREATE TABLE `complaint` (
  `id_complaint` char(36) NOT NULL,
  `nomor_tiket` varchar(32) NOT NULL,
  `id_pengirim_user` char(36) NOT NULL,
  `judul` varchar(100) NOT NULL,
  `kategori` enum('INFRASTRUKTUR','KEAMANAN','KEBERSIHAN','SOSIAL','LAINNYA') NOT NULL,
  `deskripsi` text NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `urgensi` enum('RENDAH','SEDANG','TINGGI','DARURAT') NOT NULL DEFAULT 'SEDANG',
  `status` enum('PENDING','DIPROSES','ESKALASI','SELESAI','DITOLAK') NOT NULL DEFAULT 'PENDING',
  `rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaint`
--

INSERT INTO `complaint` (`id_complaint`, `nomor_tiket`, `id_pengirim_user`, `judul`, `kategori`, `deskripsi`, `lokasi`, `urgensi`, `status`, `rating`, `created_at`, `updated_at`) VALUES
('CMP-001', '#ADU-2026-001', 'USR-001', 'Perbaikan Jalan Akses Utama RT 01', 'INFRASTRUKTUR', 'Perlu penambalan aspal jalan utama penghubung antar RW.', 'Jl. Merdeka No. 12', 'TINGGI', 'ESKALASI', NULL, '2026-08-11 12:08:48', '2026-08-15 12:08:48'),
('CMP-002', '#ADU-2026-002', 'USR-002', 'Penerangan Jalan Gang Mawar Padam', 'KEAMANAN', 'Lampu PJU padam di 3 titik gang utama.', 'Gang Mawar RT 02', 'SEDANG', 'DIPROSES', NULL, '2026-08-14 12:08:48', '2026-08-16 12:08:48'),
('CMP-003', '#ADU-2026-003', 'USR-003', 'Pengangkutan Sampah TPS Liar', 'KEBERSIHAN', 'Pembersihan tumpukan sampah di perbatasan RW 01 dan RW 02.', 'Jl. Kenanga Timur', 'SEDANG', 'SELESAI', 5, '2026-08-06 12:08:48', '2026-08-14 12:08:48');

-- --------------------------------------------------------

--
-- Table structure for table `digital_signature`
--

CREATE TABLE `digital_signature` (
  `id_digital_signature` char(36) NOT NULL DEFAULT uuid(),
  `id_letter_request` char(36) NOT NULL,
  `document_hash` varchar(255) NOT NULL,
  `status` enum('MENUNGGU','DITANDATANGANI','GAGAL') NOT NULL DEFAULT 'MENUNGGU',
  `id_privy_transaction` varchar(100) DEFAULT NULL,
  `qr_code_url` varchar(500) DEFAULT NULL,
  `signed_document_url` varchar(500) DEFAULT NULL,
  `signed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `digital_signature`
--

INSERT INTO `digital_signature` (`id_digital_signature`, `id_letter_request`, `document_hash`, `status`, `id_privy_transaction`, `qr_code_url`, `signed_document_url`, `signed_at`, `created_at`) VALUES
('DIG-001', 'LTR-001', 'hash-dummy-document-001', 'DITANDATANGANI', 'PRIVY-DUMMY-001', '/qr/surat-001.png', '/documents/signed/surat-001.pdf', '2026-08-17 00:03:52', '2026-08-17 00:03:52');

-- --------------------------------------------------------

--
-- Table structure for table `family`
--

CREATE TABLE `family` (
  `id_family` char(36) NOT NULL DEFAULT uuid(),
  `no_kk` varchar(32) NOT NULL,
  `id_kepala_keluarga` char(36) DEFAULT NULL,
  `id_wilayah` char(36) NOT NULL,
  `status` enum('ACTIVE','PINDAH','DIHAPUS') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `family`
--

INSERT INTO `family` (`id_family`, `no_kk`, `id_kepala_keluarga`, `id_wilayah`, `status`, `created_at`, `updated_at`) VALUES
('FAM-001', '3471000000000001', 'CIT-001', 'WIL-RT-001', 'ACTIVE', '2026-08-17 00:01:37', '2026-08-17 00:02:10'),
('FAM-002', '3471000000000002', 'CIT-004', 'WIL-RT-001', 'ACTIVE', '2026-08-17 00:01:37', '2026-08-17 00:02:10'),
('FAM-003', '3471000000000003', 'CIT-006', 'WIL-RT-002', 'ACTIVE', '2026-08-17 00:01:37', '2026-08-17 00:02:10'),
('FAM-004', '3471000000000004', 'CIT-008', 'WIL-RT-003', 'ACTIVE', '2026-08-17 00:01:37', '2026-08-17 00:02:10'),
('FAM-005', '3471000000000005', 'CIT-009', 'WIL-RT-004', 'ACTIVE', '2026-08-17 00:01:37', '2026-08-17 00:02:10');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id_feedback` char(36) NOT NULL DEFAULT uuid(),
  `id_pengirim_user` char(36) NOT NULL,
  `isi_pesan` text NOT NULL,
  `kategori` enum('MASUKAN','KELUHAN','APRESIASI','LAINNYA') NOT NULL,
  `is_anonim` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('BARU','DIBACA','DITINDAKLANJUTI') NOT NULL DEFAULT 'BARU',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id_feedback`, `id_pengirim_user`, `isi_pesan`, `kategori`, `is_anonim`, `status`, `created_at`) VALUES
('FDB-001', 'USR-002', 'Sistem sangat membantu dalam pengajuan surat.', 'APRESIASI', 0, 'DITINDAKLANJUTI', '2026-08-17 00:03:57'),
('FDB-002', 'USR-003', 'Mohon ditambahkan fitur pembayaran iuran secara online.', 'MASUKAN', 0, 'BARU', '2026-08-17 00:03:57');

-- --------------------------------------------------------

--
-- Table structure for table `guest`
--

CREATE TABLE `guest` (
  `id_guest` char(36) NOT NULL DEFAULT uuid(),
  `nama` varchar(150) NOT NULL,
  `nik` varchar(32) DEFAULT NULL,
  `asal` varchar(150) DEFAULT NULL,
  `id_house` char(36) NOT NULL,
  `foto_identitas_url` varchar(500) DEFAULT NULL,
  `jam_masuk` datetime NOT NULL,
  `jam_keluar` datetime DEFAULT NULL,
  `lama_tinggal_hari` smallint(6) DEFAULT NULL,
  `status` enum('MENUNGGU','DISETUJUI','DITOLAK','CHECK_OUT') NOT NULL DEFAULT 'MENUNGGU',
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guest`
--

INSERT INTO `guest` (`id_guest`, `nama`, `nik`, `asal`, `id_house`, `foto_identitas_url`, `jam_masuk`, `jam_keluar`, `lama_tinggal_hari`, `status`, `approved_by`, `approved_at`, `created_at`) VALUES
('GST-001', 'Fajar Nugroho', '3471000000000010', 'Sleman', 'HOU-001', NULL, '2026-08-15 19:30:00', '2026-08-15 22:00:00', 1, 'CHECK_OUT', 'USR-002', '2026-08-15 19:35:00', '2026-08-17 00:04:05'),
('GST-002', 'Andi Setiawan', '3471000000000011', 'Bantul', 'HOU-002', NULL, '2026-08-17 10:00:00', NULL, NULL, 'DISETUJUI', 'USR-002', '2026-08-17 00:04:05', '2026-08-17 00:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `house`
--

CREATE TABLE `house` (
  `id_house` char(36) NOT NULL DEFAULT uuid(),
  `tipe` enum('NON_KOS','KOS') NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `id_pemilik_citizen` char(36) DEFAULT NULL,
  `status_kepemilikan` enum('MILIK_SENDIRI','KONTRAK') DEFAULT NULL,
  `id_kategori_kos` char(36) DEFAULT NULL,
  `jumlah_kamar` smallint(6) DEFAULT NULL,
  `jumlah_penghuni` smallint(6) NOT NULL DEFAULT 0,
  `status_pajak` enum('LUNAS','BELUM_LUNAS') DEFAULT NULL,
  `status_aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `house`
--

INSERT INTO `house` (`id_house`, `tipe`, `alamat`, `id_wilayah`, `latitude`, `longitude`, `id_pemilik_citizen`, `status_kepemilikan`, `id_kategori_kos`, `jumlah_kamar`, `jumlah_penghuni`, `status_pajak`, `status_aktif`, `created_at`, `updated_at`) VALUES
('HOU-001', 'NON_KOS', 'Jl. Sukamaju No. 10', 'WIL-RT-001', -7.7956000, 110.3695000, 'CIT-001', 'MILIK_SENDIRI', NULL, NULL, 3, 'LUNAS', 1, '2026-08-17 00:02:47', '2026-08-17 00:02:47'),
('HOU-002', 'NON_KOS', 'Jl. Sukamaju No. 12', 'WIL-RT-001', -7.7957000, 110.3696000, 'CIT-004', 'MILIK_SENDIRI', NULL, NULL, 2, 'LUNAS', 1, '2026-08-17 00:02:47', '2026-08-17 00:02:47'),
('HOU-003', 'KOS', 'Jl. Sukamaju No. 20', 'WIL-RT-003', -7.7960000, 110.3700000, 'CIT-008', 'MILIK_SENDIRI', 'MST-KOS-001', 4, 2, 'BELUM_LUNAS', 1, '2026-08-17 00:02:47', '2026-08-17 00:02:47');

-- --------------------------------------------------------

--
-- Table structure for table `house_photo`
--

CREATE TABLE `house_photo` (
  `id_house_photo` char(36) NOT NULL DEFAULT uuid(),
  `id_house` char(36) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `house_photo`
--

INSERT INTO `house_photo` (`id_house_photo`, `id_house`, `file_url`, `uploaded_at`) VALUES
('HPH-001', 'HOU-001', '/uploads/houses/house-001.jpg', '2026-08-17 00:02:54'),
('HPH-002', 'HOU-002', '/uploads/houses/house-002.jpg', '2026-08-17 00:02:54'),
('HPH-003', 'HOU-003', '/uploads/houses/house-003.jpg', '2026-08-17 00:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `iuran_tagihan`
--

CREATE TABLE `iuran_tagihan` (
  `id_iuran_tagihan` char(36) NOT NULL DEFAULT uuid(),
  `id_family` char(36) NOT NULL,
  `periode` char(7) NOT NULL,
  `jumlah_tagihan` decimal(12,2) NOT NULL,
  `status` enum('LUNAS','BELUM_BAYAR','SEBAGIAN') NOT NULL DEFAULT 'BELUM_BAYAR',
  `jatuh_tempo` date NOT NULL,
  `dikonfirmasi_oleh` char(36) DEFAULT NULL,
  `dikonfirmasi_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `iuran_tagihan`
--

INSERT INTO `iuran_tagihan` (`id_iuran_tagihan`, `id_family`, `periode`, `jumlah_tagihan`, `status`, `jatuh_tempo`, `dikonfirmasi_oleh`, `dikonfirmasi_at`) VALUES
('IUR-001', 'FAM-001', '2026-08', 25000.00, 'LUNAS', '2026-08-10', 'USR-002', '2026-08-17 00:03:30'),
('IUR-002', 'FAM-002', '2026-08', 25000.00, 'BELUM_BAYAR', '2026-08-10', NULL, NULL),
('IUR-003', 'FAM-003', '2026-08', 25000.00, 'SEBAGIAN', '2026-08-10', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `keuangan_transaksi`
--

CREATE TABLE `keuangan_transaksi` (
  `id_keuangan_transaksi` char(36) NOT NULL DEFAULT uuid(),
  `id_wilayah` char(36) NOT NULL,
  `tipe` enum('PEMASUKAN','PENGELUARAN') NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `deskripsi` varchar(255) DEFAULT NULL,
  `bukti_url` varchar(500) DEFAULT NULL,
  `tanggal` date NOT NULL,
  `dicatat_oleh` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `keuangan_transaksi`
--

INSERT INTO `keuangan_transaksi` (`id_keuangan_transaksi`, `id_wilayah`, `tipe`, `kategori`, `jumlah`, `deskripsi`, `bukti_url`, `tanggal`, `dicatat_oleh`, `created_at`) VALUES
('KEU-001', 'WIL-RT-001', 'PEMASUKAN', 'Iuran Warga', 75000.00, 'Penerimaan iuran bulan Agustus', NULL, '2026-08-05', 'USR-002', '2026-08-17 00:03:36'),
('KEU-002', 'WIL-RW-001', 'PENGELUARAN', 'Kebersihan', 50000.00, 'Pembelian perlengkapan kebersihan', NULL, '2026-08-07', 'USR-003', '2026-08-17 00:03:36');

-- --------------------------------------------------------

--
-- Table structure for table `kos_room`
--

CREATE TABLE `kos_room` (
  `id_kos_room` char(36) NOT NULL DEFAULT uuid(),
  `id_house` char(36) NOT NULL,
  `nomor_kamar` varchar(20) NOT NULL,
  `status_okupansi` enum('KOSONG','TERISI') NOT NULL DEFAULT 'KOSONG',
  `id_penghuni_citizen` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kos_room`
--

INSERT INTO `kos_room` (`id_kos_room`, `id_house`, `nomor_kamar`, `status_okupansi`, `id_penghuni_citizen`) VALUES
('KRM-001', 'HOU-003', 'A01', 'TERISI', 'CIT-009'),
('KRM-002', 'HOU-003', 'A02', 'TERISI', NULL),
('KRM-003', 'HOU-003', 'A03', 'KOSONG', NULL),
('KRM-004', 'HOU-003', 'A04', 'KOSONG', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `letter_request`
--

CREATE TABLE `letter_request` (
  `id_letter_request` char(36) NOT NULL DEFAULT uuid(),
  `nomor_surat` varchar(50) DEFAULT NULL,
  `jenis_surat` enum('DOMISILI','USAHA') NOT NULL,
  `id_pemohon_citizen` char(36) NOT NULL,
  `keperluan` varchar(255) DEFAULT NULL,
  `nama_usaha` varchar(150) DEFAULT NULL,
  `jenis_usaha` varchar(150) DEFAULT NULL,
  `alamat_usaha` varchar(255) DEFAULT NULL,
  `lama_usaha_tahun` decimal(4,1) DEFAULT NULL,
  `status` enum('DIAJUKAN','DIVERIFIKASI','DISETUJUI','DITANDATANGANI','TERBIT','DITOLAK') NOT NULL DEFAULT 'DIAJUKAN',
  `verified_by` char(36) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `tanggal_terbit` date DEFAULT NULL,
  `id_wilayah` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `letter_request`
--

INSERT INTO `letter_request` (`id_letter_request`, `nomor_surat`, `jenis_surat`, `id_pemohon_citizen`, `keperluan`, `nama_usaha`, `jenis_usaha`, `alamat_usaha`, `lama_usaha_tahun`, `status`, `verified_by`, `verified_at`, `approved_by`, `approved_at`, `document_url`, `tanggal_terbit`, `id_wilayah`, `created_at`, `updated_at`) VALUES
('LTR-001', '470/001/SK/2026', 'DOMISILI', 'CIT-001', 'Keperluan administrasi', NULL, NULL, NULL, NULL, 'TERBIT', 'USR-002', '2026-08-17 00:03:43', 'USR-003', '2026-08-17 00:03:43', '/documents/surat-domisili-001.pdf', '2026-08-10', 'WIL-RT-001', '2026-08-17 00:03:43', '2026-08-17 00:03:43'),
('LTR-002', NULL, 'USAHA', 'CIT-004', 'Pengajuan administrasi usaha', 'Warung Rudi', 'Kuliner', 'Jl. Sukamaju No. 12', 5.0, 'DIAJUKAN', NULL, NULL, NULL, NULL, NULL, NULL, 'WIL-RT-001', '2026-08-17 00:03:43', '2026-08-17 00:03:43');

-- --------------------------------------------------------

--
-- Table structure for table `master_data`
--

CREATE TABLE `master_data` (
  `id_master` char(36) NOT NULL DEFAULT uuid(),
  `tipe` enum('AGAMA','PENDIDIKAN','PROFESI','KATEGORI_BANSOS','KATEGORI_KOS','JENIS_KEJADIAN_SISKAMLING') NOT NULL,
  `kode_master` varchar(50) NOT NULL,
  `nama_master` varchar(100) NOT NULL,
  `urutan` smallint(6) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_data`
--

INSERT INTO `master_data` (`id_master`, `tipe`, `kode_master`, `nama_master`, `urutan`, `is_active`) VALUES
('MST-AGAMA-001', 'AGAMA', 'ISLAM', 'Islam', 1, 1),
('MST-AGAMA-002', 'AGAMA', 'KATOLIK', 'Katolik', 2, 1),
('MST-AGAMA-003', 'AGAMA', 'KRISTEN', 'Kristen', 3, 1),
('MST-BANSOS-001', 'KATEGORI_BANSOS', 'PKH', 'Program Keluarga Harapan', 1, 1),
('MST-BANSOS-002', 'KATEGORI_BANSOS', 'BPNT', 'Bantuan Pangan Non Tunai', 2, 1),
('MST-KOS-001', 'KATEGORI_KOS', 'PUTRA', 'Kos Putra', 1, 1),
('MST-KOS-002', 'KATEGORI_KOS', 'PUTRI', 'Kos Putri', 2, 1),
('MST-PEND-001', 'PENDIDIKAN', 'SD', 'SD/Sederajat', 1, 1),
('MST-PEND-002', 'PENDIDIKAN', 'SMP', 'SMP/Sederajat', 2, 1),
('MST-PEND-003', 'PENDIDIKAN', 'SMA', 'SMA/Sederajat', 3, 1),
('MST-PEND-004', 'PENDIDIKAN', 'S1', 'Sarjana (S1)', 4, 1),
('MST-PROF-001', 'PROFESI', 'PELAJAR', 'Pelajar', 1, 1),
('MST-PROF-002', 'PROFESI', 'MAHASISWA', 'Mahasiswa', 2, 1),
('MST-PROF-003', 'PROFESI', 'WIRASWASTA', 'Wiraswasta', 3, 1),
('MST-PROF-004', 'PROFESI', 'KARYAWAN', 'Karyawan Swasta', 4, 1),
('MST-SISKAM-001', 'JENIS_KEJADIAN_SISKAMLING', 'PENCURIAN', 'Pencurian', 1, 1),
('MST-SISKAM-002', 'JENIS_KEJADIAN_SISKAMLING', 'KEBAKARAN', 'Kebakaran', 2, 1),
('MST-SISKAM-003', 'JENIS_KEJADIAN_SISKAMLING', 'KERIBUTAN', 'Keributan', 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `module`
--

CREATE TABLE `module` (
  `id_module` char(36) NOT NULL DEFAULT uuid(),
  `kode_module` varchar(50) NOT NULL,
  `nama_module` varchar(100) NOT NULL,
  `urutan` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `module`
--

INSERT INTO `module` (`id_module`, `kode_module`, `nama_module`, `urutan`) VALUES
('MOD-001', 'DASHBOARD', 'Dashboard', 1),
('MOD-002', 'WARGA', 'Data Warga', 2),
('MOD-003', 'KELUARGA', 'Data Keluarga', 3),
('MOD-004', 'SURAT', 'Pelayanan Surat', 4),
('MOD-005', 'KEUANGAN', 'Keuangan', 5),
('MOD-006', 'SISKAMLING', 'Siskamling', 6),
('MOD-007', 'PENGUMUMAN', 'Pengumuman', 7);

-- --------------------------------------------------------

--
-- Table structure for table `notification_log`
--

CREATE TABLE `notification_log` (
  `id_notification_log` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `jenis` varchar(50) NOT NULL,
  `channel` enum('TELEGRAM','WHATSAPP_OTP','EMAIL') NOT NULL DEFAULT 'TELEGRAM',
  `isi_pesan` text NOT NULL,
  `status_kirim` enum('PENDING','TERKIRIM','GAGAL') NOT NULL DEFAULT 'PENDING',
  `retry_count` tinyint(4) NOT NULL DEFAULT 0,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `id_related_entity` char(36) DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_log`
--

INSERT INTO `notification_log` (`id_notification_log`, `id_users`, `jenis`, `channel`, `isi_pesan`, `status_kirim`, `retry_count`, `related_entity_type`, `id_related_entity`, `sent_at`, `created_at`) VALUES
('NOT-001', 'USR-002', 'PENGUMUMAN', 'TELEGRAM', 'Pengumuman kerja bakti telah diterbitkan.', 'TERKIRIM', 0, 'announcement', 'ANN-001', '2026-08-17 00:04:49', '2026-08-17 00:04:49'),
('NOT-002', 'USR-003', 'SISKAMLING', 'TELEGRAM', 'Terdapat laporan insiden siskamling.', 'TERKIRIM', 0, 'siskamling_incident', 'SKI-001', '2026-08-17 00:04:49', '2026-08-17 00:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `notification_subscription`
--

CREATE TABLE `notification_subscription` (
  `id_users` char(36) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `is_subscribed` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_subscription`
--

INSERT INTO `notification_subscription` (`id_users`, `kategori`, `is_subscribed`) VALUES
('USR-001', 'PENGUMUMAN', 1),
('USR-001', 'SISKAMLING', 1),
('USR-002', 'IURAN', 1),
('USR-002', 'PENGUMUMAN', 1),
('USR-003', 'PENGUMUMAN', 1);

-- --------------------------------------------------------

--
-- Table structure for table `organization_member`
--

CREATE TABLE `organization_member` (
  `id_organization_member` char(36) NOT NULL DEFAULT uuid(),
  `id_citizen` char(36) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `status_aktif` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization_member`
--

INSERT INTO `organization_member` (`id_organization_member`, `id_citizen`, `jabatan`, `id_wilayah`, `periode_mulai`, `periode_selesai`, `foto_url`, `status_aktif`) VALUES
('ORG-001', 'CIT-001', 'Ketua RT', 'WIL-RT-001', '2026-01-01', NULL, NULL, 1),
('ORG-002', 'CIT-004', 'Ketua RW', 'WIL-RW-001', '2026-01-01', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `permission_action`
--

CREATE TABLE `permission_action` (
  `id_permission_action` tinyint(4) NOT NULL,
  `kode_permission` varchar(20) NOT NULL,
  `deskripsi` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission_action`
--

INSERT INTO `permission_action` (`id_permission_action`, `kode_permission`, `deskripsi`) VALUES
(1, 'VIEW', 'Melihat data'),
(2, 'CREATE', 'Menambahkan data'),
(3, 'UPDATE', 'Mengubah data'),
(4, 'DELETE', 'Menghapus data'),
(5, 'APPROVE', 'Menyetujui data'),
(6, 'VERIFY', 'Memverifikasi data');

-- --------------------------------------------------------

--
-- Table structure for table `permission_override`
--

CREATE TABLE `permission_override` (
  `id_permission_override` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `id_module` char(36) NOT NULL,
  `id_permission_action` tinyint(4) NOT NULL,
  `id_wilayah` char(36) DEFAULT NULL,
  `is_granted` tinyint(1) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission_override`
--

INSERT INTO `permission_override` (`id_permission_override`, `id_users`, `id_module`, `id_permission_action`, `id_wilayah`, `is_granted`, `reason`, `created_by`, `created_at`, `expires_at`) VALUES
('POV-001', 'USR-002', 'MOD-004', 5, 'WIL-RT-001', 1, 'Ketua RT dapat melakukan persetujuan surat tertentu.', 'USR-001', '2026-08-17 00:04:56', '2026-12-31 23:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `regulation`
--

CREATE TABLE `regulation` (
  `id_regulation` char(36) NOT NULL DEFAULT uuid(),
  `kategori` enum('WARGA_TETAP','PENGHUNI_TIDAK_TETAP','LINGKUNGAN','TAMU') NOT NULL,
  `judul` varchar(200) NOT NULL,
  `isi` text NOT NULL,
  `lampiran_url` varchar(500) DEFAULT NULL,
  `id_wilayah` char(36) NOT NULL,
  `versi` smallint(6) NOT NULL DEFAULT 1,
  `tanggal_berlaku` date NOT NULL,
  `status` enum('AKTIF','NONAKTIF') NOT NULL DEFAULT 'AKTIF',
  `created_by` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regulation`
--

INSERT INTO `regulation` (`id_regulation`, `kategori`, `judul`, `isi`, `lampiran_url`, `id_wilayah`, `versi`, `tanggal_berlaku`, `status`, `created_by`, `created_at`) VALUES
('REG-001', 'WARGA_TETAP', 'Ketentuan Kebersihan Lingkungan', 'Setiap warga wajib menjaga kebersihan lingkungan sekitar rumah.', NULL, 'WIL-KEL-001', 1, '2026-01-01', 'AKTIF', 'USR-001', '2026-08-17 00:04:12'),
('REG-002', 'TAMU', 'Ketentuan Tamu', 'Tamu wajib melakukan pencatatan kepada pengurus wilayah.', NULL, 'WIL-KEL-001', 1, '2026-01-01', 'AKTIF', 'USR-001', '2026-08-17 00:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id_role` char(36) NOT NULL DEFAULT uuid(),
  `kode` varchar(50) NOT NULL,
  `nama_role` varchar(100) NOT NULL,
  `level` tinyint(4) NOT NULL,
  `is_strategic` tinyint(1) NOT NULL DEFAULT 0,
  `deskripsi` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id_role`, `kode`, `nama_role`, `level`, `is_strategic`, `deskripsi`) VALUES
('ROLE-ADMIN', 'ADMIN', 'Administrator', 1, 1, 'Administrator sistem'),
('ROLE-DUKUH', 'DUKUH', 'Kepala Dukuh', 2, 1, 'Pengelola tingkat kelurahan/dukuh'),
('ROLE-RT', 'RT', 'Ketua RT', 4, 0, 'Pengurus tingkat RT'),
('ROLE-RW', 'RW', 'Ketua RW', 3, 0, 'Pengurus tingkat RW'),
('ROLE-WARGA', 'WARGA', 'Warga', 5, 0, 'Pengguna umum');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id_role_permission` char(36) NOT NULL DEFAULT uuid(),
  `id_role` char(36) NOT NULL,
  `id_module` char(36) NOT NULL,
  `id_permission_action` tinyint(4) NOT NULL,
  `resource_scope` varchar(100) NOT NULL DEFAULT '*',
  `scope_level` enum('OWN','RT','RW','KELURAHAN','ALL') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`id_role_permission`, `id_role`, `id_module`, `id_permission_action`, `resource_scope`, `scope_level`) VALUES
('RP-001', 'ROLE-ADMIN', 'MOD-001', 1, '*', 'ALL'),
('RP-002', 'ROLE-ADMIN', 'MOD-002', 1, '*', 'ALL'),
('RP-003', 'ROLE-ADMIN', 'MOD-002', 2, '*', 'ALL'),
('RP-004', 'ROLE-ADMIN', 'MOD-002', 3, '*', 'ALL'),
('RP-005', 'ROLE-ADMIN', 'MOD-002', 4, '*', 'ALL'),
('RP-006', 'ROLE-RT', 'MOD-002', 1, 'citizen', 'RT'),
('RP-007', 'ROLE-RT', 'MOD-002', 2, 'citizen', 'RT'),
('RP-008', 'ROLE-RW', 'MOD-002', 1, 'citizen', 'RW'),
('RP-009', 'ROLE-DUKUH', 'MOD-002', 1, 'citizen', 'KELURAHAN');

-- --------------------------------------------------------

--
-- Table structure for table `siskamling_checkin`
--

CREATE TABLE `siskamling_checkin` (
  `id_siskamling_checkin` char(36) NOT NULL DEFAULT uuid(),
  `id_siskamling_schedule` char(36) NOT NULL,
  `checkin_time` datetime NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `foto_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siskamling_checkin`
--

INSERT INTO `siskamling_checkin` (`id_siskamling_checkin`, `id_siskamling_schedule`, `checkin_time`, `latitude`, `longitude`, `foto_url`) VALUES
('SKC-001', 'SKJ-001', '2026-08-17 22:05:00', -7.7956000, 110.3695000, '/uploads/siskamling/checkin-001.jpg'),
('SKC-002', 'SKJ-002', '2026-08-18 22:02:00', -7.7958000, 110.3697000, '/uploads/siskamling/checkin-002.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `siskamling_incident`
--

CREATE TABLE `siskamling_incident` (
  `id_siskamling_incident` char(36) NOT NULL DEFAULT uuid(),
  `id_wilayah` char(36) NOT NULL,
  `dilaporkan_oleh` char(36) NOT NULL,
  `id_jenis_kejadian` char(36) DEFAULT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `is_panic` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('BARU','DITINDAKLANJUTI','SELESAI') NOT NULL DEFAULT 'BARU',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siskamling_incident`
--

INSERT INTO `siskamling_incident` (`id_siskamling_incident`, `id_wilayah`, `dilaporkan_oleh`, `id_jenis_kejadian`, `lokasi`, `deskripsi`, `foto_url`, `is_panic`, `status`, `created_at`) VALUES
('SKI-001', 'WIL-RT-001', 'USR-002', 'MST-SISKAM-001', 'Jl. Sukamaju No. 15', 'Terdapat laporan kehilangan sepeda motor.', NULL, 0, 'DITINDAKLANJUTI', '2026-08-17 00:04:36'),
('SKI-002', 'WIL-RT-002', 'USR-003', 'MST-SISKAM-003', 'Pos Kamling RW 01', 'Terdapat keributan kecil dan sudah diselesaikan oleh pengurus.', NULL, 0, 'SELESAI', '2026-08-17 00:04:36');

-- --------------------------------------------------------

--
-- Table structure for table `siskamling_schedule`
--

CREATE TABLE `siskamling_schedule` (
  `id_siskamling_schedule` char(36) NOT NULL DEFAULT uuid(),
  `id_wilayah` char(36) NOT NULL,
  `id_petugas_citizen` char(36) NOT NULL,
  `shift` enum('PAGI','SORE','MALAM') NOT NULL,
  `tanggal_jadwal` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siskamling_schedule`
--

INSERT INTO `siskamling_schedule` (`id_siskamling_schedule`, `id_wilayah`, `id_petugas_citizen`, `shift`, `tanggal_jadwal`, `created_at`) VALUES
('SKJ-001', 'WIL-RT-001', 'CIT-001', 'MALAM', '2026-08-17', '2026-08-17 00:04:21'),
('SKJ-002', 'WIL-RT-002', 'CIT-006', 'MALAM', '2026-08-18', '2026-08-17 00:04:21'),
('SKJ-003', 'WIL-RT-003', 'CIT-008', 'MALAM', '2026-08-19', '2026-08-17 00:04:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_users` char(36) NOT NULL DEFAULT uuid(),
  `nama_users` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `no_hp` varchar(20) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `telegram_chat_id` varchar(50) DEFAULT NULL,
  `telegram_linked_at` datetime DEFAULT NULL,
  `auth_provider` enum('EMAIL','GOOGLE','WHATSAPP_OTP') NOT NULL DEFAULT 'WHATSAPP_OTP',
  `status` enum('PENDING_VERIFICATION','ACTIVE','SUSPENDED','INACTIVE') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `id_citizen` char(36) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_users`, `nama_users`, `email`, `no_hp`, `password_hash`, `telegram_chat_id`, `telegram_linked_at`, `auth_provider`, `status`, `id_citizen`, `last_login_at`, `created_at`, `updated_at`) VALUES
('USR-001', 'Administrator', 'admin@sukamaju.test', '081200000001', '$2y$12$8EWBM.xkEec0spa/ObO4f.elW78Phdum/EcCHOBrsSF74i1O24gjC', NULL, NULL, 'EMAIL', 'ACTIVE', 'CIT-001', '2026-08-17 04:47:29', '2026-08-17 00:02:21', '2026-08-17 04:47:29'),
('USR-002', 'Budi Santoso', 'budi@example.com', '081234567801', '$2y$12$8EWBM.xkEec0spa/ObO4f.elW78Phdum/EcCHOBrsSF74i1O24gjC', '123456789', '2026-08-17 00:02:21', 'EMAIL', 'ACTIVE', 'CIT-001', '2026-08-16 19:11:00', '2026-08-17 00:02:21', '2026-08-16 19:11:00'),
('USR-003', 'Rudi Hartono', 'rudi@example.com', '081234567804', '$2y$12$8EWBM.xkEec0spa/ObO4f.elW78Phdum/EcCHOBrsSF74i1O24gjC', NULL, NULL, 'EMAIL', 'ACTIVE', 'CIT-004', '2026-08-16 18:59:55', '2026-08-17 00:02:21', '2026-08-16 18:59:55'),
('USR-004', 'Pak Dukuh Sukamaju', 'dukuh@sukamaju.test', '081200000004', '$2y$12$1tD7oLbiPi2gpgqpI.BkceaCH3MKP2as0QB7JLKJPXn/QDfxBYJT.', NULL, NULL, 'WHATSAPP_OTP', 'ACTIVE', 'CIT-001', '2026-08-16 19:11:14', '2026-08-16 18:57:13', '2026-08-16 19:11:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `id_user_role` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `id_role` char(36) NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `periode_mulai` date DEFAULT NULL,
  `periode_selesai` date DEFAULT NULL,
  `status` enum('ACTIVE','ENDED','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `assigned_by` char(36) DEFAULT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`id_user_role`, `id_users`, `id_role`, `id_wilayah`, `periode_mulai`, `periode_selesai`, `status`, `assigned_by`, `assigned_at`) VALUES
('UR-001', 'USR-001', 'ROLE-ADMIN', 'WIL-KEL-001', '2026-01-01', NULL, 'ACTIVE', NULL, '2026-08-17 00:02:29'),
('UR-002', 'USR-002', 'ROLE-RT', 'WIL-RT-001', '2026-01-01', NULL, 'ACTIVE', 'USR-001', '2026-08-17 00:02:29'),
('UR-003', 'USR-003', 'ROLE-RW', 'WIL-RW-001', '2026-01-01', NULL, 'ACTIVE', 'USR-001', '2026-08-17 00:02:29'),
('UR-004', 'USR-004', 'ROLE-DUKUH', 'KEL01', '2026-01-01', NULL, 'ACTIVE', NULL, '2026-08-16 18:57:27');

-- --------------------------------------------------------

--
-- Table structure for table `user_session`
--

CREATE TABLE `user_session` (
  `id_user_session` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `refresh_token_hash` varchar(255) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_session`
--

INSERT INTO `user_session` (`id_user_session`, `id_users`, `refresh_token_hash`, `device_info`, `ip_address`, `is_active`, `created_at`, `expires_at`) VALUES
('SES-001', 'USR-001', 'refresh-token-dummy-admin', 'Chrome Windows 11', '127.0.0.1', 1, '2026-08-17 00:05:37', '2026-12-31 23:59:59'),
('SES-002', 'USR-002', 'refresh-token-dummy-budi', 'Chrome Windows 11', '127.0.0.1', 1, '2026-08-17 00:05:37', '2026-12-31 23:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `wilayah`
--

CREATE TABLE `wilayah` (
  `id_wilayah` char(36) NOT NULL DEFAULT uuid(),
  `nama_wilayah` varchar(100) NOT NULL,
  `tipe` enum('PROVINSI','KABUPATEN','KECAMATAN','KELURAHAN','RW','RT') NOT NULL,
  `kode_wilayah` varchar(20) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wilayah`
--

INSERT INTO `wilayah` (`id_wilayah`, `nama_wilayah`, `tipe`, `kode_wilayah`, `parent_id`, `created_at`, `updated_at`) VALUES
('KEL01', 'Kelurahan Sukamaju', 'KELURAHAN', 'KEL01', NULL, '2026-08-16 23:56:44', '2026-08-16 23:56:44'),
('RT01', 'RT 01', 'RT', 'RT01', 'RW01', '2026-08-16 23:56:44', '2026-08-16 23:56:44'),
('RT02', 'RT 02', 'RT', 'RT02', 'RW01', '2026-08-16 23:56:44', '2026-08-16 23:56:44'),
('RT03', 'RT 03', 'RT', 'RT03', 'RW02', '2026-08-16 23:56:44', '2026-08-16 23:56:44'),
('RW01', 'RW 01', 'RW', 'RW01', 'KEL01', '2026-08-16 23:56:44', '2026-08-16 23:56:44'),
('RW02', 'RW 02', 'RW', 'RW02', 'KEL01', '2026-08-16 23:56:44', '2026-08-16 23:56:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`id_announcement`),
  ADD KEY `fk_announce_creator` (`created_by`),
  ADD KEY `idx_announce_wilayah` (`id_wilayah`);

--
-- Indexes for table `announcement_read_status`
--
ALTER TABLE `announcement_read_status`
  ADD PRIMARY KEY (`id_announcement_read_status`,`id_users`),
  ADD KEY `fk_ars_user` (`id_users`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id_action_log`),
  ADD KEY `fk_audit_module` (`id_module`),
  ADD KEY `idx_audit_user` (`id_users`),
  ADD KEY `idx_audit_created` (`created_at`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `citizen`
--
ALTER TABLE `citizen`
  ADD PRIMARY KEY (`id_citizen`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `fk_citizen_agama` (`id_agama`),
  ADD KEY `fk_citizen_pendidikan` (`id_pendidikan`),
  ADD KEY `fk_citizen_profesi` (`id_profesi`),
  ADD KEY `idx_citizen_wilayah` (`id_wilayah`),
  ADD KEY `idx_citizen_family` (`id_family`),
  ADD KEY `idx_citizen_status` (`status_warga`,`status_aktif`);

--
-- Indexes for table `citizen_history`
--
ALTER TABLE `citizen_history`
  ADD PRIMARY KEY (`id_citizen_history`),
  ADD KEY `idx_ch_citizen` (`id_citizen`);

--
-- Indexes for table `complaint`
--
ALTER TABLE `complaint`
  ADD PRIMARY KEY (`id_complaint`),
  ADD UNIQUE KEY `complaint_nomor_tiket_unique` (`nomor_tiket`);

--
-- Indexes for table `digital_signature`
--
ALTER TABLE `digital_signature`
  ADD PRIMARY KEY (`id_digital_signature`),
  ADD UNIQUE KEY `uq_sign_letter` (`id_letter_request`);

--
-- Indexes for table `family`
--
ALTER TABLE `family`
  ADD PRIMARY KEY (`id_family`),
  ADD UNIQUE KEY `no_kk` (`no_kk`),
  ADD KEY `idx_family_wilayah` (`id_wilayah`),
  ADD KEY `fk_family_kepala` (`id_kepala_keluarga`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id_feedback`),
  ADD KEY `fk_feedback_user` (`id_pengirim_user`),
  ADD KEY `idx_feedback_status` (`status`);

--
-- Indexes for table `guest`
--
ALTER TABLE `guest`
  ADD PRIMARY KEY (`id_guest`),
  ADD KEY `fk_guest_approver` (`approved_by`),
  ADD KEY `idx_guest_house` (`id_house`),
  ADD KEY `idx_guest_status` (`status`);

--
-- Indexes for table `house`
--
ALTER TABLE `house`
  ADD PRIMARY KEY (`id_house`),
  ADD KEY `fk_house_pemilik` (`id_pemilik_citizen`),
  ADD KEY `fk_house_kategori_kos` (`id_kategori_kos`),
  ADD KEY `idx_house_wilayah` (`id_wilayah`),
  ADD KEY `idx_house_tipe` (`tipe`);

--
-- Indexes for table `house_photo`
--
ALTER TABLE `house_photo`
  ADD PRIMARY KEY (`id_house_photo`),
  ADD KEY `fk_hp_house` (`id_house`);

--
-- Indexes for table `iuran_tagihan`
--
ALTER TABLE `iuran_tagihan`
  ADD PRIMARY KEY (`id_iuran_tagihan`),
  ADD UNIQUE KEY `uq_iuran_family_periode` (`id_family`,`periode`);

--
-- Indexes for table `keuangan_transaksi`
--
ALTER TABLE `keuangan_transaksi`
  ADD PRIMARY KEY (`id_keuangan_transaksi`),
  ADD KEY `fk_keuangan_user` (`dicatat_oleh`),
  ADD KEY `idx_keuangan_wilayah_tanggal` (`id_wilayah`,`tanggal`);

--
-- Indexes for table `kos_room`
--
ALTER TABLE `kos_room`
  ADD PRIMARY KEY (`id_kos_room`),
  ADD UNIQUE KEY `uq_room_house_nomor` (`id_house`,`nomor_kamar`),
  ADD KEY `fk_room_citizen` (`id_penghuni_citizen`);

--
-- Indexes for table `letter_request`
--
ALTER TABLE `letter_request`
  ADD PRIMARY KEY (`id_letter_request`),
  ADD UNIQUE KEY `nomor_surat` (`nomor_surat`),
  ADD KEY `fk_letter_verifier` (`verified_by`),
  ADD KEY `fk_letter_approver` (`approved_by`),
  ADD KEY `idx_letter_pemohon` (`id_pemohon_citizen`),
  ADD KEY `idx_letter_status` (`status`),
  ADD KEY `idx_letter_wilayah` (`id_wilayah`);

--
-- Indexes for table `master_data`
--
ALTER TABLE `master_data`
  ADD PRIMARY KEY (`id_master`),
  ADD UNIQUE KEY `uq_masterdata_tipe_kode` (`tipe`,`kode_master`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `module`
--
ALTER TABLE `module`
  ADD PRIMARY KEY (`id_module`),
  ADD UNIQUE KEY `kode_module` (`kode_module`);

--
-- Indexes for table `notification_log`
--
ALTER TABLE `notification_log`
  ADD PRIMARY KEY (`id_notification_log`),
  ADD KEY `idx_notif_user` (`id_users`),
  ADD KEY `idx_notif_status` (`status_kirim`);

--
-- Indexes for table `notification_subscription`
--
ALTER TABLE `notification_subscription`
  ADD PRIMARY KEY (`id_users`,`kategori`);

--
-- Indexes for table `organization_member`
--
ALTER TABLE `organization_member`
  ADD PRIMARY KEY (`id_organization_member`),
  ADD KEY `fk_orgmember_citizen` (`id_citizen`),
  ADD KEY `idx_orgmember_wilayah` (`id_wilayah`);

--
-- Indexes for table `permission_action`
--
ALTER TABLE `permission_action`
  ADD PRIMARY KEY (`id_permission_action`),
  ADD UNIQUE KEY `kode_permission` (`kode_permission`);

--
-- Indexes for table `permission_override`
--
ALTER TABLE `permission_override`
  ADD PRIMARY KEY (`id_permission_override`),
  ADD KEY `fk_po_module` (`id_module`),
  ADD KEY `fk_po_action` (`id_permission_action`),
  ADD KEY `fk_po_wilayah` (`id_wilayah`),
  ADD KEY `idx_po_user` (`id_users`);

--
-- Indexes for table `regulation`
--
ALTER TABLE `regulation`
  ADD PRIMARY KEY (`id_regulation`),
  ADD KEY `fk_regulation_creator` (`created_by`),
  ADD KEY `idx_regulation_wilayah` (`id_wilayah`),
  ADD KEY `idx_regulation_kategori` (`kategori`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id_role`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id_role_permission`),
  ADD UNIQUE KEY `uq_role_module_action_resource` (`id_role`,`id_module`,`id_permission_action`,`resource_scope`),
  ADD KEY `fk_rp_module` (`id_module`),
  ADD KEY `fk_rp_action` (`id_permission_action`),
  ADD KEY `idx_rp_role` (`id_role`);

--
-- Indexes for table `siskamling_checkin`
--
ALTER TABLE `siskamling_checkin`
  ADD PRIMARY KEY (`id_siskamling_checkin`),
  ADD KEY `fk_checkin_schedule` (`id_siskamling_schedule`);

--
-- Indexes for table `siskamling_incident`
--
ALTER TABLE `siskamling_incident`
  ADD PRIMARY KEY (`id_siskamling_incident`),
  ADD KEY `fk_incident_reporter` (`dilaporkan_oleh`),
  ADD KEY `fk_incident_jenis` (`id_jenis_kejadian`),
  ADD KEY `idx_incident_wilayah` (`id_wilayah`),
  ADD KEY `idx_incident_panic` (`is_panic`);

--
-- Indexes for table `siskamling_schedule`
--
ALTER TABLE `siskamling_schedule`
  ADD PRIMARY KEY (`id_siskamling_schedule`),
  ADD KEY `fk_shift_wilayah` (`id_wilayah`),
  ADD KEY `fk_shift_petugas` (`id_petugas_citizen`),
  ADD KEY `idx_shift_tanggal` (`tanggal_jadwal`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`),
  ADD UNIQUE KEY `no_hp` (`no_hp`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `telegram_chat_id` (`telegram_chat_id`),
  ADD KEY `idx_user_status` (`status`),
  ADD KEY `idx_user_citizen` (`id_citizen`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id_user_role`),
  ADD UNIQUE KEY `uq_user_role_wilayah_active` (`id_users`,`id_role`,`id_wilayah`,`status`),
  ADD KEY `fk_userrole_role` (`id_role`),
  ADD KEY `fk_userrole_assigner` (`assigned_by`),
  ADD KEY `idx_userrole_user` (`id_users`),
  ADD KEY `idx_userrole_wilayah` (`id_wilayah`);

--
-- Indexes for table `user_session`
--
ALTER TABLE `user_session`
  ADD PRIMARY KEY (`id_user_session`),
  ADD KEY `idx_session_user` (`id_users`);

--
-- Indexes for table `wilayah`
--
ALTER TABLE `wilayah`
  ADD PRIMARY KEY (`id_wilayah`),
  ADD UNIQUE KEY `uq_wilayah_kode_parent` (`kode_wilayah`,`parent_id`),
  ADD KEY `idx_wilayah_parent` (`parent_id`),
  ADD KEY `idx_wilayah_tipe` (`tipe`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id_action_log` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `citizen_history`
--
ALTER TABLE `citizen_history`
  MODIFY `id_citizen_history` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission_action`
--
ALTER TABLE `permission_action`
  MODIFY `id_permission_action` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
