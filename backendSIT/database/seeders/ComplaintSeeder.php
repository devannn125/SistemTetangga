<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('complaint')) {
            Schema::create('complaint', function ($table) {
                $table->char('id_complaint', 36)->primary();
                $table->string('nomor_tiket', 32)->unique();
                $table->char('id_pengirim_user', 36);
                $table->string('judul', 100);
                $table->enum('kategori', ['INFRASTRUKTUR', 'KEAMANAN', 'KEBERSIHAN', 'SOSIAL', 'LAINNYA']);
                $table->text('deskripsi');
                $table->string('lokasi')->nullable();
                $table->enum('urgensi', ['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT'])->default('SEDANG');
                $table->enum('status', ['PENDING', 'DIPROSES', 'ESKALASI', 'SELESAI', 'DITOLAK'])->default('PENDING');
                $table->unsignedTinyInteger('rating')->nullable();
                $table->timestamps();
            });
        }

        if (DB::table('complaint')->count() === 0) {
            DB::table('complaint')->insert([
                [
                    'id_complaint' => 'CMP-001',
                    'nomor_tiket' => '#ADU-2026-001',
                    'id_pengirim_user' => 'USR-001',
                    'judul' => 'Perbaikan Jalan Akses Utama RT 01',
                    'kategori' => 'INFRASTRUKTUR',
                    'deskripsi' => 'Perlu penambalan aspal jalan utama penghubung antar RW.',
                    'lokasi' => 'Jl. Merdeka No. 12',
                    'urgensi' => 'TINGGI',
                    'status' => 'ESKALASI',
                    'rating' => null,
                    'created_at' => now()->subDays(5),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'id_complaint' => 'CMP-002',
                    'nomor_tiket' => '#ADU-2026-002',
                    'id_pengirim_user' => 'USR-002',
                    'judul' => 'Penerangan Jalan Gang Mawar Padam',
                    'kategori' => 'KEAMANAN',
                    'deskripsi' => 'Lampu PJU padam di 3 titik gang utama.',
                    'lokasi' => 'Gang Mawar RT 02',
                    'urgensi' => 'SEDANG',
                    'status' => 'DIPROSES',
                    'rating' => null,
                    'created_at' => now()->subDays(2),
                    'updated_at' => now(),
                ],
                [
                    'id_complaint' => 'CMP-003',
                    'nomor_tiket' => '#ADU-2026-003',
                    'id_pengirim_user' => 'USR-003',
                    'judul' => 'Pengangkutan Sampah TPS Liar',
                    'kategori' => 'KEBERSIHAN',
                    'deskripsi' => 'Pembersihan tumpukan sampah di perbatasan RW 01 dan RW 02.',
                    'lokasi' => 'Jl. Kenanga Timur',
                    'urgensi' => 'SEDANG',
                    'status' => 'SELESAI',
                    'rating' => 5,
                    'created_at' => now()->subDays(10),
                    'updated_at' => now()->subDays(2),
                ],
            ]);
        }
    }
}
