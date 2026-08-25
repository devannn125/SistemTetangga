<?php

namespace App\Http\Requests;

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
            'id_citizen' => ['required', 'exists:citizen,id_citizen'],
            'jabatan' => ['required', 'string', 'max:100', function ($attribute, $value, $fail) use ($organizationMemberId) {
                if (OrganizationMember::isStrategicPosition($value)) {
                    $idWilayah = $this->input('id_wilayah');
                    $periodeMulai = $this->input('periode_mulai');
                    $statusAktif = $this->boolean('status_aktif', true);

                    if ($statusAktif && !$this->isUniqueStrategicPosition($value, $idWilayah, $periodeMulai, $organizationMemberId)) {
                        $fail("Jabatan {$value} sudah dipegang oleh pengurus lain pada periode ini.");
                    }
                }
            }],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'foto_url' => ['nullable', 'url', 'max:500'],
            'status_aktif' => ['boolean'],
        ];
    }

    protected function isUniqueStrategicPosition(string $jabatan, string $idWilayah, string $periodeMulai, ?string $excludeId): bool
    {
        return OrganizationMember::checkUniqueStrategicPosition($jabatan, $idWilayah, $periodeMulai, $excludeId);
    }
}
