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
            // FK constraints skipped for SQLite test compatibility
        });

        // inventory_purchase is created by 2026_08_20_080257_create_inventory_purchase_table
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};