<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_endpoint_returns_frontend_shape(): void
    {
        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'user',
                'area',
                'navigation',
                'summaryCards',
                'financeCards',
                'cashflow',
                'complaintsByCategory',
                'activities',
                'quickActions',
            ]);
    }

    public function test_citizen_can_be_created_through_request_and_resource_layers(): void
    {
        $wilayahId = (string) Str::uuid();

        DB::table('wilayah')->insert([
            'id_wilayah' => $wilayahId,
            'nama_wilayah' => 'RT 005',
            'tipe' => 'RT',
            'kode_wilayah' => 'RT005',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->postJson('/api/citizens', [
            'nik' => '3374010101010001',
            'nama_lengkap' => 'Budi Santoso',
            'jenis_kelamin' => 'L',
            'status_warga' => 'TETAP',
            'kewarganegaraan' => 'WNI',
            'id_wilayah' => $wilayahId,
            'status_hidup' => 'HIDUP',
            'status_aktif' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.nama_lengkap', 'Budi Santoso')
            ->assertJsonPath('data.status_aktif', true);
    }
}
