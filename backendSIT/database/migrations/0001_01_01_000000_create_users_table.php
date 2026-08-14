<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150);
            $table->string('email', 150)->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('no_hp', 20)->unique();
            $table->string('password')->nullable();
            $table->string('telegram_chat_id', 50)->nullable()->unique();
            $table->dateTime('telegram_linked_at')->nullable();
            $table->enum('auth_provider', ['EMAIL', 'GOOGLE', 'WHATSAPP_OTP'])
                  ->default('WHATSAPP_OTP');
            $table->enum('status', ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])
                  ->default('PENDING_VERIFICATION');
            $table->uuid('citizen_id')->nullable();
            $table->dateTime('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps(); // created_at & updated_at (DATETIME di MySQL utk kolom Laravel timestamps() default-nya TIMESTAMP — lihat catatan poin 5 di bawah)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};