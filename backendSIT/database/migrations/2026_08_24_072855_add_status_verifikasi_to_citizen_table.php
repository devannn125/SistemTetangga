<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('citizen', function (Blueprint $table) {
            $table->enum('status_verifikasi', ['PENDING', 'VERIFIED_RW', 'APPROVED_DUKUH', 'REJECTED'])->default('PENDING')->after('status_warga');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citizen', function (Blueprint $table) {
            $table->dropColumn('status_verifikasi');
        });
    }
};
