<?php

namespace App\Http\Resources;

use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Citizen
 */
class CitizenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id_citizen' => $this->id_citizen,
            'nik' => $this->nik,
            'nama_lengkap' => $this->nama_lengkap,
            'hubungan_keluarga' => $this->hubungan_keluarga,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'jenis_kelamin' => $this->jenis_kelamin,
            'status_nikah' => $this->status_nikah,
            'no_hp' => $this->no_hp,
            'email' => $this->email,
            'status_warga' => $this->status_warga,
            'tanggal_masuk_rt' => $this->tanggal_masuk_rt?->format('Y-m-d'),
            'tanggal_keluar_rt' => $this->tanggal_keluar_rt?->format('Y-m-d'),
            'alamat_kk_luar_rt' => (bool) $this->alamat_kk_luar_rt,
            'berdomisili_luar_rt' => (bool) $this->berdomisili_luar_rt,
            'status_hidup' => $this->status_hidup,
            'status_aktif' => (bool) $this->status_aktif,
            'status_verifikasi' => $this->status_verifikasi,

            // agama/pendidikan/profesi berasal dari tabel master_data (tipe berbeda),
            // lihat App\Models\MasterData.
            'agama' => $this->whenLoaded('agama', fn () => [
                'id_master' => $this->agama->id_master,
                'nama_master' => $this->agama->nama_master,
            ]),
            'pendidikan' => $this->whenLoaded('pendidikan', fn () => [
                'id_master' => $this->pendidikan->id_master,
                'nama_master' => $this->pendidikan->nama_master,
            ]),
            'profesi' => $this->whenLoaded('profesi', fn () => [
                'id_master' => $this->profesi->id_master,
                'nama_master' => $this->profesi->nama_master,
            ]),
            'wilayah' => $this->whenLoaded('wilayah', fn () => [
                'id_wilayah' => $this->wilayah->id_wilayah,
                'nama_wilayah' => $this->wilayah->nama_wilayah,
            ]),
            'family' => $this->whenLoaded('family', fn () => [
                'id_family' => $this->family->id_family,
                'no_kk' => $this->family->no_kk,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        // Business Rule #3 (Batasan_Role_RT_Digital.md): data sensitif hanya untuk
        // Ketua RT, Sekretaris, Bendahara. Filtering WAJIB di backend/serializer,
        // bukan hanya disembunyikan di frontend — maka pengecekan dilakukan di sini,
        // bukan lewat props/flag dari client.
        $user = $request->user();
        $canSeeSensitive = $user && $user->can('viewSensitive', $this->resource);

        if ($canSeeSensitive) {
            $data['status_ekonomi'] = $this->status_ekonomi;
            $data['penerima_bansos'] = (bool) $this->penerima_bansos;
            $data['kewarganegaraan'] = $this->kewarganegaraan;
        }

        return $data;
    }
}