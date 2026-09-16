<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_umkms', function (Blueprint $table) {
            $table->id('id_umkm');
            $table->string('nama_usaha');
            $table->text('deskripsi')->nullable();
            $table->string('nama_pemilik')->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_umkms');
    }
};
