<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
            // FK constraints may have collation mismatch, skipping for now
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_purchase');
    }
};