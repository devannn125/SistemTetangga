<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Menentukan id_wilayah dari role aktif milik actor (user yang sedang login),
 * bukan dari input client — mencegah user menyisipkan wilayah RT lain
 * lewat request (mis. via Postman/DevTools).
 *
 * Dipakai di service/controller manapun yang perlu otomatis mengisi id_wilayah
 * saat membuat data baru (Citizen, Family, dst).
 */
trait ResolvesActorWilayah
{
    protected function resolveActorWilayah(User $actor): string
    {
        // Prefer role dengan level terkecil (paling struktural, mis. RT level 4
        // lebih diutamakan daripada WARGA level 5) supaya warga yang dibuat
        // Ketua RT terletak di node RT-nya, bukan ikut role WARGA lama di Dukuh.
        $activeUserRole = $actor->userRoles()
            ->join('role', 'role.id_role', '=', 'user_role.id_role')
            ->where('user_role.status', 'ACTIVE')
            ->where(function ($q) {
                $q->whereNull('user_role.periode_mulai')
                  ->orWhereDate('user_role.periode_mulai', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('user_role.periode_selesai')
                  ->orWhereDate('user_role.periode_selesai', '>=', now());
            })
            ->orderBy('role.level')
            ->orderBy('role.kode')
            ->first(['user_role.*']);

        if (! $activeUserRole) {
            throw ValidationException::withMessages([
                'id_wilayah' => ['Akun ini tidak memiliki wilayah aktif untuk melakukan aksi ini.'],
            ]);
        }

        return $activeUserRole->id_wilayah;
    }
}