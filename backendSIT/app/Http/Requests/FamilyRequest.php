<?php

namespace App\Http\Requests;

use App\Models\Citizen;
use App\Models\Family;
use App\Services\RbacService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class FamilyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('family')?->id_family ?? $this->route('family');

        return [
            'no_kk' => ['required', 'string', 'max:32', Rule::unique('family', 'no_kk')->ignore($id, 'id_family')],
            'id_kepala_keluarga' => ['nullable', 'exists:citizen,id_citizen'],
            'id_wilayah' => ['nullable', 'exists:wilayah,id_wilayah'],
            'status' => ['required', Rule::in(['ACTIVE', 'PINDAH', 'DIHAPUS'])],
        ];
    }

    /**
     * Business rule PRD 6.2.2: hanya satu kepala keluarga aktif per KK, dan
     * penetapan kepala baru wajib valid (satu wilayah dengan aktor + memang
     * ber-status hubungan KEPALA_KELUARGA).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $kepalaId = $this->input('id_kepala_keluarga');

            if (! $kepalaId) {
                return;
            }

            /** @var Family|null $family */
            // route('family') bisa berupa string ID karena controller tidak
            // melakukan implicit model binding pada parameter {family}.
            $family = $this->route('family');
            if (is_string($family)) {
                $family = Family::find($family);
            }

            // Kepala yang tidak berubah (edit field lain pada KK sama) tidak
            // divalidasi ulang supaya data legacy tetap bisa diedit.
            if ($family && $family->id_kepala_keluarga === $kepalaId) {
                return;
            }

            $citizen = Citizen::find($kepalaId);

            if (! $citizen) {
                return; // sudah ditangani rule exists
            }

            $actorWilayah = app(RbacService::class)->anchorWilayahId($this->user());

            if ($actorWilayah !== null && $citizen->id_wilayah !== $actorWilayah) {
                $validator->errors()->add(
                    'id_kepala_keluarga',
                    'Kepala keluarga harus berasal dari wilayah RT Anda.'
                );
            }

            if ($citizen->hubungan_keluarga !== 'KEPALA_KELUARGA') {
                $validator->errors()->add(
                    'id_kepala_keluarga',
                    'Warga yang dipilih harus memiliki hubungan keluarga KEPALA_KELUARGA.'
                );
            }

            $alreadyKepala = Family::query()
                ->where('status', 'ACTIVE')
                ->where('id_kepala_keluarga', $kepalaId)
                ->when($family, fn ($query) => $query->where('id_family', '!=', $family->id_family))
                ->exists();

            if ($alreadyKepala) {
                $validator->errors()->add(
                    'id_kepala_keluarga',
                    'Warga ini sudah menjadi kepala keluarga aktif pada Kartu Keluarga lain.'
                );
            }
        });
    }
}
