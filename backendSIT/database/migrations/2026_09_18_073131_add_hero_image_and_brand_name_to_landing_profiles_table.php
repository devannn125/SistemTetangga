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
        Schema::table('landing_profiles', function (Blueprint $table) {
            $table->string('hero_image_path')->nullable()->after('hero_subtitle');
            $table->string('brand_name')->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_profiles', function (Blueprint $table) {
            $table->dropColumn(['hero_image_path', 'brand_name']);
        });
    }
};
