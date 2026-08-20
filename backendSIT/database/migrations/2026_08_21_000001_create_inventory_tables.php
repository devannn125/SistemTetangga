<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->char('id_inventory', 36)->primary();
            $table->string('nama_barang', 150);
            $table->string('kategori', 100)->nullable();
            $table->unsignedInteger('jumlah');
            $table->string('satuan', 50)->nullable();
            $table->enum('kondisi', ['BAIK', 'RUSAK', 'DIPERBAIKI'])->nullable();
            $table->string('lokasi', 150)->nullable();
            $table->char('id_wilayah', 36);
            $table->boolean('status_aktif')->default(true);
            $table->char('created_by', 36)->nullable();
            $table->timestamps();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('created_by')->references('id_users')->on('users')->restrictOnDelete();
        });

        Schema::create('inventory_purchase', function (Blueprint $table) {
            $table->char('id_inventory_purchase', 36)->primary();
            $table->string('nama_barang', 150);
            $table->unsignedInteger('jumlah');
            $table->string('satuan', 50)->nullable();
            $table->decimal('perkiraan_biaya', 15, 2)->nullable();
            $table->text('alasan')->nullable();
            $table->enum('status', ['DIAJUKAN', 'DISETUJUI', 'DITOLAK'])->default('DIAJUKAN');
            $table->char('id_wilayah', 36);
            $table->char('diajukan_oleh', 36);
            $table->char('disetujui_oleh', 36)->nullable();
            $table->dateTime('disetujui_at')->nullable();
            $table->timestamps();
            $table->foreign('id_wilayah')->references('id_wilayah')->on('wilayah')->restrictOnDelete();
            $table->foreign('diajukan_oleh')->references('id_users')->on('users')->restrictOnDelete();
            $table->foreign('disetujui_oleh')->references('id_users')->on('users')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_purchase');
        Schema::dropIfExists('inventory');
    }
};