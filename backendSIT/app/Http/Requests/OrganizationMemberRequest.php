<?php

namespace App\Http\Requests;

use App\Models\Citizen;
use App\Models\OrganizationMember;
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

                    // Calon diinput di node dukuh (calon_jabatan membedakan jenis),
                    // lalu diangkat ke RT/RW mana pun di bawah dukuh tsb. Jadi cukup
                    // pastikan target penugasan berada dalam subtree yang berakar di
                    // wilayah warga calon (atau sama dengan wilayah calon).
                    $citizenWilayahId = Citizen::query()
                        ->where('id_citizen', $value)
                        ->value('id_wilayah');

                    if ($citizenWilayahId === $idWilayah) {
                        return;
                    }

                    $target = \App\Models\Wilayah::find($idWilayah);
                    while ($target) {
                        if ($target->id_wilayah === $citizenWilayahId) {
                            return;
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
