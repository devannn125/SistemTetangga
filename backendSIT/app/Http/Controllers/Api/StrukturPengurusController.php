<?php

namespace App\Http\Controllers\Api;

use App\Models\Citizen;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Buat data pengurus calon (Kepala Dukuh/Ketua RW/Ketua RT) versi minimal:
 * User (akun login) + Citizen (data warga), TERHUBUNG via user.id_citizen.
 *
 * Alur: lurah/dukuh "input data" dulu (di sini) tanpa jabatan, lalu dropdown
 * "angkat" memakai OrganizationMemberController@store (yang men-sync role
 * strategis via POSITION_TO_ROLE sehingga pengurus bisa login).
 *
 * Wilayah target: boleh dikirim sebagai `id_wilayah` ATAU `nama_wilayah`
 * (nama node dukuh, di-resolve backend).
 */
class StrukturPengurusController extends BaseApiController
{
    public function store(Request $request)
    {
        $this->authorizeModule('ORGANISASI', 'CREATE');

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:6'],
            'nik' => ['required', 'string', 'size:16'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'id_wilayah' => ['nullable', 'exists:wilayah,id_wilayah'],
            'nama_wilayah' => ['nullable', 'string', 'max:100'],
            'no_hp' => ['required', 'string', 'max:20', 'unique:users,no_hp'],
        ]);

        if (empty($validated['id_wilayah']) && empty(trim((string) $validated['nama_wilayah']))) {
            throw ValidationException::withMessages([
                'id_wilayah' => ['Wilayah penugasan wajib diisi (id atau nama wilayah).'],
            ]);
        }

        // Resolve id_wilayah dari nama node dukuh bila id tidak dikirim.
        $idWilayah = $validated['id_wilayah'] ?? null;
        if (! $idWilayah) {
            $dukuh = Wilayah::query()
                ->whereRaw('LOWER(TRIM(nama_wilayah)) = ?', [strtolower(trim($validated['nama_wilayah']))])
                ->where('tipe', 'DUKUH')
                ->first();

            if (! $dukuh) {
                throw ValidationException::withMessages([
                    'nama_wilayah' => ['Wilayah dukuh tidak ditemukan.'],
                ]);
            }

            $idWilayah = $dukuh->id_wilayah;
        }

        // Cek duplikat dengan pesan per-field yang jelas.
        if (User::where('email', $validated['email'])->exists()) {
            throw ValidationException::withMessages(['email' => ['Email sudah terdaftar.']]);
        }
        if (Citizen::where('nik', $validated['nik'])->exists()) {
            throw ValidationException::withMessages(['nik' => ['NIK sudah terdaftar.']]);
        }
        if (! empty($validated['no_hp']) && User::where('no_hp', $validated['no_hp'])->exists()) {
            throw ValidationException::withMessages(['no_hp' => ['No. HP sudah terdaftar.']]);
        }

        $actor = $this->requestUser();

        // Zero-trust: id_wilayah harus berada dalam lingkup aktor utk ORGANISASI.CREATE.
        $scopeIds = $this->rbac->wilayahScopeIds($actor, 'ORGANISASI', 'CREATE');
        if ($scopeIds !== null && ! in_array($idWilayah, $scopeIds, true)) {
            throw ValidationException::withMessages([
                'id_wilayah' => ['Wilayah di luar lingkup kewenangan Anda.'],
            ]);
        }

        $user = DB::transaction(function () use ($validated, $idWilayah) {
            $citizen = Citizen::create([
                'nik' => $validated['nik'],
                'nama_lengkap' => $validated['nama'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'id_wilayah' => $idWilayah,
                'no_hp' => $validated['no_hp'],
                'email' => $validated['email'],
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'status_ekonomi' => 'MAMPU',
                'penerima_bansos' => false,
                'tanggal_masuk_rt' => now()->toDateString(),
                'alamat_kk_luar_rt' => false,
                'berdomisili_luar_rt' => false,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
                'status_verifikasi' => 'APPROVED_DUKUH',
            ]);

            $user = User::create([
                'nama_users' => $validated['nama'],
                'email' => $validated['email'],
                'no_hp' => $validated['no_hp'],
                'password_hash' => Hash::make($validated['password']),
                'auth_provider' => 'EMAIL',
                'status' => 'ACTIVE',
                'id_citizen' => $citizen->id_citizen,
            ]);

            return $user;
        });

        $this->audit('ORGANISASI', 'CREATE', 'users', $user->id_users);

        return response()->json([
            'message' => 'Data pengurus berhasil dibuat. Silakan angkat melalui dropdown.',
            'data' => [
                'id_users' => $user->id_users,
                'id_citizen' => $user->id_citizen,
                'nama' => $user->nama_users,
                'email' => $user->email,
                'id_wilayah' => $idWilayah,
            ],
        ], 201);
    }
}
