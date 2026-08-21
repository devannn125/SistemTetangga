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
        $activeUserRole = $actor->userRoles()
            ->where('status', 'ACTIVE')
            ->where(function ($q) {
                $q->whereNull('periode_mulai')
                  ->orWhereDate('periode_mulai', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('periode_selesai')
                  ->orWhereDate('periode_selesai', '>=', now());
            })
            ->first();

        if (! $activeUserRole) {
            throw ValidationException::withMessages([
                'id_wilayah' => ['Akun ini tidak memiliki wilayah aktif untuk melakukan aksi ini.'],
            ]);
        }

        return $activeUserRole->id_wilayah;
    }
}