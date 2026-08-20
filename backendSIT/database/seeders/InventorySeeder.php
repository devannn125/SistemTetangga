<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\InventoryPurchase;
use App\Models\Role;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seed master inventory items and purchase workflow (connected).
 * Idempotent — safe to re-run.
 */
class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // Get RT wilayah
        $rt = Wilayah::where('kode_wilayah', 'RT01')->first();
        if (! $rt) {
            $this->command?->warn('RT01 wilayah not found, skipping inventory seeder');
            return;
        }

        // Ensure Ketua RT user exists (for approvals)
        $rtRole = Role::firstOrCreate(
            ['kode' => 'RT'],
            ['id_role' => 'ROLE-RT', 'nama_role' => 'Ketua RT', 'level' => 4, 'is_strategic' => true, 'deskripsi' => 'Pengurus tingkat RT']
        );

        $ketuaCitizen = \App\Models\Citizen::firstOrCreate(
            ['nik' => '3471000000000024'],
            [
                'nama_lengkap' => 'Budi Santoso',
                'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '1985-03-20',
                'jenis_kelamin' => 'L',
                'status_nikah' => 'KAWIN',
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'status_ekonomi' => 'MAMPU',
                'penerima_bansos' => false,
                'tanggal_masuk_rt' => '2015-01-01',
                'id_wilayah' => $rt->id_wilayah,
                'alamat_kk_luar_rt' => false,
                'berdomisili_luar_rt' => false,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
            ]
        );

        $ketua = User::firstOrCreate(
            ['email' => 'ketua@example.com'],
            [
                'id_users' => 'USR-RT',
                'nama_users' => 'Budi Santoso',
                'no_hp' => '081234567066',
                'password_hash' => Hash::make('password'),
                'auth_provider' => 'EMAIL',
                'status' => 'ACTIVE',
                'id_citizen' => $ketuaCitizen->id_citizen,
            ]
        );
        $ketua->forceFill(['id_citizen' => $ketuaCitizen->id_citizen, 'nama_users' => 'Budi Santoso'])->save();
        DB::table('user_role')->updateOrInsert(
            ['id_users' => $ketua->id_users, 'id_role' => $rtRole->id_role, 'id_wilayah' => $rt->id_wilayah],
            ['status' => 'ACTIVE', 'assigned_at' => now()]
        );

        // Get Sekretaris user (created by CleanWargaSeeder)
        $sekretaris = User::where('email', 'sekretaris@example.com')->first();
        if (! $sekretaris) {
            $this->command?->warn('Sekretaris user not found, skipping inventory seeder');
            return;
        }

        // Get Bendahara user
        $bendahara = User::where('email', 'bendahara@example.com')->first();

        // ============================================================
        // 1. MASTER INVENTORY ITEMS (existing stock)
        // ============================================================
        $masterItems = [
            [
                'id_inventory' => 'INV-001',
                'nama_barang' => 'Tenda Pesta 6x6',
                'kategori' => 'Perlengkapan Acara',
                'jumlah' => 2,
                'satuan' => 'Unit',
                'kondisi' => 'BAIK',
                'lokasi' => 'Gudang Balai RT',
                'id_wilayah' => $rt->id_wilayah,
                'status_aktif' => true,
                'created_by' => $sekretaris->id_users,
            ],
            [
                'id_inventory' => 'INV-002',
                'nama_barang' => 'Kursi Lipat',
                'kategori' => 'Perlengkapan Acara',
                'jumlah' => 50,
                'satuan' => 'Buah',
                'kondisi' => 'BAIK',
                'lokasi' => 'Gudang Balai RT',
                'id_wilayah' => $rt->id_wilayah,
                'status_aktif' => true,
                'created_by' => $sekretaris->id_users,
            ],
            [
                'id_inventory' => 'INV-003',
                'nama_barang' => 'Meja Lipat',
                'kategori' => 'Perlengkapan Acara',
                'jumlah' => 10,
                'satuan' => 'Buah',
                'kondisi' => 'BAIK',
                'lokasi' => 'Gudang Balai RT',
                'id_wilayah' => $rt->id_wilayah,
                'status_aktif' => true,
                'created_by' => $sekretaris->id_users,
            ],
            [
                'id_inventory' => 'INV-004',
                'nama_barang' => 'Sound System',
                'kategori' => 'Elektronik',
                'jumlah' => 1,
                'satuan' => 'Set',
                'kondisi' => 'BAIK',
                'lokasi' => 'Balai RT',
                'id_wilayah' => $rt->id_wilayah,
                'status_aktif' => true,
                'created_by' => $sekretaris->id_users,
            ],
            [
                'id_inventory' => 'INV-005',
                'nama_barang' => 'Genset 5000W',
                'kategori' => 'Elektronik',
                'jumlah' => 1,
                'satuan' => 'Unit',
                'kondisi' => 'BAIK',
                'lokasi' => 'Gudang Balai RT',
                'id_wilayah' => $rt->id_wilayah,
                'status_aktif' => true,
                'created_by' => $sekretaris->id_users,
            ],
        ];

        foreach ($masterItems as $item) {
            Inventory::firstOrCreate(
                ['id_inventory' => $item['id_inventory']],
                $item
            );
        }

        // ============================================================
        // 2. INVENTORY PURCHASES (workflow: Diajukan -> Disetujui/Ditolak)
        // ============================================================
        $purchases = [
            [
                'id_inventory_purchase' => 'INV-PUR-001',
                'nama_barang' => 'Tenda Pesta 4x4',
                'jumlah' => 3,
                'satuan' => 'Unit',
                'perkiraan_biaya' => 4500000,
                'alasan' => 'Tambahan tenda untuk acara 17 Agustus & RT arisan bulanan. Tenda 6x6 hanya 2 unit, tidak cukup untuk acara besar.',
                'status' => 'DISETUJUI',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => $ketua->id_users,
                'disetujui_at' => now()->subDays(5),
            ],
            [
                'id_inventory_purchase' => 'INV-PUR-002',
                'nama_barang' => 'Kursi Lipat',
                'jumlah' => 20,
                'satuan' => 'Buah',
                'perkiraan_biaya' => 1500000,
                'alasan' => 'Kursi lipat existing 50 unit, tapi untuk acara besar (HUT RT, posyandu) butuh minimal 70. Tambah 20 unit.',
                'status' => 'DISETUJUI',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => $ketua->id_users,
                'disetujui_at' => now()->subDays(3),
            ],
            [
                'id_inventory_purchase' => 'INV-PUR-003',
                'nama_barang' => 'Proyektor Portable',
                'jumlah' => 1,
                'satuan' => 'Unit',
                'perkiraan_biaya' => 3500000,
                'alasan' => 'Untuk presentasi di rapat RT, posyandu, dan kegiatan Karang Taruna. Saat ini pinjam ke RW.',
                'status' => 'DITOLAK',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => $ketua->id_users,
                'disetujui_at' => now()->subDay(),
            ],
            [
                'id_inventory_purchase' => 'INV-PUR-004',
                'nama_barang' => 'Meja Lipat',
                'jumlah' => 15,
                'satuan' => 'Buah',
                'perkiraan_biaya' => 1200000,
                'alasan' => 'Meja lipat existing 10 unit. Butuh tambahan untuk rapat RT bulanan dan acara warga.',
                'status' => 'DIAJUKAN',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => null,
                'disetujui_at' => null,
            ],
            [
                'id_inventory_purchase' => 'INV-PUR-005',
                'nama_barang' => 'Kabel Rol 50m',
                'jumlah' => 5,
                'satuan' => 'Roll',
                'perkiraan_biaya' => 750000,
                'alasan' => 'Kabel panjang untuk sound system & penerangan saat acara outdoor di lapang RT.',
                'status' => 'DIAJUKAN',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => null,
                'disetujui_at' => null,
            ],
            [
                'id_inventory_purchase' => 'INV-PUR-006',
                'nama_barang' => 'AC Standing 2PK',
                'jumlah' => 1,
                'satuan' => 'Unit',
                'perkiraan_biaya' => 6500000,
                'alasan' => 'Balai RT belum punya AC. Butuh untuk kenyamanan warga saat rapat & kegiatan di siang hari.',
                'status' => 'DISETUJUI',
                'id_wilayah' => $rt->id_wilayah,
                'diajukan_oleh' => $sekretaris->id_users,
                'disetujui_oleh' => $ketua->id_users,
                'disetujui_at' => now()->subHours(6),
            ],
        ];

        foreach ($purchases as $purchase) {
            $created = InventoryPurchase::firstOrCreate(
                ['id_inventory_purchase' => $purchase['id_inventory_purchase']],
                $purchase
            );

            // If approved, create/update master inventory item
            if ($created->status === 'DISETUJUI') {
                $invId = 'INV-' . strtoupper(Str::slug($created->nama_barang));
                if (Str::length($invId) > 20) {
                    $invId = 'INV-' . strtoupper(substr(Str::slug($created->nama_barang), 0, 15));
                }
                
                // Check if inventory item already exists for this purchase
                $existingInv = Inventory::where('nama_barang', $created->nama_barang)
                    ->where('id_wilayah', $rt->id_wilayah)
                    ->first();

                if ($existingInv) {
                    // Update quantity
                    $existingInv->increment('jumlah', $created->jumlah);
                } else {
                    // Create new inventory item from approved purchase
                    Inventory::create([
                        'id_inventory' => $invId . '-' . substr($created->id_inventory_purchase, -3),
                        'nama_barang' => $created->nama_barang,
                        'kategori' => 'Perlengkapan Acara',
                        'jumlah' => $created->jumlah,
                        'satuan' => $created->satuan,
                        'kondisi' => 'BAIK',
                        'lokasi' => 'Gudang Balai RT',
                        'id_wilayah' => $rt->id_wilayah,
                        'status_aktif' => true,
                        'created_by' => $created->disetujui_oleh,
                    ]);
                }
            }
        }

        $this->command?->info('Inventory & InventoryPurchase seeded successfully');
    }
}