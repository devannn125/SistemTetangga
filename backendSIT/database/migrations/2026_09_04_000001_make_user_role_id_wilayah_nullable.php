<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK if exists (sql dump punya FK, migration awal nullable intent)
        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->dropForeign(['id_wilayah']);
            });
        } catch (\Throwable $e) {
        }

        // Drop unique yang ada di dump (tidak ada di migration awal)
        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->dropUnique('uq_user_role_wilayah_active');
            });
        } catch (\Throwable $e) {
        }

        // Jadikan nullable — sesuai intent migration 2026_08_17_000001 (nullable)
        DB::statement('ALTER TABLE `user_role` MODIFY `id_wilayah` CHAR(36) NULL');

        Schema::table('user_role', function (Blueprint $table) {
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->nullOnDelete();
        });

        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->unique(['id_users', 'id_role', 'id_wilayah', 'status'], 'uq_user_role_wilayah_active');
            });
        } catch (\Throwable $e) {
        }
    }

    public function down(): void
    {
        // Fail-safe: isi null dulu biar bisa balik NOT NULL
        $nullExists = DB::table('user_role')->whereNull('id_wilayah')->exists();
        if ($nullExists) {
            // Biarkan null tetap — down tidak dipaksa jika sudah ada data bootstrap WARGA null
            // Hapus FK/unique lalu biarkan nullable tetap
            return;
        }

        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->dropForeign(['id_wilayah']);
            });
        } catch (\Throwable $e) {
        }
        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->dropUnique('uq_user_role_wilayah_active');
            });
        } catch (\Throwable $e) {
        }

        DB::statement('ALTER TABLE `user_role` MODIFY `id_wilayah` CHAR(36) NOT NULL');

        Schema::table('user_role', function (Blueprint $table) {
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->cascadeOnDelete();
        });
        try {
            Schema::table('user_role', function (Blueprint $table) {
                $table->unique(['id_users', 'id_role', 'id_wilayah', 'status'], 'uq_user_role_wilayah_active');
            });
        } catch (\Throwable $e) {
        }
    }
};
