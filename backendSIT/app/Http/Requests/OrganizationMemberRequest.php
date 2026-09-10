<?php

namespace App\Http\Requests;

use App\Models\Citizen;
use App\Models\OrganizationMember;
use App\Models\UserRole;
use App\Models\Wilayah;
use Illuminate\Foundation\Http\FormRequest;

class OrganizationMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $organizationMemberId = $this->route('organization_member')?->id_organization_member ?? $this->route('id');

        return [
            'id_citizen' => [
                'required',
                'exists:citizen,id_citizen',
                function ($attribute, $value, $fail) {
                    $idWilayah = $this->input('id_wilayah');
                    if (! $idWilayah) {
                        return;
                    }

                    // Admin bypass: boleh angkat warga mana saja jadi apa saja
                    $user = $this->user();
                    if ($user) {
                        $isAdmin = UserRole::where('id_users', $user->id_users)
                            ->where('status', 'ACTIVE')
                            ->whereHas('role', fn ($q) => $q->where('kode', 'ADMIN'))
                            ->exists();
                        if ($isAdmin) {
                            return;
                        }
                    }

                    $citizenWilayahId = Citizen::query()
                        ->where('id_citizen', $value)
                        ->value('id_wilayah');

                    if ($citizenWilayahId === $idWilayah) {
                        return;
                    }

                    // Fix: cek dua arah — target ancestor dari citizen (RT -> KEL) ATAU citizen ancestor dari target (DUKUH -> RT)
                    // Sebelumnya hanya cek citizen ancestor dari target, sehingga RT -> KEL (Kepala Lurah) selalu fail
                    $cur = Wilayah::find($citizenWilayahId);
                    while ($cur) {
                        if ($cur->id_wilayah === $idWilayah) {
                            return; // target adalah ancestor dari citizen (mis: Astro RT01 -> KEL01)
                        }
                        $cur = $cur->parent;
                    }

                    $target = Wilayah::find($idWilayah);
                    while ($target) {
                        if ($target->id_wilayah === $citizenWilayahId) {
                            return; // citizen adalah ancestor dari target (mis: Dukuh -> RT di bawahnya)
                        }
                        $target = $target->parent;
                    }

                    $fail('Warga yang dipilih berada di luar cakupan wilayah penugasan ini.');
                },
            ],
            'jabatan' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($organizationMemberId) {
                    $idWilayah = (string) $this->input('id_wilayah');
                    $periodeMulai = (string) $this->input('periode_mulai');
                    $statusAktif = $this->boolean('status_aktif', true);

                    if ($statusAktif && OrganizationMember::isPositionTaken($value, $idWilayah, $periodeMulai, $organizationMemberId)) {
                        $fail("Jabatan {$value} sudah dipegang oleh pengurus lain pada periode ini.");

                        return;
                    }

                    if (! $statusAktif && OrganizationMember::hasInactiveHistory($value, $idWilayah, $periodeMulai, $organizationMemberId)) {
                        $fail("Sudah ada riwayat nonaktif untuk jabatan {$value} pada periode ini.");
                    }
                },
            ],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'foto_url' => ['nullable', 'string', 'max:500'],
            'foto' => ['nullable', 'image', 'max:2048'],
            'status_aktif' => ['boolean'],
        ];
    }
}
