<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posyandu_schedule', function (Blueprint $table) {
            $table->charset('utf8mb4');
            $table->collation('utf8mb4_general_ci');
            $table->char('id_posyandu_schedule', 36)->primary();
            $table->char('id_wilayah', 36);
            $table->date('tanggal_jadwal');
            $table->time('jam_mulai')->nullable();
            $table->string('nama_kegiatan', 150);
            $table->string('lokasi', 255)->nullable();
            $table->text('keterangan')->nullable();
            $table->string('penyelenggara', 150)->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posyandu_schedule');
    }
};
