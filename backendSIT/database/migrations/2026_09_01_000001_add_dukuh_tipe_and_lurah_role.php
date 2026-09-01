<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Role;

/**
 * 1. Tambah tipe wilayah DUKUH ke enum (KELURAHAN > DUKUH > RW > RT).
 * 2. Update level role: ADMIN=0, LURAH=1, DUKUH=2, RW=3, RT/SEK/BEN=4, WARGA=5.
 * 3. Insert role LURAH baru (via model agar id_role berformat ROLE-###).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE wilayah MODIFY COLUMN tipe ENUM('PROVINSI','KABUPATEN','KECAMATAN','KELURAHAN','DUKUH','RW','RT') NOT NULL");
        DB::statement("ALTER TABLE role_permission MODIFY COLUMN scope_level ENUM('OWN','RT','RW','DUKUH','KELURAHAN','ALL') NULL");

        DB::table('role')->where('kode', 'ADMIN')->update(['level' => 0]);
        DB::table('role')->where('kode', 'RW')->update(['level' => 3]);
        DB::table('role')->where('kode', 'RT')->update(['level' => 4]);
        DB::table('role')->where('kode', 'SEKRETARIS')->update(['level' => 4]);
        DB::table('role')->where('kode', 'BENDAHARA')->update(['level' => 4]);

        Role::firstOrCreate(
            ['kode' => 'LURAH'],
            [
                'nama_role' => 'Kepala Lurah',
                'level' => 1,
                'is_strategic' => true,
                'deskripsi' => 'Kepala Kelurahan / Lurah',
            ]
        );
    }

    public function down(): void
    {
        DB::table('role')->where('kode', 'LURAH')->delete();

        DB::table('role')->where('kode', 'ADMIN')->update(['level' => 1]);
        DB::table('role')->where('kode', 'RW')->update(['level' => 3]);
        DB::table('role')->where('kode', 'RT')->update(['level' => 4]);
        DB::table('role')->where('kode', 'SEKRETARIS')->update(['level' => 4]);
        DB::table('role')->where('kode', 'BENDAHARA')->update(['level' => 4]);

        DB::statement("ALTER TABLE wilayah MODIFY COLUMN tipe ENUM('PROVINSI','KABUPATEN','KECAMATAN','KELURAHAN','RW','RT') NOT NULL");
        DB::statement("ALTER TABLE role_permission MODIFY COLUMN scope_level ENUM('OWN','RT','RW','KELURAHAN','ALL') NULL");
    }
};
