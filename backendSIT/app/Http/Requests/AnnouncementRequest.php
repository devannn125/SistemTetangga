<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:200'],
            'isi' => ['required', 'string'],
            'kategori' => ['required', Rule::in(['KESEHATAN', 'KEAMANAN', 'INFRASTRUKTUR', 'SOSIAL', 'LAINNYA'])],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'target' => ['required', Rule::in(['SEMUA_WARGA', 'PENGURUS_SAJA', 'WARGA_TERTENTU'])],
            'lampiran_url' => ['nullable', 'url', 'max:500'],
            'is_pinned' => ['boolean'],
            'status_approval' => ['required', Rule::in(['DRAFT', 'RT', 'RW', 'DUKUH_DISETUJUI'])],
            'created_by' => ['required', 'exists:users,id_users'],
        ];
    }
}
