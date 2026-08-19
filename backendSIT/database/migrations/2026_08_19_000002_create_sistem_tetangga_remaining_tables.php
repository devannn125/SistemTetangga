<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('house_photo', function (Blueprint $table) {
            $table->char('id_house_photo', 36)->primary();
            $table->char('id_house', 36);
            $table->string('file_url', 500);
            $table->dateTime('uploaded_at')->useCurrent();
            $table->foreign('id_house')->references('id_house')->on('house')->cascadeOnDelete();
        });

        Schema::create('kos_room', function (Blueprint $table) {
            $table->char('id_kos_room', 36)->primary();
            $table->char('id_house', 36);
            $table->string('nomor_kamar', 20);
            $table->enum('status_okupansi', ['KOSONG', 'TERISI'])->default('KOSONG');
            $table->char('id_penghuni_citizen', 36)->nullable();
            $table->foreign('id_house')->references('id_house')->on('house')->cascadeOnDelete();
            $table->foreign('id_penghuni_citizen')->references('id_citizen')->on('citizen')->nullOnDelete();
        });

        Schema::create('guest', function (Blueprint $table) {
            $table->char('id_guest', 36)->primary();
            $table->string('nama', 150);
            $table->string('nik', 32)->nullable();
            $table->string('asal', 150)->nullable();
            $table->char('id_house', 36);
            $table->string('foto_identitas_url', 500)->nullable();
            $table->dateTime('jam_masuk');
            $table->dateTime('jam_keluar')->nullable();
            $table->smallInteger('lama_tinggal_hari')->nullable();
            $table->enum('status', ['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'CHECK_OUT'])->default('MENUNGGU');
            $table->char('approved_by', 36)->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
            $table->foreign('id_house')->references('id_house')->on('house')->restrictOnDelete();
        });

        Schema::create('digital_signature', function (Blueprint $table) {
            $table->char('id_digital_signature', 36)->primary();
            $table->char('id_letter_request', 36);
            $table->string('document_hash', 255);
            $table->enum('status', ['MENUNGGU', 'DITANDATANGANI', 'GAGAL'])->default('MENUNGGU');
            $table->string('id_privy_transaction', 100)->nullable();
            $table->string('qr_code_url', 500)->nullable();
            $table->string('signed_document_url', 500)->nullable();
            $table->dateTime('signed_at')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_letter_request')->references('id_letter_request')->on('letter_request')->cascadeOnDelete();
        });

        Schema::create('siskamling_schedule', function (Blueprint $table) {
            $table->char('id_siskamling_schedule', 36)->primary();
            $table->char('id_wilayah', 36);
            $table->char('id_petugas_citizen', 36);
            $table->enum('shift', ['PAGI', 'SORE', 'MALAM']);
            $table->date('tanggal_jadwal');
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('id_petugas_citizen')->references('id_citizen')->on('citizen')->restrictOnDelete();
        });

        Schema::create('siskamling_checkin', function (Blueprint $table) {
            $table->char('id_siskamling_checkin', 36)->primary();
            $table->char('id_siskamling_schedule', 36);
            $table->dateTime('checkin_time');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('foto_url', 500)->nullable();
            $table->foreign('id_siskamling_schedule')->references('id_siskamling_schedule')->on('siskamling_schedule')->cascadeOnDelete();
        });

        Schema::create('siskamling_incident', function (Blueprint $table) {
            $table->char('id_siskamling_incident', 36)->primary();
            $table->char('id_wilayah', 36);
            $table->char('dilaporkan_oleh', 36);
            $table->char('id_jenis_kejadian', 36)->nullable();
            $table->string('lokasi', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('foto_url', 500)->nullable();
            $table->boolean('is_panic')->default(false);
            $table->enum('status', ['BARU', 'DITINDAKLANJUTI', 'SELESAI'])->default('BARU');
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('dilaporkan_oleh')->references('id_users')->on('users')->restrictOnDelete();
        });

        Schema::create('organization_member', function (Blueprint $table) {
            $table->char('id_organization_member', 36)->primary();
            $table->char('id_citizen', 36);
            $table->string('jabatan', 100);
            $table->char('id_wilayah', 36);
            $table->date('periode_mulai');
            $table->date('periode_selesai')->nullable();
            $table->string('foto_url', 500)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->foreign('id_citizen')->references('id_citizen')->on('citizen')->restrictOnDelete();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });

        Schema::create('regulation', function (Blueprint $table) {
            $table->char('id_regulation', 36)->primary();
            $table->enum('kategori', ['WARGA_TETAP', 'PENGHUNI_TIDAK_TETAP', 'LINGKUNGAN', 'TAMU']);
            $table->string('judul', 200);
            $table->text('isi');
            $table->string('lampiran_url', 500)->nullable();
            $table->char('id_wilayah', 36);
            $table->smallInteger('versi')->default(1);
            $table->date('tanggal_berlaku');
            $table->enum('status', ['AKTIF', 'NONAKTIF'])->default('AKTIF');
            $table->char('created_by', 36);
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('created_by')->references('id_users')->on('users')->restrictOnDelete();
        });

        Schema::create('announcement_read_status', function (Blueprint $table) {
            $table->char('id_announcement_read_status', 36);
            $table->char('id_users', 36);
            $table->dateTime('read_at')->useCurrent();
            $table->primary(['id_announcement_read_status', 'id_users']);
            $table->foreign('id_announcement_read_status')->references('id_announcement')->on('announcement')->cascadeOnDelete();
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('notification_log', function (Blueprint $table) {
            $table->char('id_notification_log', 36)->primary();
            $table->char('id_users', 36);
            $table->string('jenis', 50);
            $table->enum('channel', ['TELEGRAM', 'WHATSAPP_OTP', 'EMAIL'])->default('TELEGRAM');
            $table->text('isi_pesan');
            $table->enum('status_kirim', ['PENDING', 'TERKIRIM', 'GAGAL'])->default('PENDING');
            $table->tinyInteger('retry_count')->default(0);
            $table->string('related_entity_type', 50)->nullable();
            $table->char('id_related_entity', 36)->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('notification_subscription', function (Blueprint $table) {
            $table->char('id_users', 36);
            $table->string('kategori', 50);
            $table->boolean('is_subscribed')->default(true);
            $table->primary(['id_users', 'kategori']);
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('module', function (Blueprint $table) {
            $table->char('id_module', 36)->primary();
            $table->string('kode_module', 50)->unique();
            $table->string('nama_module', 100);
            $table->tinyInteger('urutan')->default(0);
        });

        Schema::create('permission_action', function (Blueprint $table) {
            $table->tinyIncrements('id_permission_action');
            $table->string('kode_permission', 20);
            $table->string('deskripsi', 150)->nullable();
        });

        Schema::create('role_permission', function (Blueprint $table) {
            $table->char('id_role_permission', 36)->primary();
            $table->char('id_role', 36);
            $table->char('id_module', 36);
            $table->tinyInteger('id_permission_action');
            $table->string('resource_scope', 100)->default('*');
            $table->enum('scope_level', ['OWN', 'RT', 'RW', 'KELURAHAN', 'ALL']);
            $table->unique(['id_role', 'id_module', 'id_permission_action', 'resource_scope'], 'uq_rp_role_module_action_scope');
            $table->foreign('id_role')->references('id_role')->on('role')->cascadeOnDelete();
            $table->foreign('id_module')->references('id_module')->on('module')->cascadeOnDelete();
            $table->foreign('id_permission_action')->references('id_permission_action')->on('permission_action')->cascadeOnDelete();
        });

        Schema::create('permission_override', function (Blueprint $table) {
            $table->char('id_permission_override', 36)->primary();
            $table->char('id_users', 36);
            $table->char('id_module', 36);
            $table->tinyInteger('id_permission_action');
            $table->char('id_wilayah', 36)->nullable();
            $table->boolean('is_granted');
            $table->string('reason', 255)->nullable();
            $table->char('created_by', 36)->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('expires_at')->nullable();
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
            $table->foreign('id_module')->references('id_module')->on('module')->cascadeOnDelete();
            $table->foreign('id_permission_action')->references('id_permission_action')->on('permission_action')->cascadeOnDelete();
        });

        Schema::create('user_session', function (Blueprint $table) {
            $table->char('id_user_session', 36)->primary();
            $table->char('id_users', 36);
            $table->string('refresh_token_hash', 255);
            $table->string('device_info', 255)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('expires_at');
            $table->foreign('id_users')->references('id_users')->on('users')->cascadeOnDelete();
        });

        Schema::create('audit_log', function (Blueprint $table) {
            $table->bigIncrements('id_action_log');
            $table->char('id_users', 36)->nullable();
            $table->char('id_module', 36)->nullable();
            $table->string('id_permission_action', 50);
            $table->string('entity_type', 50)->nullable();
            $table->char('entity_id', 36)->nullable();
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->dateTime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('user_session');
        Schema::dropIfExists('permission_override');
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('permission_action');
        Schema::dropIfExists('module');
        Schema::dropIfExists('notification_subscription');
        Schema::dropIfExists('notification_log');
        Schema::dropIfExists('announcement_read_status');
        Schema::dropIfExists('regulation');
        Schema::dropIfExists('organization_member');
        Schema::dropIfExists('siskamling_incident');
        Schema::dropIfExists('siskamling_checkin');
        Schema::dropIfExists('siskamling_schedule');
        Schema::dropIfExists('digital_signature');
        Schema::dropIfExists('guest');
        Schema::dropIfExists('kos_room');
        Schema::dropIfExists('house_photo');
    }
};
