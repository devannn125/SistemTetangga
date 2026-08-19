<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wilayah', function (Blueprint $table) {
            $table->char('id_wilayah', 36)->primary();
            $table->string('nama_wilayah', 100);
            $table->enum('tipe', ['PROVINSI', 'KABUPATEN', 'KECAMATAN', 'KELURAHAN', 'RW', 'RT']);
            $table->string('kode_wilayah', 20)->unique();
            $table->char('parent_id', 36)->nullable();
            $table->timestamps();
            $table->foreign('parent_id')->references('id_wilayah')->on('wilayah')->cascadeOnDelete();
        });

        Schema::create('master_data', function (Blueprint $table) {
            $table->char('id_master', 36)->primary();
            $table->enum('tipe', ['AGAMA', 'PENDIDIKAN', 'PROFESI', 'KATEGORI_BANSOS', 'KATEGORI_KOS', 'JENIS_KEJADIAN_SISKAMLING']);
            $table->string('kode_master', 50);
            $table->string('nama_master', 100);
            $table->smallInteger('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unique(['tipe', 'kode_master']);
        });

        Schema::create('family', function (Blueprint $table) {
            $table->char('id_family', 36)->primary();
            $table->string('no_kk', 32)->unique();
            $table->char('id_kepala_keluarga', 36)->nullable();
            $table->char('id_wilayah', 36);
            $table->enum('status', ['ACTIVE', 'PINDAH', 'DIHAPUS'])->default('ACTIVE');
            $table->timestamps();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });

        Schema::create('citizen', function (Blueprint $table) {
            $table->char('id_citizen', 36)->primary();
            $table->string('nik', 32)->unique();
            $table->string('nama_lengkap', 150);
            $table->char('id_family', 36)->nullable();
            $table->enum('hubungan_keluarga', ['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'LAINNYA'])->nullable();
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->char('id_agama', 36)->nullable();
            $table->enum('status_nikah', ['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'])->nullable();
            $table->char('id_pendidikan', 36)->nullable();
            $table->char('id_profesi', 36)->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('status_warga', ['TETAP', 'TIDAK_TETAP'])->default('TETAP');
            $table->enum('kewarganegaraan', ['WNI', 'WNA'])->default('WNI');
            $table->enum('status_ekonomi', ['MAMPU', 'KURANG_MAMPU'])->nullable();
            $table->boolean('penerima_bansos')->default(false);
            $table->date('tanggal_masuk_rt')->nullable();
            $table->date('tanggal_keluar_rt')->nullable();
            $table->char('id_wilayah', 36);
            $table->boolean('alamat_kk_luar_rt')->default(false);
            $table->boolean('berdomisili_luar_rt')->default(false);
            $table->enum('status_hidup', ['HIDUP', 'MENINGGAL'])->default('HIDUP');
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
            $table->foreign('id_family')->references('id_family')->on('family')->nullOnDelete();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });

        Schema::table('family', function (Blueprint $table) {
            $table->foreign('id_kepala_keluarga')->references('id_citizen')->on('citizen')->nullOnDelete();
        });

        Schema::create('citizen_history', function (Blueprint $table) {
            $table->bigIncrements('id_citizen_history');
            $table->char('id_citizen', 36);
            $table->string('field_changed', 50);
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();
            $table->char('changed_by', 36)->nullable();
            $table->dateTime('changed_at')->useCurrent();
            $table->foreign('id_citizen')->references('id_citizen')->on('citizen')->cascadeOnDelete();
        });

        Schema::create('house', function (Blueprint $table) {
            $table->char('id_house', 36)->primary();
            $table->enum('tipe', ['NON_KOS', 'KOS']);
            $table->string('alamat');
            $table->char('id_wilayah', 36);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->char('id_pemilik_citizen', 36)->nullable();
            $table->enum('status_kepemilikan', ['MILIK_SENDIRI', 'KONTRAK'])->nullable();
            $table->char('id_kategori_kos', 36)->nullable();
            $table->smallInteger('jumlah_kamar')->nullable();
            $table->smallInteger('jumlah_penghuni')->default(0);
            $table->enum('status_pajak', ['LUNAS', 'BELUM_LUNAS'])->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('id_pemilik_citizen')->references('id_citizen')->on('citizen')->nullOnDelete();
        });

        Schema::create('letter_request', function (Blueprint $table) {
            $table->char('id_letter_request', 36)->primary();
            $table->string('nomor_surat', 50)->nullable()->unique();
            $table->enum('jenis_surat', ['DOMISILI', 'USAHA']);
            $table->char('id_pemohon_citizen', 36);
            $table->string('keperluan')->nullable();
            $table->string('nama_usaha', 150)->nullable();
            $table->string('jenis_usaha', 150)->nullable();
            $table->string('alamat_usaha')->nullable();
            $table->decimal('lama_usaha_tahun', 4, 1)->nullable();
            $table->enum('status', ['DIAJUKAN', 'DIVERIFIKASI', 'DISETUJUI', 'DITANDATANGANI', 'TERBIT', 'DITOLAK'])->default('DIAJUKAN');
            $table->char('verified_by', 36)->nullable();
            $table->dateTime('verified_at')->nullable();
            $table->char('approved_by', 36)->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->string('document_url', 500)->nullable();
            $table->date('tanggal_terbit')->nullable();
            $table->char('id_wilayah', 36);
            $table->timestamps();
            $table->foreign('id_pemohon_citizen')->references('id_citizen')->on('citizen')->restrictOnDelete();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });

        Schema::create('announcement', function (Blueprint $table) {
            $table->char('id_announcement', 36)->primary();
            $table->string('judul', 200);
            $table->text('isi');
            $table->enum('kategori', ['KESEHATAN', 'KEAMANAN', 'INFRASTRUKTUR', 'SOSIAL', 'LAINNYA']);
            $table->char('id_wilayah', 36);
            $table->enum('target', ['SEMUA_WARGA', 'PENGURUS_SAJA', 'WARGA_TERTENTU'])->default('SEMUA_WARGA');
            $table->string('lampiran_url', 500)->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->enum('status_approval', ['DRAFT', 'RT', 'RW', 'DUKUH_DISETUJUI'])->default('DRAFT');
            $table->char('created_by', 36);
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });

        Schema::create('feedback', function (Blueprint $table) {
            $table->char('id_feedback', 36)->primary();
            $table->char('id_pengirim_user', 36);
            $table->text('isi_pesan');
            $table->enum('kategori', ['MASUKAN', 'KELUHAN', 'APRESIASI', 'LAINNYA']);
            $table->boolean('is_anonim')->default(false);
            $table->enum('status', ['BARU', 'DIBACA', 'DITINDAKLANJUTI'])->default('BARU');
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_pengirim_user')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('keuangan_transaksi', function (Blueprint $table) {
            $table->char('id_keuangan_transaksi', 36)->primary();
            $table->char('id_wilayah', 36);
            $table->enum('tipe', ['PEMASUKAN', 'PENGELUARAN']);
            $table->string('kategori', 100)->nullable();
            $table->decimal('jumlah', 15, 2);
            $table->string('deskripsi')->nullable();
            $table->string('bukti_url', 500)->nullable();
            $table->date('tanggal');
            $table->char('dicatat_oleh', 36);
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('dicatat_oleh')->references('id_users')->on('users')->restrictOnDelete();
        });

        Schema::create('iuran_tagihan', function (Blueprint $table) {
            $table->char('id_iuran_tagihan', 36)->primary();
            $table->char('id_family', 36);
            $table->char('periode', 7);
            $table->decimal('jumlah_tagihan', 12, 2);
            $table->enum('status', ['LUNAS', 'BELUM_BAYAR', 'SEBAGIAN'])->default('BELUM_BAYAR');
            $table->date('jatuh_tempo');
            $table->char('dikonfirmasi_oleh', 36)->nullable();
            $table->dateTime('dikonfirmasi_at')->nullable();
            $table->foreign('id_family')->references('id_family')->on('family')->cascadeOnDelete();
            $table->unique(['id_family', 'periode']);
        });

        Schema::create('complaint', function (Blueprint $table) {
            $table->char('id_complaint', 36)->primary();
            $table->string('nomor_tiket', 32)->unique();
            $table->char('id_pengirim_user', 36);
            $table->string('judul', 100);
            $table->enum('kategori', ['INFRASTRUKTUR', 'KEAMANAN', 'KEBERSIHAN', 'SOSIAL', 'LAINNYA']);
            $table->text('deskripsi');
            $table->string('lokasi')->nullable();
            $table->enum('urgensi', ['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT'])->default('SEDANG');
            $table->enum('status', ['PENDING', 'DIPROSES', 'ESKALASI', 'SELESAI', 'DITOLAK'])->default('PENDING');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->timestamps();
            $table->foreign('id_pengirim_user')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('role', function (Blueprint $table) {
            $table->char('id_role', 36)->primary();
            $table->string('kode', 50);
            $table->string('nama_role', 100);
            $table->tinyInteger('level');
            $table->boolean('is_strategic')->default(false);
            $table->string('deskripsi', 255)->nullable();
        });

        Schema::create('user_role', function (Blueprint $table) {
            $table->char('id_user_role', 36)->primary();
            $table->char('id_users', 36);
            $table->char('id_role', 36);
            $table->char('id_wilayah', 36)->nullable();
            $table->date('periode_mulai')->nullable();
            $table->date('periode_selesai')->nullable();
            $table->enum('status', ['ACTIVE', 'ENDED', 'REVOKED'])->default('ACTIVE');
            $table->char('assigned_by', 36)->nullable();
            $table->dateTime('assigned_at')->useCurrent();
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
            $table->foreign('id_role')->references('id_role')->on('role')->cascadeOnDelete();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('family', function (Blueprint $table) {
            $table->dropForeign(['id_kepala_keluarga']);
        });

        Schema::table('citizen', function (Blueprint $table) {
            $table->dropForeign(['id_family']);
        });

        Schema::dropIfExists('user_role');
        Schema::dropIfExists('role');
        Schema::dropIfExists('complaint');
        Schema::dropIfExists('iuran_tagihan');
        Schema::dropIfExists('keuangan_transaksi');
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('announcement');
        Schema::dropIfExists('letter_request');
        Schema::dropIfExists('house');
        Schema::dropIfExists('citizen_history');
        Schema::dropIfExists('citizen');
        Schema::dropIfExists('family');
        Schema::dropIfExists('master_data');
        Schema::dropIfExists('wilayah');
    }
};
