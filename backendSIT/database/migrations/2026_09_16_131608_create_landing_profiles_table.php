<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title')->nullable();
            $table->string('hero_subtitle')->nullable();
            $table->text('visi')->nullable();
            $table->text('misi')->nullable(); // Can be JSON or text
            $table->text('sejarah')->nullable();
            $table->string('kontak_email')->nullable();
            $table->string('kontak_hp')->nullable();
            $table->text('kontak_alamat')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_profiles');
    }
};
