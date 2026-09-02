<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('citizen', function (Blueprint $table) {
            $table->enum('calon_jabatan', ['RW', 'RT'])->nullable()->after('status_verifikasi');
        });
    }

    public function down(): void
    {
        Schema::table('citizen', function (Blueprint $table) {
            $table->dropColumn('calon_jabatan');
        });
    }
};
