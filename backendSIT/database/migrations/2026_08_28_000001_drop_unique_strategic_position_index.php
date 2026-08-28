<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organization_member', function (Blueprint $table) {
            $table->dropIndex('unique_strategic_position_per_period');
        });
    }

    public function down(): void
    {
        Schema::table('organization_member', function (Blueprint $table) {
            $table->unique(['jabatan', 'id_wilayah', 'periode_mulai', 'status_aktif'], 'unique_strategic_position_per_period');
        });
    }
};