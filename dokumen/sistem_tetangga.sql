
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_announcement`),
  KEY `fk_announce_creator` (`created_by`),
  KEY `idx_announce_wilayah` (`id_wilayah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
INSERT INTO `announcement` VALUES ('ANN-001','Kerja Bakti Lingkungan','Warga dimohon mengikuti kegiatan kerja bakti pada hari Minggu pukul 07.00 WIB.','SOSIAL','KEL01','SEMUA_WARGA',NULL,1,'DUKUH_DISETUJUI','USR-001','2026-08-17 00:03:15'),('ANN-002','Jadwal Siskamling','Berikut jadwal ronda malam untuk RT 01 dan RT 02.','KEAMANAN','RW01','PENGURUS_SAJA',NULL,0,'RW','USR-003','2026-08-17 00:03:15');
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `announcement_read_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcement_read_status` (
  `id_announcement_read_status` char(36) NOT NULL,
  `id_users` char(36) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_announcement_read_status`,`id_users`),
  KEY `fk_ars_user` (`id_users`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `announcement_read_status` WRITE;
/*!40000 ALTER TABLE `announcement_read_status` DISABLE KEYS */;
INSERT INTO `announcement_read_status` VALUES ('ANN-001','USR-002','2026-08-17 00:03:23'),('ANN-002','USR-003','2026-08-17 00:03:23');
/*!40000 ALTER TABLE `announcement_read_status` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_log` (
  `id_action_log` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_users` char(36) DEFAULT NULL,
  `id_module` char(36) DEFAULT NULL,
  `id_permission_action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_action_log`),
  KEY `fk_audit_module` (`id_module`),
  KEY `idx_audit_user` (`id_users`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,'USR-003','MOD-002','3','citizen','CIT-006','{\"no_hp\":\"081200000006\"}','{\"no_hp\":\"081234567806\"}','127.0.0.1','2026-08-17 00:08:53'),(2,'USR-005','MOD-010','CREATE','guest','GST-003',NULL,NULL,'127.0.0.1','2026-08-19 06:05:26'),(3,'USR-002','MOD-009','CREATE','house','HOU-004',NULL,NULL,'127.0.0.1','2026-08-19 06:05:43'),(4,'USR-002','MOD-012','CREATE','regulation','REG-003',NULL,NULL,'127.0.0.1','2026-08-19 06:05:44'),(5,'USR-005','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:43:50'),(6,'USR-006','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:46:02'),(7,'USR-006','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:47:38'),(8,'USR-006','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:48:49'),(9,'USR-006','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:50:36'),(10,'USR-006','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 04:55:39'),(11,'USR-002','MOD-010','UPDATE','guest','GST-006','{\"id_guest\":\"GST-006\",\"nama\":\"Bambang Tamu\",\"nik\":\"3471000000000088\",\"asal\":\"Klaten\",\"id_house\":\"HOU-001\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T09:00:00.000000Z\",\"jam_keluar\":\"2026-08-21T09:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"MENUNGGU\",\"approved_by\":null,\"approved_at\":null,\"created_at\":\"2026-08-20T04:55:39.000000Z\"}','{\"id_guest\":\"GST-006\",\"nama\":\"Bambang Tamu\",\"nik\":\"3471000000000088\",\"asal\":\"Klaten\",\"id_house\":\"HOU-001\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T09:00:00.000000Z\",\"jam_keluar\":\"2026-08-21T09:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"DISETUJUI\",\"approved_by\":\"USR-002\",\"approved_at\":\"2026-08-20T04:55:39.000000Z\",\"created_at\":\"2026-08-20T04:55:39.000000Z\"}','127.0.0.1','2026-08-20 04:55:39'),(12,'USR-005','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 05:16:50'),(13,'USR-007','MOD-010','CREATE','guest','GST-007',NULL,NULL,'127.0.0.1','2026-08-20 05:16:51'),(14,'USR-002','MOD-010','UPDATE','guest','GST-006','{\"id_guest\":\"GST-006\",\"nama\":\"Tamu Keluarga\",\"nik\":\"3471000000000077\",\"asal\":\"Sleman\",\"id_house\":\"HOU-001\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T09:00:00.000000Z\",\"jam_keluar\":\"2026-08-21T09:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"MENUNGGU\",\"approved_by\":null,\"approved_at\":null,\"created_at\":\"2026-08-20T05:16:50.000000Z\"}','{\"id_guest\":\"GST-006\",\"nama\":\"Tamu Keluarga\",\"nik\":\"3471000000000077\",\"asal\":\"Sleman\",\"id_house\":\"HOU-001\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T09:00:00.000000Z\",\"jam_keluar\":\"2026-08-21T09:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"DISETUJUI\",\"approved_by\":\"USR-002\",\"approved_at\":\"2026-08-20T05:16:51.000000Z\",\"created_at\":\"2026-08-20T05:16:50.000000Z\"}','127.0.0.1','2026-08-20 05:16:51'),(15,'USR-CLN','MOD-010','CREATE','guest','GST-006',NULL,NULL,'127.0.0.1','2026-08-20 05:32:15'),(16,'USR-002','MOD-010','UPDATE','guest','GST-006','{\"id_guest\":\"GST-006\",\"nama\":\"Devan\",\"nik\":\"2397645271892425\",\"asal\":\"Jayapura\",\"id_house\":\"HOU-004\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T15:00:00.000000Z\",\"jam_keluar\":\"2026-08-22T15:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"MENUNGGU\",\"approved_by\":null,\"approved_at\":null,\"created_at\":\"2026-08-20T05:32:15.000000Z\"}','{\"id_guest\":\"GST-006\",\"nama\":\"Devan\",\"nik\":\"2397645271892425\",\"asal\":\"Jayapura\",\"id_house\":\"HOU-004\",\"foto_identitas_url\":null,\"jam_masuk\":\"2026-08-20T15:00:00.000000Z\",\"jam_keluar\":\"2026-08-22T15:00:00.000000Z\",\"lama_tinggal_hari\":null,\"status\":\"DISETUJUI\",\"approved_by\":\"USR-002\",\"approved_at\":\"2026-08-20T05:34:18.000000Z\",\"created_at\":\"2026-08-20T05:32:15.000000Z\"}','127.0.0.1','2026-08-20 05:34:18'),(17,'USR-005','MOD-004','CREATE','letter_request','LTR-003',NULL,NULL,'127.0.0.1','2026-08-20 05:55:19'),(18,'USR-SEK','MOD-004','UPDATE','letter_request','LTR-003','{\"id_letter_request\":\"LTR-003\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi bank\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIAJUKAN\",\"verified_by\":null,\"verified_at\":null,\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T05:55:19.000000Z\",\"updated_at\":\"2026-08-20T05:55:19.000000Z\"}','{\"id_letter_request\":\"LTR-003\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi bank\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIVERIFIKASI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T05:55:19.000000Z\",\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T05:55:19.000000Z\",\"updated_at\":\"2026-08-20T05:55:19.000000Z\"}','127.0.0.1','2026-08-20 05:55:19'),(19,'USR-002','MOD-004','UPDATE','letter_request','LTR-003','{\"id_letter_request\":\"LTR-003\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi bank\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIVERIFIKASI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T05:55:19.000000Z\",\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T05:55:19.000000Z\",\"updated_at\":\"2026-08-20T05:55:19.000000Z\"}','{\"id_letter_request\":\"LTR-003\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi bank\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DISETUJUI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T05:55:19.000000Z\",\"approved_by\":\"USR-002\",\"approved_at\":\"2026-08-20T05:55:19.000000Z\",\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T05:55:19.000000Z\",\"updated_at\":\"2026-08-20T05:55:19.000000Z\"}','127.0.0.1','2026-08-20 05:55:19'),(20,'USR-008','MOD-004','CREATE','letter_request','LTR-003',NULL,NULL,'127.0.0.1','2026-08-20 05:59:34'),(21,'USR-005','MOD-004','CREATE','letter_request','LTR-004',NULL,NULL,'127.0.0.1','2026-08-20 06:13:56'),(22,'USR-SEK','MOD-004','UPDATE','letter_request','LTR-004','{\"id_letter_request\":\"LTR-004\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIAJUKAN\",\"verified_by\":null,\"verified_at\":null,\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T06:13:56.000000Z\",\"updated_at\":\"2026-08-20T06:13:56.000000Z\"}','{\"id_letter_request\":\"LTR-004\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIVERIFIKASI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T06:13:56.000000Z\",\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T06:13:56.000000Z\",\"updated_at\":\"2026-08-20T06:13:56.000000Z\"}','127.0.0.1','2026-08-20 06:13:56'),(23,'USR-002','MOD-004','UPDATE','letter_request','LTR-004','{\"id_letter_request\":\"LTR-004\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DIVERIFIKASI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T06:13:56.000000Z\",\"approved_by\":null,\"approved_at\":null,\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T06:13:56.000000Z\",\"updated_at\":\"2026-08-20T06:13:56.000000Z\"}','{\"id_letter_request\":\"LTR-004\",\"nomor_surat\":null,\"jenis_surat\":\"DOMISILI\",\"id_pemohon_citizen\":\"CIT-002\",\"keperluan\":\"Keperluan administrasi\",\"nama_usaha\":null,\"jenis_usaha\":null,\"alamat_usaha\":null,\"lama_usaha_tahun\":null,\"status\":\"DISETUJUI\",\"verified_by\":\"USR-SEK\",\"verified_at\":\"2026-08-20T06:13:56.000000Z\",\"approved_by\":\"USR-002\",\"approved_at\":\"2026-08-20T06:13:56.000000Z\",\"document_url\":null,\"tanggal_terbit\":null,\"id_wilayah\":\"RT01\",\"created_at\":\"2026-08-20T06:13:56.000000Z\",\"updated_at\":\"2026-08-20T06:13:56.000000Z\"}','127.0.0.1','2026-08-20 06:13:56');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `citizen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_citizen`),
  UNIQUE KEY `nik` (`nik`),
  KEY `fk_citizen_agama` (`id_agama`),
  KEY `fk_citizen_pendidikan` (`id_pendidikan`),
  KEY `fk_citizen_profesi` (`id_profesi`),
  KEY `idx_citizen_wilayah` (`id_wilayah`),
  KEY `idx_citizen_family` (`id_family`),
  KEY `idx_citizen_status` (`status_warga`,`status_aktif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `citizen` WRITE;
/*!40000 ALTER TABLE `citizen` DISABLE KEYS */;
INSERT INTO `citizen` VALUES ('CIT-001','3471000000000001','Budi Santoso','FAM-001','KEPALA_KELUARGA','Yogyakarta','1985-05-12','L','MST-AGAMA-001','KAWIN','MST-PEND-003','MST-PROF-003','081234567801','budi@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-002','3471000000000002','Siti Aminah','FAM-001','ISTRI','Yogyakarta','1987-08-20','P','MST-AGAMA-001','KAWIN','MST-PEND-003','MST-PROF-004','081234567802','siti@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-003','3471000000000003','Andi Santoso','FAM-001','ANAK','Yogyakarta','2010-03-10','L','MST-AGAMA-001','BELUM_KAWIN','MST-PEND-002','MST-PROF-001','081234567803',NULL,'TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-004','3471000000000004','Rudi Hartono','FAM-002','KEPALA_KELUARGA','Sleman','1980-02-14','L','MST-AGAMA-002','KAWIN','MST-PEND-004','MST-PROF-004','081234567804','rudi@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-005','3471000000000005','Maria Hartono','FAM-002','ISTRI','Sleman','1982-11-01','P','MST-AGAMA-002','KAWIN','MST-PEND-004','MST-PROF-004','081234567805','maria@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-006','3471000000000006','Dedi Pratama','FAM-003','KEPALA_KELUARGA','Bantul','1978-06-18','L','MST-AGAMA-003','KAWIN','MST-PEND-003','MST-PROF-003','081234567806','dedi@example.com','TETAP','WNI','KURANG_MAMPU',1,'2020-01-01',NULL,'RT02',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-007','3471000000000007','Rina Pratama','FAM-003','ISTRI','Bantul','1981-09-22','P','MST-AGAMA-003','KAWIN','MST-PEND-003','MST-PROF-004','081234567807','rina@example.com','TETAP','WNI','KURANG_MAMPU',1,'2020-01-01',NULL,'RT02',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-008','3471000000000008','Agus Wijaya','FAM-004','KEPALA_KELUARGA','Yogyakarta','1988-01-25','L','MST-AGAMA-001','KAWIN','MST-PEND-004','MST-PROF-002','081234567808','agus@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT03',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-009','3471000000000009','Nur Aisyah','FAM-005','KEPALA_KELUARGA','Yogyakarta','1990-04-05','P','MST-AGAMA-001','BELUM_KAWIN','MST-PEND-004','MST-PROF-002','081234567809','nur@example.com','TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT04',0,0,'HIDUP',1,'2026-08-17 00:02:00','2026-08-19 12:23:46'),('CIT-010','3471000000000021','Eko Purnomo','FAM-006','KEPALA_KELUARGA','Sleman','1990-05-12','L',NULL,'KAWIN',NULL,NULL,NULL,NULL,'TETAP','WNI','MAMPU',0,'2020-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-20 05:28:25','2026-08-20 05:28:25'),('CIT-011','3471000000000022','Sari Wulandari',NULL,NULL,'Sleman','1992-11-03','P',NULL,'KAWIN',NULL,NULL,NULL,NULL,'TETAP','WNI','MAMPU',0,'2018-01-01',NULL,'RT01',0,0,'HIDUP',1,'2026-08-20 06:12:26','2026-08-20 06:12:26');
/*!40000 ALTER TABLE `citizen` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `citizen_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citizen_history` (
  `id_citizen_history` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_citizen` char(36) NOT NULL,
  `field_changed` varchar(50) NOT NULL,
  `old_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `changed_by` char(36) DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_citizen_history`),
  KEY `idx_ch_citizen` (`id_citizen`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `citizen_history` WRITE;
/*!40000 ALTER TABLE `citizen_history` DISABLE KEYS */;
INSERT INTO `citizen_history` VALUES (1,'CIT-001','status_ekonomi','KURANG_MAMPU','MAMPU','USR-002','2026-08-17 00:05:29'),(2,'CIT-006','no_hp','081200000006','081234567806','USR-003','2026-08-17 00:05:29');
/*!40000 ALTER TABLE `citizen_history` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `complaint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `rating` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_complaint`),
  UNIQUE KEY `complaint_nomor_tiket_unique` (`nomor_tiket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
INSERT INTO `complaint` VALUES ('CMP-001','#ADU-2026-001','USR-001','Perbaikan Jalan Akses Utama RT 01','INFRASTRUKTUR','Perlu penambalan aspal jalan utama penghubung antar RW.','Jl. Merdeka No. 12','TINGGI','ESKALASI',NULL,'2026-08-11 12:08:48','2026-08-15 12:08:48'),('CMP-002','#ADU-2026-002','USR-002','Penerangan Jalan Gang Mawar Padam','KEAMANAN','Lampu PJU padam di 3 titik gang utama.','Gang Mawar RT 02','SEDANG','DIPROSES',NULL,'2026-08-14 12:08:48','2026-08-16 12:08:48'),('CMP-003','#ADU-2026-003','USR-003','Pengangkutan Sampah TPS Liar','KEBERSIHAN','Pembersihan tumpukan sampah di perbatasan RW 01 dan RW 02.','Jl. Kenanga Timur','SEDANG','SELESAI',5,'2026-08-06 12:08:48','2026-08-14 12:08:48');
/*!40000 ALTER TABLE `complaint` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `digital_signature`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `digital_signature` (
  `id_digital_signature` char(36) NOT NULL DEFAULT uuid(),
  `id_letter_request` char(36) NOT NULL,
  `document_hash` varchar(255) NOT NULL,
  `status` enum('MENUNGGU','DITANDATANGANI','GAGAL') NOT NULL DEFAULT 'MENUNGGU',
  `id_privy_transaction` varchar(100) DEFAULT NULL,
  `qr_code_url` varchar(500) DEFAULT NULL,
  `signed_document_url` varchar(500) DEFAULT NULL,
  `signed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_digital_signature`),
  UNIQUE KEY `uq_sign_letter` (`id_letter_request`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `digital_signature` WRITE;
/*!40000 ALTER TABLE `digital_signature` DISABLE KEYS */;
INSERT INTO `digital_signature` VALUES ('DIG-001','LTR-001','hash-dummy-document-001','DITANDATANGANI','PRIVY-DUMMY-001','/qr/surat-001.png','/documents/signed/surat-001.pdf','2026-08-17 00:03:52','2026-08-17 00:03:52');
/*!40000 ALTER TABLE `digital_signature` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `family` (
  `id_family` char(36) NOT NULL DEFAULT uuid(),
  `no_kk` varchar(32) NOT NULL,
  `id_kepala_keluarga` char(36) DEFAULT NULL,
  `id_wilayah` char(36) NOT NULL,
  `status` enum('ACTIVE','PINDAH','DIHAPUS') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_family`),
  UNIQUE KEY `no_kk` (`no_kk`),
  KEY `idx_family_wilayah` (`id_wilayah`),
  KEY `fk_family_kepala` (`id_kepala_keluarga`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `family` WRITE;
/*!40000 ALTER TABLE `family` DISABLE KEYS */;
INSERT INTO `family` VALUES ('FAM-001','3471000000000001','CIT-001','RT01','ACTIVE','2026-08-17 00:01:37','2026-08-19 12:23:46'),('FAM-002','3471000000000002','CIT-004','RT01','ACTIVE','2026-08-17 00:01:37','2026-08-19 12:23:46'),('FAM-003','3471000000000003','CIT-006','RT02','ACTIVE','2026-08-17 00:01:37','2026-08-19 12:23:46'),('FAM-004','3471000000000004','CIT-008','RT03','ACTIVE','2026-08-17 00:01:37','2026-08-19 12:23:46'),('FAM-005','3471000000000005','CIT-009','RT04','ACTIVE','2026-08-17 00:01:37','2026-08-19 12:23:46'),('FAM-006','3471000000000020','CIT-010','RT01','ACTIVE','2026-08-20 05:28:25','2026-08-20 05:28:25');
/*!40000 ALTER TABLE `family` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedback` (
  `id_feedback` char(36) NOT NULL DEFAULT uuid(),
  `id_pengirim_user` char(36) NOT NULL,
  `isi_pesan` text NOT NULL,
  `kategori` enum('MASUKAN','KELUHAN','APRESIASI','LAINNYA') NOT NULL,
  `is_anonim` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('BARU','DIBACA','DITINDAKLANJUTI') NOT NULL DEFAULT 'BARU',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_feedback`),
  KEY `fk_feedback_user` (`id_pengirim_user`),
  KEY `idx_feedback_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES ('FDB-001','USR-002','Sistem sangat membantu dalam pengajuan surat.','APRESIASI',0,'DITINDAKLANJUTI','2026-08-17 00:03:57'),('FDB-002','USR-003','Mohon ditambahkan fitur pembayaran iuran secara online.','MASUKAN',0,'BARU','2026-08-17 00:03:57');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `guest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_guest`),
  KEY `fk_guest_approver` (`approved_by`),
  KEY `idx_guest_house` (`id_house`),
  KEY `idx_guest_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `guest` WRITE;
/*!40000 ALTER TABLE `guest` DISABLE KEYS */;
INSERT INTO `guest` VALUES ('GST-001','Fajar Nugroho','3471000000000010','Sleman','HOU-001',NULL,'2026-08-15 19:30:00','2026-08-15 22:00:00',1,'CHECK_OUT','USR-002','2026-08-15 19:35:00','2026-08-17 00:04:05'),('GST-002','Andi Setiawan','3471000000000011','Bantul','HOU-002',NULL,'2026-08-17 10:00:00',NULL,NULL,'DISETUJUI','USR-002','2026-08-17 00:04:05','2026-08-17 00:04:05'),('GST-003','Bambang Pamungkas','3201011805900001','Bandung','HOU-001',NULL,'2026-08-18 14:00:00','2026-08-20 09:00:00',2,'DISETUJUI',NULL,NULL,'2026-08-19 13:22:48'),('GST-004','Cinta Laura','3173026507960002','Jakarta','HOU-002',NULL,'2026-08-19 09:30:00',NULL,NULL,'MENUNGGU',NULL,NULL,'2026-08-19 13:22:48'),('GST-005','Dimas Anggara','3301022006980003','Semarang','HOU-003',NULL,'2026-08-17 20:00:00','2026-08-18 08:00:00',1,'CHECK_OUT',NULL,NULL,'2026-08-19 13:22:48'),('GST-006','Devan','2397645271892425','Jayapura','HOU-004',NULL,'2026-08-20 15:00:00','2026-08-22 15:00:00',NULL,'DISETUJUI','USR-002','2026-08-20 05:34:18','2026-08-20 05:32:15');
/*!40000 ALTER TABLE `guest` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `house`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_house`),
  KEY `fk_house_pemilik` (`id_pemilik_citizen`),
  KEY `fk_house_kategori_kos` (`id_kategori_kos`),
  KEY `idx_house_wilayah` (`id_wilayah`),
  KEY `idx_house_tipe` (`tipe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `house` WRITE;
/*!40000 ALTER TABLE `house` DISABLE KEYS */;
INSERT INTO `house` VALUES ('HOU-001','NON_KOS','Jl. Sukamaju No. 10','RT01',-7.7956000,110.3695000,'CIT-001','MILIK_SENDIRI',NULL,NULL,3,'LUNAS',1,'2026-08-17 00:02:47','2026-08-19 12:23:46'),('HOU-002','NON_KOS','Jl. Sukamaju No. 12','RT01',-7.7957000,110.3696000,'CIT-004','MILIK_SENDIRI',NULL,NULL,2,'LUNAS',1,'2026-08-17 00:02:47','2026-08-19 12:23:46'),('HOU-003','KOS','Jl. Sukamaju No. 20','RT03',-7.7960000,110.3700000,'CIT-008','MILIK_SENDIRI','MST-KOS-001',4,2,'BELUM_LUNAS',1,'2026-08-17 00:02:47','2026-08-19 12:23:46'),('HOU-004','NON_KOS','Jl. Melati No. 88','RT01',NULL,NULL,'CIT-010','MILIK_SENDIRI',NULL,NULL,0,'LUNAS',1,'2026-08-20 05:28:25','2026-08-20 05:28:25');
/*!40000 ALTER TABLE `house` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `house_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `house_photo` (
  `id_house_photo` char(36) NOT NULL DEFAULT uuid(),
  `id_house` char(36) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_house_photo`),
  KEY `fk_hp_house` (`id_house`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `house_photo` WRITE;
/*!40000 ALTER TABLE `house_photo` DISABLE KEYS */;
INSERT INTO `house_photo` VALUES ('HPH-001','HOU-001','/uploads/houses/house-001.jpg','2026-08-17 00:02:54'),('HPH-002','HOU-002','/uploads/houses/house-002.jpg','2026-08-17 00:02:54'),('HPH-003','HOU-003','/uploads/houses/house-003.jpg','2026-08-17 00:02:54');
/*!40000 ALTER TABLE `house_photo` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `iuran_tagihan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iuran_tagihan` (
  `id_iuran_tagihan` char(36) NOT NULL DEFAULT uuid(),
  `id_family` char(36) NOT NULL,
  `periode` char(7) NOT NULL,
  `jumlah_tagihan` decimal(12,2) NOT NULL,
  `status` enum('LUNAS','BELUM_BAYAR','SEBAGIAN') NOT NULL DEFAULT 'BELUM_BAYAR',
  `jatuh_tempo` date NOT NULL,
  `dikonfirmasi_oleh` char(36) DEFAULT NULL,
  `dikonfirmasi_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_iuran_tagihan`),
  UNIQUE KEY `uq_iuran_family_periode` (`id_family`,`periode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `iuran_tagihan` WRITE;
/*!40000 ALTER TABLE `iuran_tagihan` DISABLE KEYS */;
INSERT INTO `iuran_tagihan` VALUES ('IUR-001','FAM-001','2026-08',25000.00,'LUNAS','2026-08-10','USR-002','2026-08-17 00:03:30'),('IUR-002','FAM-002','2026-08',25000.00,'BELUM_BAYAR','2026-08-10',NULL,NULL),('IUR-003','FAM-003','2026-08',25000.00,'SEBAGIAN','2026-08-10',NULL,NULL);
/*!40000 ALTER TABLE `iuran_tagihan` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `keuangan_transaksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_keuangan_transaksi`),
  KEY `fk_keuangan_user` (`dicatat_oleh`),
  KEY `idx_keuangan_wilayah_tanggal` (`id_wilayah`,`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `keuangan_transaksi` WRITE;
/*!40000 ALTER TABLE `keuangan_transaksi` DISABLE KEYS */;
INSERT INTO `keuangan_transaksi` VALUES ('KEU-001','RT01','PEMASUKAN','Iuran Warga',75000.00,'Penerimaan iuran bulan Agustus',NULL,'2026-08-05','USR-002','2026-08-17 00:03:36'),('KEU-002','RW01','PENGELUARAN','Kebersihan',50000.00,'Pembelian perlengkapan kebersihan',NULL,'2026-08-07','USR-003','2026-08-17 00:03:36');
/*!40000 ALTER TABLE `keuangan_transaksi` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `kos_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kos_room` (
  `id_kos_room` char(36) NOT NULL DEFAULT uuid(),
  `id_house` char(36) NOT NULL,
  `nomor_kamar` varchar(20) NOT NULL,
  `status_okupansi` enum('KOSONG','TERISI') NOT NULL DEFAULT 'KOSONG',
  `id_penghuni_citizen` char(36) DEFAULT NULL,
  PRIMARY KEY (`id_kos_room`),
  UNIQUE KEY `uq_room_house_nomor` (`id_house`,`nomor_kamar`),
  KEY `fk_room_citizen` (`id_penghuni_citizen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `kos_room` WRITE;
/*!40000 ALTER TABLE `kos_room` DISABLE KEYS */;
INSERT INTO `kos_room` VALUES ('KRM-001','HOU-003','A01','TERISI','CIT-009'),('KRM-002','HOU-003','A02','TERISI',NULL),('KRM-003','HOU-003','A03','KOSONG',NULL),('KRM-004','HOU-003','A04','KOSONG',NULL);
/*!40000 ALTER TABLE `kos_room` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `letter_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_letter_request`),
  UNIQUE KEY `nomor_surat` (`nomor_surat`),
  KEY `fk_letter_verifier` (`verified_by`),
  KEY `fk_letter_approver` (`approved_by`),
  KEY `idx_letter_pemohon` (`id_pemohon_citizen`),
  KEY `idx_letter_status` (`status`),
  KEY `idx_letter_wilayah` (`id_wilayah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `letter_request` WRITE;
/*!40000 ALTER TABLE `letter_request` DISABLE KEYS */;
INSERT INTO `letter_request` VALUES ('LTR-001','470/001/SK/2026','DOMISILI','CIT-001','Keperluan administrasi',NULL,NULL,NULL,NULL,'TERBIT','USR-002','2026-08-17 00:03:43','USR-003','2026-08-17 00:03:43','/documents/surat-domisili-001.pdf','2026-08-10','RT01','2026-08-17 00:03:43','2026-08-19 12:23:46'),('LTR-002',NULL,'USAHA','CIT-004','Pengajuan administrasi usaha','Warung Rudi','Kuliner','Jl. Sukamaju No. 12',5.0,'DIAJUKAN',NULL,NULL,NULL,NULL,NULL,NULL,'RT01','2026-08-17 00:03:43','2026-08-19 12:23:46'),('LTR-003',NULL,'DOMISILI','CIT-006','Keperluan Administrasi',NULL,NULL,NULL,NULL,'DIAJUKAN',NULL,NULL,NULL,NULL,NULL,NULL,'RT02','2026-08-20 05:59:34','2026-08-20 05:59:34');
/*!40000 ALTER TABLE `letter_request` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `master_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `master_data` (
  `id_master` char(36) NOT NULL DEFAULT uuid(),
  `tipe` enum('AGAMA','PENDIDIKAN','PROFESI','KATEGORI_BANSOS','KATEGORI_KOS','JENIS_KEJADIAN_SISKAMLING') NOT NULL,
  `kode_master` varchar(50) NOT NULL,
  `nama_master` varchar(100) NOT NULL,
  `urutan` smallint(6) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_master`),
  UNIQUE KEY `uq_masterdata_tipe_kode` (`tipe`,`kode_master`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `master_data` WRITE;
/*!40000 ALTER TABLE `master_data` DISABLE KEYS */;
INSERT INTO `master_data` VALUES ('MST-AGAMA-001','AGAMA','ISLAM','Islam',1,1),('MST-AGAMA-002','AGAMA','KATOLIK','Katolik',2,1),('MST-AGAMA-003','AGAMA','KRISTEN','Kristen',3,1),('MST-BANSOS-001','KATEGORI_BANSOS','PKH','Program Keluarga Harapan',1,1),('MST-BANSOS-002','KATEGORI_BANSOS','BPNT','Bantuan Pangan Non Tunai',2,1),('MST-KOS-001','KATEGORI_KOS','PUTRA','Kos Putra',1,1),('MST-KOS-002','KATEGORI_KOS','PUTRI','Kos Putri',2,1),('MST-PEND-001','PENDIDIKAN','SD','SD/Sederajat',1,1),('MST-PEND-002','PENDIDIKAN','SMP','SMP/Sederajat',2,1),('MST-PEND-003','PENDIDIKAN','SMA','SMA/Sederajat',3,1),('MST-PEND-004','PENDIDIKAN','S1','Sarjana (S1)',4,1),('MST-PROF-001','PROFESI','PELAJAR','Pelajar',1,1),('MST-PROF-002','PROFESI','MAHASISWA','Mahasiswa',2,1),('MST-PROF-003','PROFESI','WIRASWASTA','Wiraswasta',3,1),('MST-PROF-004','PROFESI','KARYAWAN','Karyawan Swasta',4,1),('MST-SISKAM-001','JENIS_KEJADIAN_SISKAMLING','PENCURIAN','Pencurian',1,1),('MST-SISKAM-002','JENIS_KEJADIAN_SISKAMLING','KEBAKARAN','Kebakaran',2,1),('MST-SISKAM-003','JENIS_KEJADIAN_SISKAMLING','KERIBUTAN','Keributan',3,1);
/*!40000 ALTER TABLE `master_data` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2026_08_17_000001_create_sistem_tetangga_core_tables',1),(4,'2026_08_17_055741_create_personal_access_tokens_table',2),(5,'0001_01_01_000000_create_users_table',99),(6,'2026_08_19_000002_create_sistem_tetangga_remaining_tables',99);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `module` (
  `id_module` char(36) NOT NULL DEFAULT uuid(),
  `kode_module` varchar(50) NOT NULL,
  `nama_module` varchar(100) NOT NULL,
  `urutan` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_module`),
  UNIQUE KEY `kode_module` (`kode_module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `module` WRITE;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` VALUES ('MOD-001','DASHBOARD','Dashboard',1),('MOD-002','WARGA','Data Warga',2),('MOD-003','KELUARGA','Data Keluarga',3),('MOD-004','SURAT','Pelayanan Surat',4),('MOD-005','KEUANGAN','Keuangan',5),('MOD-006','SISKAMLING','Siskamling',6),('MOD-007','PENGUMUMAN','Pengumuman',7),('MOD-008','IURAN','Iuran Warga',6),('MOD-009','PERUMAHAN','Perumahan',9),('MOD-010','TAMU','Pendataan Tamu',10),('MOD-011','PENGADUAN','Pengaduan (SIPANDU)',11),('MOD-012','PERATURAN','Peraturan & Tata Tertib',12),('MOD-013','ORGANISASI','Struktur Organisasi',13),('MOD-014','PESAN','Pesan & Kesan',14),('MOD-015','NOTIFIKASI','Notifikasi',15),('MOD-016','MASTER','Master Data',16),('MOD-017','USER','User Management',17),('MOD-018','AUDIT','Audit Log',18);
/*!40000 ALTER TABLE `module` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notification_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notification_log`),
  KEY `idx_notif_user` (`id_users`),
  KEY `idx_notif_status` (`status_kirim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notification_log` WRITE;
/*!40000 ALTER TABLE `notification_log` DISABLE KEYS */;
INSERT INTO `notification_log` VALUES ('NOT-001','USR-002','PENGUMUMAN','TELEGRAM','Pengumuman kerja bakti telah diterbitkan.','TERKIRIM',0,'announcement','ANN-001','2026-08-17 00:04:49','2026-08-17 00:04:49'),('NOT-002','USR-003','SISKAMLING','TELEGRAM','Terdapat laporan insiden siskamling.','TERKIRIM',0,'siskamling_incident','SKI-001','2026-08-17 00:04:49','2026-08-17 00:04:49');
/*!40000 ALTER TABLE `notification_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notification_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_subscription` (
  `id_users` char(36) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `is_subscribed` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_users`,`kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notification_subscription` WRITE;
/*!40000 ALTER TABLE `notification_subscription` DISABLE KEYS */;
INSERT INTO `notification_subscription` VALUES ('USR-001','PENGUMUMAN',1),('USR-001','SISKAMLING',1),('USR-002','IURAN',1),('USR-002','PENGUMUMAN',1),('USR-003','PENGUMUMAN',1);
/*!40000 ALTER TABLE `notification_subscription` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organization_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization_member` (
  `id_organization_member` char(36) NOT NULL DEFAULT uuid(),
  `id_citizen` char(36) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  `status_aktif` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_organization_member`),
  KEY `fk_orgmember_citizen` (`id_citizen`),
  KEY `idx_orgmember_wilayah` (`id_wilayah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organization_member` WRITE;
/*!40000 ALTER TABLE `organization_member` DISABLE KEYS */;
INSERT INTO `organization_member` VALUES ('ORG-001','CIT-001','Ketua RT','RT01','2026-01-01',NULL,NULL,1),('ORG-002','CIT-004','Ketua RW','RW01','2026-01-01',NULL,NULL,1);
/*!40000 ALTER TABLE `organization_member` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `permission_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission_action` (
  `id_permission_action` tinyint(4) NOT NULL AUTO_INCREMENT,
  `kode_permission` varchar(20) NOT NULL,
  `deskripsi` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_permission_action`),
  UNIQUE KEY `kode_permission` (`kode_permission`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `permission_action` WRITE;
/*!40000 ALTER TABLE `permission_action` DISABLE KEYS */;
INSERT INTO `permission_action` VALUES (1,'VIEW','Melihat data'),(2,'CREATE','Menambahkan data'),(3,'UPDATE','Mengubah data'),(4,'DELETE','Menghapus data'),(5,'APPROVE','Menyetujui data'),(6,'VERIFY','Memverifikasi data');
/*!40000 ALTER TABLE `permission_action` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `permission_override`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_permission_override`),
  KEY `fk_po_module` (`id_module`),
  KEY `fk_po_action` (`id_permission_action`),
  KEY `fk_po_wilayah` (`id_wilayah`),
  KEY `idx_po_user` (`id_users`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `permission_override` WRITE;
/*!40000 ALTER TABLE `permission_override` DISABLE KEYS */;
INSERT INTO `permission_override` VALUES ('POV-001','USR-002','MOD-004',5,'RT01',1,'Ketua RT dapat melakukan persetujuan surat tertentu.','USR-001','2026-08-17 00:04:56','2026-12-31 23:59:59');
/*!40000 ALTER TABLE `permission_override` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` char(36) NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User','USR-004','auth_token','a99ebe493308621c110820e1e120e808ca7500156be16afeef229f9190492721','[\"*\"]',NULL,NULL,'2026-08-18 21:53:54','2026-08-18 21:53:54'),(2,'App\\Models\\User','USR-001','auth_token','85c7b6df4428103a71cdf8a5fd0cfedb82d185f71b1f7c1684663a6a0aea2f87','[\"*\"]',NULL,NULL,'2026-08-18 21:53:55','2026-08-18 21:53:55'),(5,'App\\Models\\User','USR-001','auth_token','9c5ea7ae34a8728eebe43b1c3344be4d684b0a53ed72473b4b5a0bdf85a22ebd','[\"*\"]',NULL,NULL,'2026-08-18 21:53:56','2026-08-18 21:53:56'),(6,'App\\Models\\User','USR-004','auth_token','132723d826da1bca5514406cdc3c87c2b4e69ab61bf6c9a9813f0f2d14f6fee7','[\"*\"]','2026-08-18 21:56:47',NULL,'2026-08-18 21:56:47','2026-08-18 21:56:47'),(7,'App\\Models\\User','USR-004','auth_token','f2fb96c5816191783c3a4179a8b9c99da124d5b7159159ddb952d4669b55bf36','[\"*\"]',NULL,NULL,'2026-08-18 21:58:32','2026-08-18 21:58:32'),(8,'App\\Models\\User','USR-001','auth_token','48673bede7d4c0cc961288240c75e7796d3d52d823aa77e2f2a479d3354da2aa','[\"*\"]',NULL,NULL,'2026-08-18 21:59:20','2026-08-18 21:59:20'),(10,'App\\Models\\User','USR-001','auth_token','52aafbca370efb20d2dbe8367c1dcdcf2ff0ea7c885932d6eb1ffb4f0cde2fb6','[\"*\"]',NULL,NULL,'2026-08-18 22:09:56','2026-08-18 22:09:56'),(13,'App\\Models\\User','USR-004','auth_token','d665d13eb311869a7b2e0f22607daa74b07a94189fdc06220ee6f56abdb0a402','[\"*\"]',NULL,NULL,'2026-08-18 22:10:09','2026-08-18 22:10:09'),(16,'App\\Models\\User','USR-001','auth_token','925668d252a4d90c4974ea0b105ebf782198d4d98af9954203d4d6d5039c27f6','[\"*\"]',NULL,NULL,'2026-08-18 22:11:16','2026-08-18 22:11:16'),(19,'App\\Models\\User','USR-004','auth_token','ca43540d17d0dfae1a60c5789d28e9458430e4204cf7723fdc7bfc2b61f116d3','[\"*\"]',NULL,NULL,'2026-08-18 22:11:19','2026-08-18 22:11:19'),(23,'App\\Models\\User','USR-001','auth_token','dd54c5bdccede851d9fb35257f0af33a43ba4d74e8429909047aaa2bae78510d','[\"*\"]',NULL,NULL,'2026-08-18 22:24:13','2026-08-18 22:24:13'),(26,'App\\Models\\User','USR-004','auth_token','ca137da66d8e7e61b69f6f2f1cb549d4ffa7a29a5206553cf85d7b31bfe1ceea','[\"*\"]',NULL,NULL,'2026-08-18 22:24:14','2026-08-18 22:24:14'),(29,'App\\Models\\User','USR-001','auth_token','071e95e73ef02ffc836b6db183c729e0fdd3238dc5f9f80f9f9d15f128508ca9','[\"*\"]',NULL,NULL,'2026-08-18 22:25:25','2026-08-18 22:25:25'),(30,'App\\Models\\User','USR-004','auth_token','fd86ad821d9612bd4d54853b0fc32a946f18a37529307f8624426a4430014630','[\"*\"]',NULL,NULL,'2026-08-18 22:25:43','2026-08-18 22:25:43'),(32,'App\\Models\\User','USR-004','auth_token','4971c6d5a371bf86eb2e99320d9b1e29aea82c1a82892e41a840de80cf2de72c','[\"*\"]','2026-08-18 23:00:25',NULL,'2026-08-18 23:00:24','2026-08-18 23:00:25'),(33,'App\\Models\\User','USR-001','auth_token','5520f35de5b1e565c4c952715b4bccfdf695c1ebd01d45d209570c7f2b6382d9','[\"*\"]','2026-08-18 23:00:41',NULL,'2026-08-18 23:00:39','2026-08-18 23:00:41'),(41,'App\\Models\\User','USR-004','auth_token','af36e64446eeb3bc0659adee2aa4ebb0ea1e38aab744935390c918a749a61cb3','[\"*\"]',NULL,NULL,'2026-08-18 23:06:24','2026-08-18 23:06:24'),(42,'App\\Models\\User','USR-001','auth_token','78d380d025bd5a0099da8d2b6259285324aa2a113fe508220089ceec03d5c1f9','[\"*\"]','2026-08-18 23:07:34',NULL,'2026-08-18 23:07:29','2026-08-18 23:07:34'),(43,'App\\Models\\User','USR-004','auth_token','6035bea5c763062c66b3981c13cdd40ed90b55a651de3821cbe6af0c4cd7ab44','[\"*\"]','2026-08-18 23:07:36',NULL,'2026-08-18 23:07:30','2026-08-18 23:07:36'),(48,'App\\Models\\User','USR-008','auth_token','cf65c16c6b8fa9348b65fee86e9a640607df875bf8a38071a442265d75dc8a2c','[\"*\"]',NULL,NULL,'2026-08-18 23:10:50','2026-08-18 23:10:50'),(49,'App\\Models\\User','USR-004','auth_token','af89f9e7baadfb458f7995b8f4a80a85e390ad92ceef79ae011aac70879eed0c','[\"*\"]','2026-08-18 23:15:26',NULL,'2026-08-18 23:15:25','2026-08-18 23:15:26'),(50,'App\\Models\\User','USR-004','auth_token','30efc8efb9b27901e413a2ee2eb5f502a26f2c1810e682cc4ecfbc7acfa6007a','[\"*\"]','2026-08-18 23:15:36',NULL,'2026-08-18 23:15:36','2026-08-18 23:15:36'),(51,'App\\Models\\User','USR-004','auth_token','e718c843e84c21d572b40819f992467dc1f3064c5e5063e11afe349500c7611e','[\"*\"]','2026-08-18 23:22:34',NULL,'2026-08-18 23:22:30','2026-08-18 23:22:34'),(54,'App\\Models\\User','USR-004','auth_token','faf351d6ce9c482ee7d18a24e41f99523b923bc4669184a9822d46b1facc4338','[\"*\"]','2026-08-18 23:24:45',NULL,'2026-08-18 23:24:39','2026-08-18 23:24:45'),(57,'App\\Models\\User','USR-004','auth_token','14967f9a4f06ed2cec607b380ea8901123b1217ae697845718fb3c52fc50b155','[\"*\"]','2026-08-18 23:31:07',NULL,'2026-08-18 23:28:10','2026-08-18 23:31:07'),(83,'App\\Models\\User','USR-001','auth_token','2f55da7eeeb0bdc5e28b5b279ed373732e66e16409ddc748fb0ae0c04f56ae65','[\"*\"]',NULL,NULL,'2026-08-19 22:00:43','2026-08-19 22:00:43'),(90,'App\\Models\\User','USR-003','auth_token','087a85f5f7d826f165bab349b8fc379b1982c7189e944c031d53127f75948dc0','[\"*\"]',NULL,NULL,'2026-08-19 22:19:40','2026-08-19 22:19:40'),(91,'App\\Models\\User','USR-008','auth_token','32d74cc4f6d1f79ce665147930c4a2687e16590b2f0bb88ecbf4796595e7b447','[\"*\"]','2026-08-19 22:25:24',NULL,'2026-08-19 22:20:05','2026-08-19 22:25:24'),(104,'App\\Models\\User','USR-003','auth_token','7181e3d7bb862420ae984a2a91928cccacc319c3d329bffe9b6befe6ade95869','[\"*\"]',NULL,NULL,'2026-08-19 22:57:28','2026-08-19 22:57:28'),(105,'App\\Models\\User','USR-008','auth_token','f1118e49140215ffa18966a5fa92eb32ff2ddfc4f4c9e8060d4007b67a544b69','[\"*\"]','2026-08-19 22:59:34',NULL,'2026-08-19 22:58:34','2026-08-19 22:59:34'),(106,'App\\Models\\User','USR-CLN','auth_token','bc8fbbb47be3679ac57ed8de42c8abb2cc132dd45d452e63b3d9979915b63e2e','[\"*\"]','2026-08-19 23:08:50',NULL,'2026-08-19 23:05:09','2026-08-19 23:08:50');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `regulation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_regulation`),
  KEY `fk_regulation_creator` (`created_by`),
  KEY `idx_regulation_wilayah` (`id_wilayah`),
  KEY `idx_regulation_kategori` (`kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `regulation` WRITE;
/*!40000 ALTER TABLE `regulation` DISABLE KEYS */;
INSERT INTO `regulation` VALUES ('REG-001','WARGA_TETAP','Ketentuan Kebersihan Lingkungan','Setiap warga wajib menjaga kebersihan lingkungan sekitar rumah.',NULL,'KEL01',1,'2026-01-01','AKTIF','USR-001','2026-08-17 00:04:12'),('REG-002','TAMU','Ketentuan Tamu','Tamu wajib melakukan pencatatan kepada pengurus wilayah.',NULL,'KEL01',1,'2026-01-01','AKTIF','USR-001','2026-08-17 00:04:12');
/*!40000 ALTER TABLE `regulation` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id_role` char(36) NOT NULL DEFAULT uuid(),
  `kode` varchar(50) NOT NULL,
  `nama_role` varchar(100) NOT NULL,
  `level` tinyint(4) NOT NULL,
  `is_strategic` tinyint(1) NOT NULL DEFAULT 0,
  `deskripsi` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('ROLE-ADMIN','ADMIN','Administrator',1,1,'Administrator sistem'),('ROLE-DUKUH','DUKUH','Kepala Dukuh',2,1,'Pengelola tingkat kelurahan/dukuh'),('ROLE-RT','RT','Ketua RT',4,0,'Pengurus tingkat RT'),('ROLE-RW','RW','Ketua RW',3,0,'Pengurus tingkat RW'),('ROLE-SEKRETARIS','SEKRETARIS','Sekretaris RT',4,1,'Sekretaris tingkat RT'),('ROLE-WARGA','WARGA','Warga',5,0,'Pengguna umum');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permission` (
  `id_role_permission` char(36) NOT NULL DEFAULT uuid(),
  `id_role` char(36) NOT NULL,
  `id_module` char(36) NOT NULL,
  `id_permission_action` tinyint(4) NOT NULL,
  `resource_scope` varchar(100) NOT NULL DEFAULT '*',
  `scope_level` enum('OWN','RT','RW','KELURAHAN','ALL') NOT NULL,
  PRIMARY KEY (`id_role_permission`),
  UNIQUE KEY `uq_role_module_action_resource` (`id_role`,`id_module`,`id_permission_action`,`resource_scope`),
  KEY `fk_rp_module` (`id_module`),
  KEY `fk_rp_action` (`id_permission_action`),
  KEY `idx_rp_role` (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES ('RP-006','ROLE-RT','MOD-002',1,'citizen','RT'),('RP-007','ROLE-RT','MOD-002',2,'citizen','RT'),('RP-008','ROLE-RW','MOD-002',1,'citizen','RW'),('RP-009','ROLE-DUKUH','MOD-002',1,'citizen','KELURAHAN'),('RP-010','ROLE-ADMIN','MOD-001',1,'*','ALL'),('RP-011','ROLE-ADMIN','MOD-001',2,'*','ALL'),('RP-012','ROLE-ADMIN','MOD-001',3,'*','ALL'),('RP-013','ROLE-ADMIN','MOD-001',4,'*','ALL'),('RP-014','ROLE-ADMIN','MOD-001',5,'*','ALL'),('RP-015','ROLE-ADMIN','MOD-001',6,'*','ALL'),('RP-016','ROLE-ADMIN','MOD-002',1,'*','ALL'),('RP-017','ROLE-ADMIN','MOD-002',2,'*','ALL'),('RP-018','ROLE-ADMIN','MOD-002',3,'*','ALL'),('RP-019','ROLE-ADMIN','MOD-002',4,'*','ALL'),('RP-020','ROLE-ADMIN','MOD-002',5,'*','ALL'),('RP-021','ROLE-ADMIN','MOD-002',6,'*','ALL'),('RP-022','ROLE-ADMIN','MOD-003',1,'*','ALL'),('RP-023','ROLE-ADMIN','MOD-003',2,'*','ALL'),('RP-024','ROLE-ADMIN','MOD-003',3,'*','ALL'),('RP-025','ROLE-ADMIN','MOD-003',4,'*','ALL'),('RP-026','ROLE-ADMIN','MOD-003',5,'*','ALL'),('RP-027','ROLE-ADMIN','MOD-003',6,'*','ALL'),('RP-028','ROLE-ADMIN','MOD-004',1,'*','ALL'),('RP-029','ROLE-ADMIN','MOD-004',2,'*','ALL'),('RP-030','ROLE-ADMIN','MOD-004',3,'*','ALL'),('RP-031','ROLE-ADMIN','MOD-004',4,'*','ALL'),('RP-032','ROLE-ADMIN','MOD-004',5,'*','ALL'),('RP-033','ROLE-ADMIN','MOD-004',6,'*','ALL'),('RP-034','ROLE-ADMIN','MOD-005',1,'*','ALL'),('RP-035','ROLE-ADMIN','MOD-005',2,'*','ALL'),('RP-036','ROLE-ADMIN','MOD-005',3,'*','ALL'),('RP-037','ROLE-ADMIN','MOD-005',4,'*','ALL'),('RP-038','ROLE-ADMIN','MOD-005',5,'*','ALL'),('RP-039','ROLE-ADMIN','MOD-005',6,'*','ALL'),('RP-040','ROLE-ADMIN','MOD-008',1,'*','ALL'),('RP-041','ROLE-ADMIN','MOD-008',2,'*','ALL'),('RP-042','ROLE-ADMIN','MOD-008',3,'*','ALL'),('RP-043','ROLE-ADMIN','MOD-008',4,'*','ALL'),('RP-044','ROLE-ADMIN','MOD-008',5,'*','ALL'),('RP-045','ROLE-ADMIN','MOD-008',6,'*','ALL'),('RP-046','ROLE-ADMIN','MOD-006',1,'*','ALL'),('RP-047','ROLE-ADMIN','MOD-006',2,'*','ALL'),('RP-048','ROLE-ADMIN','MOD-006',3,'*','ALL'),('RP-049','ROLE-ADMIN','MOD-006',4,'*','ALL'),('RP-050','ROLE-ADMIN','MOD-006',5,'*','ALL'),('RP-051','ROLE-ADMIN','MOD-006',6,'*','ALL'),('RP-052','ROLE-ADMIN','MOD-007',1,'*','ALL'),('RP-053','ROLE-ADMIN','MOD-007',2,'*','ALL'),('RP-054','ROLE-ADMIN','MOD-007',3,'*','ALL'),('RP-055','ROLE-ADMIN','MOD-007',4,'*','ALL'),('RP-056','ROLE-ADMIN','MOD-007',5,'*','ALL'),('RP-057','ROLE-ADMIN','MOD-007',6,'*','ALL'),('RP-058','ROLE-ADMIN','MOD-009',1,'*','ALL'),('RP-059','ROLE-ADMIN','MOD-009',2,'*','ALL'),('RP-060','ROLE-ADMIN','MOD-009',3,'*','ALL'),('RP-061','ROLE-ADMIN','MOD-009',4,'*','ALL'),('RP-062','ROLE-ADMIN','MOD-009',5,'*','ALL'),('RP-063','ROLE-ADMIN','MOD-009',6,'*','ALL'),('RP-064','ROLE-ADMIN','MOD-010',1,'*','ALL'),('RP-065','ROLE-ADMIN','MOD-010',2,'*','ALL'),('RP-066','ROLE-ADMIN','MOD-010',3,'*','ALL'),('RP-067','ROLE-ADMIN','MOD-010',4,'*','ALL'),('RP-068','ROLE-ADMIN','MOD-010',5,'*','ALL'),('RP-069','ROLE-ADMIN','MOD-010',6,'*','ALL'),('RP-070','ROLE-ADMIN','MOD-011',1,'*','ALL'),('RP-071','ROLE-ADMIN','MOD-011',2,'*','ALL'),('RP-072','ROLE-ADMIN','MOD-011',3,'*','ALL'),('RP-073','ROLE-ADMIN','MOD-011',4,'*','ALL'),('RP-074','ROLE-ADMIN','MOD-011',5,'*','ALL'),('RP-075','ROLE-ADMIN','MOD-011',6,'*','ALL'),('RP-076','ROLE-ADMIN','MOD-012',1,'*','ALL'),('RP-077','ROLE-ADMIN','MOD-012',2,'*','ALL'),('RP-078','ROLE-ADMIN','MOD-012',3,'*','ALL'),('RP-079','ROLE-ADMIN','MOD-012',4,'*','ALL'),('RP-080','ROLE-ADMIN','MOD-012',5,'*','ALL'),('RP-081','ROLE-ADMIN','MOD-012',6,'*','ALL'),('RP-082','ROLE-ADMIN','MOD-013',1,'*','ALL'),('RP-083','ROLE-ADMIN','MOD-013',2,'*','ALL'),('RP-084','ROLE-ADMIN','MOD-013',3,'*','ALL'),('RP-085','ROLE-ADMIN','MOD-013',4,'*','ALL'),('RP-086','ROLE-ADMIN','MOD-013',5,'*','ALL'),('RP-087','ROLE-ADMIN','MOD-013',6,'*','ALL'),('RP-088','ROLE-ADMIN','MOD-014',1,'*','ALL'),('RP-089','ROLE-ADMIN','MOD-014',2,'*','ALL'),('RP-090','ROLE-ADMIN','MOD-014',3,'*','ALL'),('RP-091','ROLE-ADMIN','MOD-014',4,'*','ALL'),('RP-092','ROLE-ADMIN','MOD-014',5,'*','ALL'),('RP-093','ROLE-ADMIN','MOD-014',6,'*','ALL'),('RP-094','ROLE-ADMIN','MOD-015',1,'*','ALL'),('RP-095','ROLE-ADMIN','MOD-015',2,'*','ALL'),('RP-096','ROLE-ADMIN','MOD-015',3,'*','ALL'),('RP-097','ROLE-ADMIN','MOD-015',4,'*','ALL'),('RP-098','ROLE-ADMIN','MOD-015',5,'*','ALL'),('RP-099','ROLE-ADMIN','MOD-015',6,'*','ALL'),('RP-100','ROLE-ADMIN','MOD-016',1,'*','ALL'),('RP-101','ROLE-ADMIN','MOD-016',2,'*','ALL'),('RP-102','ROLE-ADMIN','MOD-016',3,'*','ALL'),('RP-103','ROLE-ADMIN','MOD-016',4,'*','ALL'),('RP-104','ROLE-ADMIN','MOD-016',5,'*','ALL'),('RP-105','ROLE-ADMIN','MOD-016',6,'*','ALL'),('RP-106','ROLE-ADMIN','MOD-017',1,'*','ALL'),('RP-107','ROLE-ADMIN','MOD-017',2,'*','ALL'),('RP-108','ROLE-ADMIN','MOD-017',3,'*','ALL'),('RP-109','ROLE-ADMIN','MOD-017',4,'*','ALL'),('RP-110','ROLE-ADMIN','MOD-017',5,'*','ALL'),('RP-111','ROLE-ADMIN','MOD-017',6,'*','ALL'),('RP-112','ROLE-ADMIN','MOD-018',1,'*','ALL'),('RP-113','ROLE-ADMIN','MOD-018',2,'*','ALL'),('RP-114','ROLE-ADMIN','MOD-018',3,'*','ALL'),('RP-115','ROLE-ADMIN','MOD-018',4,'*','ALL'),('RP-116','ROLE-ADMIN','MOD-018',5,'*','ALL'),('RP-117','ROLE-ADMIN','MOD-018',6,'*','ALL'),('RP-118','ROLE-DUKUH','MOD-001',1,'*','KELURAHAN'),('RP-119','ROLE-DUKUH','MOD-002',1,'*','KELURAHAN'),('RP-120','ROLE-DUKUH','MOD-003',1,'*','KELURAHAN'),('RP-121','ROLE-DUKUH','MOD-009',1,'*','KELURAHAN'),('RP-122','ROLE-DUKUH','MOD-005',1,'*','KELURAHAN'),('RP-123','ROLE-DUKUH','MOD-007',1,'*','KELURAHAN'),('RP-124','ROLE-DUKUH','MOD-012',1,'*','KELURAHAN'),('RP-125','ROLE-DUKUH','MOD-013',1,'*','KELURAHAN'),('RP-126','ROLE-DUKUH','MOD-011',1,'*','KELURAHAN'),('RP-127','ROLE-RT','MOD-001',1,'*','RT'),('RP-128','ROLE-RT','MOD-002',1,'*','RT'),('RP-129','ROLE-RT','MOD-002',2,'*','RT'),('RP-130','ROLE-RT','MOD-002',3,'*','RT'),('RP-131','ROLE-RT','MOD-002',4,'*','RT'),('RP-132','ROLE-RT','MOD-003',1,'*','RT'),('RP-133','ROLE-RT','MOD-003',2,'*','RT'),('RP-134','ROLE-RT','MOD-003',3,'*','RT'),('RP-135','ROLE-RT','MOD-003',4,'*','RT'),('RP-136','ROLE-RT','MOD-009',1,'*','RT'),('RP-137','ROLE-RT','MOD-009',2,'*','RT'),('RP-138','ROLE-RT','MOD-009',3,'*','RT'),('RP-139','ROLE-RT','MOD-009',4,'*','RT'),('RP-140','ROLE-RT','MOD-010',1,'*','RT'),('RP-141','ROLE-RT','MOD-010',5,'*','RT'),('RP-142','ROLE-RT','MOD-005',1,'*','RT'),('RP-143','ROLE-RT','MOD-008',1,'*','RT'),('RP-144','ROLE-RT','MOD-008',5,'*','RT'),('RP-145','ROLE-RT','MOD-004',1,'*','RT'),('RP-146','ROLE-RT','MOD-004',5,'*','RT'),('RP-147','ROLE-RT','MOD-006',1,'*','RT'),('RP-148','ROLE-RT','MOD-006',2,'*','RT'),('RP-149','ROLE-RT','MOD-006',3,'*','RT'),('RP-150','ROLE-RT','MOD-006',5,'*','RT'),('RP-151','ROLE-RT','MOD-007',1,'*','RT'),('RP-152','ROLE-RT','MOD-007',2,'*','RT'),('RP-153','ROLE-RT','MOD-007',3,'*','RT'),('RP-154','ROLE-RT','MOD-007',4,'*','RT'),('RP-155','ROLE-RT','MOD-012',1,'*','RT'),('RP-156','ROLE-RT','MOD-012',2,'*','RT'),('RP-157','ROLE-RT','MOD-012',3,'*','RT'),('RP-158','ROLE-RT','MOD-012',4,'*','RT'),('RP-159','ROLE-RT','MOD-013',1,'*','RT'),('RP-160','ROLE-RT','MOD-013',2,'*','RT'),('RP-161','ROLE-RT','MOD-013',3,'*','RT'),('RP-162','ROLE-RT','MOD-013',4,'*','RT'),('RP-163','ROLE-RT','MOD-014',1,'*','RT'),('RP-164','ROLE-RT','MOD-011',1,'*','RT'),('RP-165','ROLE-RT','MOD-011',3,'*','RT'),('RP-166','ROLE-RT','MOD-011',5,'*','RT'),('RP-167','ROLE-RT','MOD-015',1,'*','RT'),('RP-168','ROLE-RT','MOD-017',1,'*','RT'),('RP-169','ROLE-RT','MOD-017',2,'*','RT'),('RP-170','ROLE-RT','MOD-017',3,'*','RT'),('RP-171','ROLE-RT','MOD-017',4,'*','RT'),('RP-172','ROLE-RT','MOD-016',1,'*','RT'),('RP-173','ROLE-RT','MOD-016',2,'*','RT'),('RP-174','ROLE-RT','MOD-016',3,'*','RT'),('RP-175','ROLE-RT','MOD-016',4,'*','RT'),('RP-176','ROLE-RT','MOD-018',1,'*','RT'),('RP-177','ROLE-RW','MOD-001',1,'*','RW'),('RP-178','ROLE-RW','MOD-002',1,'*','RW'),('RP-179','ROLE-RW','MOD-002',6,'citizen','RW'),('RP-180','ROLE-RW','MOD-003',1,'*','RW'),('RP-181','ROLE-RW','MOD-009',1,'*','RW'),('RP-182','ROLE-RW','MOD-005',1,'*','RW'),('RP-183','ROLE-RW','MOD-004',1,'*','RW'),('RP-184','ROLE-RW','MOD-007',1,'*','RW'),('RP-185','ROLE-RW','MOD-012',1,'*','RW'),('RP-186','ROLE-RW','MOD-013',1,'*','RW'),('RP-187','ROLE-RW','MOD-011',1,'*','RW'),('RP-188','ROLE-WARGA','MOD-001',1,'*','OWN'),('RP-189','ROLE-WARGA','MOD-002',1,'*','OWN'),('RP-190','ROLE-WARGA','MOD-010',2,'*','OWN'),('RP-191','ROLE-WARGA','MOD-005',1,'*','OWN'),('RP-192','ROLE-WARGA','MOD-008',1,'*','OWN'),('RP-193','ROLE-WARGA','MOD-004',2,'*','OWN'),('RP-194','ROLE-WARGA','MOD-004',1,'*','OWN'),('RP-195','ROLE-WARGA','MOD-006',1,'*','OWN'),('RP-196','ROLE-WARGA','MOD-007',1,'*','OWN'),('RP-197','ROLE-WARGA','MOD-012',1,'*','OWN'),('RP-198','ROLE-WARGA','MOD-013',1,'*','OWN'),('RP-199','ROLE-WARGA','MOD-014',2,'*','OWN'),('RP-200','ROLE-WARGA','MOD-011',2,'*','OWN'),('RP-201','ROLE-WARGA','MOD-011',1,'*','OWN'),('RP-202','ROLE-WARGA','MOD-015',1,'*','OWN'),('RP-203','ROLE-WARGA','MOD-017',1,'*','OWN'),('RP-204','ROLE-WARGA','MOD-010',1,'*','OWN'),('RP-205','ROLE-SEKRETARIS','MOD-001',1,'*','RT'),('RP-206','ROLE-SEKRETARIS','MOD-002',1,'*','RT'),('RP-207','ROLE-SEKRETARIS','MOD-002',2,'*','RT'),('RP-208','ROLE-SEKRETARIS','MOD-002',3,'*','RT'),('RP-209','ROLE-SEKRETARIS','MOD-002',4,'*','RT'),('RP-210','ROLE-SEKRETARIS','MOD-003',1,'*','RT'),('RP-211','ROLE-SEKRETARIS','MOD-003',2,'*','RT'),('RP-212','ROLE-SEKRETARIS','MOD-003',3,'*','RT'),('RP-213','ROLE-SEKRETARIS','MOD-003',4,'*','RT'),('RP-214','ROLE-SEKRETARIS','MOD-009',1,'*','RT'),('RP-215','ROLE-SEKRETARIS','MOD-009',2,'*','RT'),('RP-216','ROLE-SEKRETARIS','MOD-009',3,'*','RT'),('RP-217','ROLE-SEKRETARIS','MOD-009',4,'*','RT'),('RP-218','ROLE-SEKRETARIS','MOD-010',1,'*','RT'),('RP-219','ROLE-SEKRETARIS','MOD-005',1,'*','RT'),('RP-220','ROLE-SEKRETARIS','MOD-008',1,'*','RT'),('RP-221','ROLE-SEKRETARIS','MOD-004',1,'*','RT'),('RP-222','ROLE-SEKRETARIS','MOD-004',6,'*','RT'),('RP-223','ROLE-SEKRETARIS','MOD-006',1,'*','RT'),('RP-224','ROLE-SEKRETARIS','MOD-007',1,'*','RT'),('RP-225','ROLE-SEKRETARIS','MOD-007',2,'*','RT'),('RP-226','ROLE-SEKRETARIS','MOD-007',3,'*','RT'),('RP-227','ROLE-SEKRETARIS','MOD-007',4,'*','RT'),('RP-228','ROLE-SEKRETARIS','MOD-012',1,'*','RT'),('RP-229','ROLE-SEKRETARIS','MOD-012',2,'*','RT'),('RP-230','ROLE-SEKRETARIS','MOD-012',3,'*','RT'),('RP-231','ROLE-SEKRETARIS','MOD-012',4,'*','RT'),('RP-232','ROLE-SEKRETARIS','MOD-013',1,'*','RT'),('RP-233','ROLE-SEKRETARIS','MOD-014',1,'*','RT'),('RP-234','ROLE-SEKRETARIS','MOD-011',1,'*','RT');
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('bjahVbkqGplhbc8tM0Ef00r8dcgRMZTUi37abIH1',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoieGRJcjNTVllOZUVUa05ZTXZpdFlMcFpvV291M1NEQnFQcjM4Y2NHVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787201007),('CkHx6d5HXPknyZaUN9yVdCgoQCSh4Soqg9G8MGIt',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUkkya3BzREdIMElqUUwxU0pxSVltZDJxbFZKeXBKWU5NUXhpWHAzUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787200985),('enZiiY6Bl2zxFFechBU5x1CcCkyt9qN1zhAF6nvB',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRm5VMWxyOE5reWdOVHdPUXgxOVR6d3JoZWF3RVRkcVE0Q21YRXI4dSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116300),('F5DWhU6X8ZlN2MmEfKwfdhcI9H2htvn6qWU36jtr',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiak5BWExvRmliQTZCY3BMZWVkNGtXWEhMNUVQdTBiUlZYeEkzb1pITCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116279),('hoMnDsYhGdjJ5Lnx0dCsI2NSWi7K7bOSNbvWu1Eh',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoibzdZMmtHZDFzeFlVM1ZBSjBjeTVNRExiZTAwbjR3RWdyZGJVdnFUayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116315),('mUvtk4dfj6Zg4iQ5mhFYENJnXxBCm1RQv7WIWb4g',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQkI0c3pSRUZBR1NOOU5Mdms1bGtkWjd3Q0NvWm1ib3lUajRxWVo5SiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116314),('mvlmPfTgmCmUmBh9j9ODNee5rOXYdX7KfDBR8YMl',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoicGpWeDkwUUhVWnpaSjFiTEZobXVScndSOEpoYnpYR1BIeUZjb0VXWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116277),('RFfHmk5Tn6M4WW1ELZ0kWBi60GfKboapLfC5uq8X',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDh4S2ZCcXdGUW9vdW5SMkJBdVd3aVVqM2pkbG9QYzlYZE1jZEQwcyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116301),('YfIrbeWZ0xS2009ioxwF0mK3oyHeVQhLXY502JoA',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSmNkQXdGc3pKZVh0V2ZDSjNCTUROakxEZVBmdDVPREMyTlhWb2thYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787116299),('yOpyUa6iBoBaf9QNpNWN1OYp6doqoDGihGc2Wa2e',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSGI4YlJCSTdHSVFsSzRJTVgwV2YzRGpqc0YybzJsdlp4R2pLMTVUSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6OTAwMSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1787201610);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `siskamling_checkin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `siskamling_checkin` (
  `id_siskamling_checkin` char(36) NOT NULL DEFAULT uuid(),
  `id_siskamling_schedule` char(36) NOT NULL,
  `checkin_time` datetime NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_siskamling_checkin`),
  KEY `fk_checkin_schedule` (`id_siskamling_schedule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `siskamling_checkin` WRITE;
/*!40000 ALTER TABLE `siskamling_checkin` DISABLE KEYS */;
INSERT INTO `siskamling_checkin` VALUES ('SKC-001','SKJ-001','2026-08-17 22:05:00',-7.7956000,110.3695000,'/uploads/siskamling/checkin-001.jpg'),('SKC-002','SKJ-002','2026-08-18 22:02:00',-7.7958000,110.3697000,'/uploads/siskamling/checkin-002.jpg');
/*!40000 ALTER TABLE `siskamling_checkin` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `siskamling_incident`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_siskamling_incident`),
  KEY `fk_incident_reporter` (`dilaporkan_oleh`),
  KEY `fk_incident_jenis` (`id_jenis_kejadian`),
  KEY `idx_incident_wilayah` (`id_wilayah`),
  KEY `idx_incident_panic` (`is_panic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `siskamling_incident` WRITE;
/*!40000 ALTER TABLE `siskamling_incident` DISABLE KEYS */;
INSERT INTO `siskamling_incident` VALUES ('SKI-001','RT01','USR-002','MST-SISKAM-001','Jl. Sukamaju No. 15','Terdapat laporan kehilangan sepeda motor.',NULL,0,'DITINDAKLANJUTI','2026-08-17 00:04:36'),('SKI-002','RT02','USR-003','MST-SISKAM-003','Pos Kamling RW 01','Terdapat keributan kecil dan sudah diselesaikan oleh pengurus.',NULL,0,'SELESAI','2026-08-17 00:04:36');
/*!40000 ALTER TABLE `siskamling_incident` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `siskamling_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `siskamling_schedule` (
  `id_siskamling_schedule` char(36) NOT NULL DEFAULT uuid(),
  `id_wilayah` char(36) NOT NULL,
  `id_petugas_citizen` char(36) NOT NULL,
  `shift` enum('PAGI','SORE','MALAM') NOT NULL,
  `tanggal_jadwal` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_siskamling_schedule`),
  KEY `fk_shift_wilayah` (`id_wilayah`),
  KEY `fk_shift_petugas` (`id_petugas_citizen`),
  KEY `idx_shift_tanggal` (`tanggal_jadwal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `siskamling_schedule` WRITE;
/*!40000 ALTER TABLE `siskamling_schedule` DISABLE KEYS */;
INSERT INTO `siskamling_schedule` VALUES ('SKJ-001','RT01','CIT-001','MALAM','2026-08-17','2026-08-17 00:04:21'),('SKJ-002','RT02','CIT-006','MALAM','2026-08-18','2026-08-17 00:04:21'),('SKJ-003','RT03','CIT-008','MALAM','2026-08-19','2026-08-17 00:04:21');
/*!40000 ALTER TABLE `siskamling_schedule` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_role` (
  `id_user_role` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `id_role` char(36) NOT NULL,
  `id_wilayah` char(36) NOT NULL,
  `periode_mulai` date DEFAULT NULL,
  `periode_selesai` date DEFAULT NULL,
  `status` enum('ACTIVE','ENDED','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `assigned_by` char(36) DEFAULT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_user_role`),
  UNIQUE KEY `uq_user_role_wilayah_active` (`id_users`,`id_role`,`id_wilayah`,`status`),
  KEY `fk_userrole_role` (`id_role`),
  KEY `fk_userrole_assigner` (`assigned_by`),
  KEY `idx_userrole_user` (`id_users`),
  KEY `idx_userrole_wilayah` (`id_wilayah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES ('659580ba-9c5b-11f1-b422-b8fcc4e11de9','USR-SEK','ROLE-SEKRETARIS','RT01',NULL,NULL,'ACTIVE',NULL,'2026-08-20 06:12:58'),('f7c9d8ce-9c57-11f1-b422-b8fcc4e11de9','USR-CLN','ROLE-WARGA','RT01',NULL,NULL,'ACTIVE',NULL,'2026-08-20 06:12:58'),('UR-001','USR-001','ROLE-ADMIN','KEL01','2026-01-01',NULL,'ACTIVE',NULL,'2026-08-17 00:02:29'),('UR-002','USR-002','ROLE-RT','RT01','2026-01-01',NULL,'ACTIVE','USR-001','2026-08-17 00:02:29'),('UR-003','USR-003','ROLE-RW','RW01','2026-01-01',NULL,'ACTIVE','USR-001','2026-08-17 00:02:29'),('UR-004','USR-004','ROLE-DUKUH','KEL01','2026-01-01',NULL,'ACTIVE',NULL,'2026-08-16 18:57:27'),('UR-005','USR-005','ROLE-WARGA','RT01',NULL,NULL,'ACTIVE','USR-001','2026-08-19 12:09:06'),('UR-006','USR-006','ROLE-WARGA','RT01',NULL,NULL,'ACTIVE','USR-001','2026-08-19 12:09:06'),('UR-007','USR-007','ROLE-WARGA','RT01',NULL,NULL,'ACTIVE','USR-001','2026-08-19 12:09:06'),('UR-008','USR-008','ROLE-WARGA','RT02',NULL,NULL,'ACTIVE','USR-001','2026-08-19 12:09:06');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `user_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_session` (
  `id_user_session` char(36) NOT NULL DEFAULT uuid(),
  `id_users` char(36) NOT NULL,
  `refresh_token_hash` varchar(255) NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id_user_session`),
  KEY `idx_session_user` (`id_users`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_session` WRITE;
/*!40000 ALTER TABLE `user_session` DISABLE KEYS */;
INSERT INTO `user_session` VALUES ('SES-001','USR-001','refresh-token-dummy-admin','Chrome Windows 11','127.0.0.1',1,'2026-08-17 00:05:37','2026-12-31 23:59:59'),('SES-002','USR-002','refresh-token-dummy-budi','Chrome Windows 11','127.0.0.1',1,'2026-08-17 00:05:37','2026-12-31 23:59:59');
/*!40000 ALTER TABLE `user_session` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_users`),
  UNIQUE KEY `no_hp` (`no_hp`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telegram_chat_id` (`telegram_chat_id`),
  KEY `idx_user_status` (`status`),
  KEY `idx_user_citizen` (`id_citizen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('USR-001','Administrator','admin@sukamaju.test','081200000001','$2y$12$8EWBM.xkEec0spa/ObO4f.elW78Phdum/EcCHOBrsSF74i1O24gjC',NULL,NULL,'EMAIL','ACTIVE','CIT-001','2026-08-20 05:00:43','2026-08-17 00:02:21','2026-08-20 05:00:43'),('USR-002','Budi Santoso','budi@example.com','081234567801','$2y$12$QKKYGgC6XJ/fYEiBZbHcremoLJm7KE.AlHVDd861ZDKYrQ4RA7eYa','123456789','2026-08-17 00:02:21','EMAIL','ACTIVE','CIT-001','2026-08-20 06:13:56','2026-08-17 00:02:21','2026-08-20 06:13:56'),('USR-003','Rudi Hartono','rudi@example.com','081234567804','$2y$12$4wCOLKFZOThiDvD/O9XxXOR6vorsaCg4BzNPbg2RPLL03GcsIXiWy',NULL,NULL,'EMAIL','ACTIVE','CIT-004','2026-08-20 05:57:28','2026-08-17 00:02:21','2026-08-20 05:57:28'),('USR-004','Pak Dukuh Sukamaju','dukuh@sukamaju.test','081200000004','$2y$12$1tD7oLbiPi2gpgqpI.BkceaCH3MKP2as0QB7JLKJPXn/QDfxBYJT.',NULL,NULL,'WHATSAPP_OTP','ACTIVE','CIT-001','2026-08-19 06:28:10','2026-08-16 18:57:13','2026-08-19 06:28:10'),('USR-005','Siti Aminah','siti@example.com','081234567002','$2y$12$uzoBb//q7w47FwK6nuUsd.F25A2kZCZDb7H2YdmJc.IaFCseD8Hi2',NULL,NULL,'EMAIL','ACTIVE','CIT-002','2026-08-20 06:13:55','2026-08-19 12:09:06','2026-08-20 06:13:55'),('USR-006','Andi Santoso','andi@example.com','081234567003','$2y$12$8lvEsMGYKNYxVky9cfGsje9JHfAg.RU6MHbpTPw/mVu2xvz2K.St2',NULL,NULL,'EMAIL','ACTIVE','CIT-001','2026-08-20 05:16:50','2026-08-19 12:09:06','2026-08-20 05:16:50'),('USR-007','Maria Hartono','maria@example.com','081234567004','$2y$12$w8rqLDFUnvjMJOmEFpKF6e/1m4QHPZK9avfcvZnhCRrFvjn6AVpqS',NULL,NULL,'EMAIL','ACTIVE','CIT-005','2026-08-20 05:16:51','2026-08-19 12:09:06','2026-08-20 05:16:51'),('USR-008','Dedi Pratama','dedi@example.com','081234567005','$2y$10$Q6TpTfgba/eRgPkdmbGXNOKb/71rD.3dGjzyIB7R8Ns8LNh5E/HqC',NULL,NULL,'EMAIL','ACTIVE','CIT-006','2026-08-20 05:58:34','2026-08-19 12:09:06','2026-08-20 05:58:34'),('USR-CLN','Eko Purnomo','eko@example.com','081234567099','$2y$12$aSyKMw19yJTeYZc22nEXtuO/KGwpK.kBW6reRME7BuywT8Ui79KOa',NULL,NULL,'EMAIL','ACTIVE','CIT-010','2026-08-20 06:05:09','2026-08-20 05:28:25','2026-08-20 06:05:09'),('USR-SEK','Sari Wulandari','sekretaris@example.com','081234567088','$2y$12$sBt08uGjzesba33cYBy91OoyiHtkM7oKOrlQ5A4jjhsP1/k47Gasu',NULL,NULL,'EMAIL','ACTIVE','CIT-011','2026-08-20 06:13:55','2026-08-20 05:52:58','2026-08-20 06:13:55');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `wilayah`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wilayah` (
  `id_wilayah` char(36) NOT NULL DEFAULT uuid(),
  `nama_wilayah` varchar(100) NOT NULL,
  `tipe` enum('PROVINSI','KABUPATEN','KECAMATAN','KELURAHAN','RW','RT') NOT NULL,
  `kode_wilayah` varchar(20) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_wilayah`),
  UNIQUE KEY `uq_wilayah_kode_parent` (`kode_wilayah`,`parent_id`),
  KEY `idx_wilayah_parent` (`parent_id`),
  KEY `idx_wilayah_tipe` (`tipe`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `wilayah` WRITE;
/*!40000 ALTER TABLE `wilayah` DISABLE KEYS */;
INSERT INTO `wilayah` VALUES ('KEL01','Kelurahan Sukamaju','KELURAHAN','KEL01',NULL,'2026-08-16 23:56:44','2026-08-16 23:56:44'),('RT01','RT 01','RT','RT01','RW01','2026-08-16 23:56:44','2026-08-16 23:56:44'),('RT02','RT 02','RT','RT02','RW01','2026-08-16 23:56:44','2026-08-16 23:56:44'),('RT03','RT 03','RT','RT03','RW02','2026-08-16 23:56:44','2026-08-16 23:56:44'),('RT04','RT 04','RT','RT04','RW02','2026-08-19 12:23:46','2026-08-19 12:23:46'),('RW01','RW 01','RW','RW01','KEL01','2026-08-16 23:56:44','2026-08-16 23:56:44'),('RW02','RW 02','RW','RW02','KEL01','2026-08-16 23:56:44','2026-08-16 23:56:44');
/*!40000 ALTER TABLE `wilayah` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

