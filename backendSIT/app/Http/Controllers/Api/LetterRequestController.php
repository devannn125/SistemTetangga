<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LetterRequestRequest;
use App\Http\Resources\LetterRequestResource;
use App\Models\LetterRequest;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class LetterRequestController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        $query = LetterRequest::query()->with(['pemohon', 'signature'])->latest();

        $scope = $this->rbac->scopeFor($this->requestUser(), 'SURAT', 'VIEW');

        if ($scope === RbacService::SCOPE_OWN) {
            // Warga: hanya surat permohonan miliknya sendiri (PRD 3.2 Own Data).
            $query->where('id_pemohon_citizen', $this->requestUser()->id_citizen);
        } else {
            $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'SURAT', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereIn('id_wilayah', $scopeIds);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('jenis_surat')) {
            $query->where('jenis_surat', $request->query('jenis_surat'));
        }

        return LetterRequestResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(LetterRequestRequest $request)
    {
        $this->authorizeModule('SURAT', 'CREATE');

        $user = $this->requestUser();
        if (! $user->id_citizen) {
            abort(403, 'Akun ini belum terhubung ke data warga.');
        }

        $data = $request->validated();
        $data['status'] = 'DIAJUKAN';

        // Pemohon & wilayah dipaksa dari akun sendiri — tidak boleh atas nama orang lain.
        $data['id_pemohon_citizen'] = $user->id_citizen;
        $data['id_wilayah'] = $user->citizen->id_wilayah;

        $letter = LetterRequest::create($data);

        $this->audit('SURAT', 'CREATE', 'letter_request', $letter->id_letter_request);

        return (new LetterRequestResource($letter->load(['pemohon', 'signature'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        return new LetterRequestResource(LetterRequest::with(['pemohon', 'signature', 'wilayah'])->findOrFail($id));
    }

    /**
     * Update surat. Saat payload berisi `status`, tindakan dianggap VERIFY
     * (Sekretaris) atau APPROVE (Ketua RT).
     */
    public function update(LetterRequestRequest $request, string $id)
    {
        $data = $request->validated();

        $isStatusTransition = array_key_exists('status', $data);
        $transition = strtoupper((string) ($data['status'] ?? ''));

        if ($isStatusTransition && $transition === 'DIVERIFIKASI') {
            $this->authorizeModule('SURAT', 'VERIFY');
            $this->assertInScope($id, 'VERIFY');
        } elseif ($isStatusTransition && $transition === 'DISETUJUI') {
            $this->authorizeModule('SURAT', 'APPROVE');
            $this->assertInScope($id, 'APPROVE');
        } elseif ($isStatusTransition && $transition === 'DITOLAK') {
            // Penolakan bisa dari Sekretaris (VERIFY) maupun Ketua RT (APPROVE).
            if (! $this->rbac->can($this->requestUser(), 'SURAT', 'VERIFY')
                && ! $this->rbac->can($this->requestUser(), 'SURAT', 'APPROVE')) {
                abort(403, 'Tidak memiliki akses untuk menolak permohonan surat.');
            }
            $this->assertInScope($id, 'APPROVE');
        } else {
            $this->authorizeModule('SURAT', 'UPDATE');
        }

        $letter = LetterRequest::findOrFail($id);
        $old = $letter->toArray();

        if ($transition === 'DIVERIFIKASI') {
            $data['verified_by'] = $this->requestUser()->id_users;
            $data['verified_at'] = now();
        } elseif (in_array($transition, ['DISETUJUI', 'DITOLAK'], true)) {
            $data['approved_by'] = $this->requestUser()->id_users;
            $data['approved_at'] = now();
        }

        $letter->update($data);

        $this->audit('SURAT', 'UPDATE', 'letter_request', $letter->id_letter_request, $old, $letter->toArray());

        return new LetterRequestResource($letter->load(['pemohon', 'signature']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SURAT', 'DELETE');

        $letter = LetterRequest::findOrFail($id);
        $letter->delete();

        $this->audit('SURAT', 'DELETE', 'letter_request', $letter->id_letter_request);

        return response()->noContent();
    }

    private function assertInScope(string $id, string $action): void
    {
        $letter = LetterRequest::findOrFail($id);

        $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'SURAT', $action);
        if ($scopeIds !== null && ! in_array($letter->id_wilayah, $scopeIds, true)) {
            abort(403, 'Permohonan surat di luar lingkup wilayah Anda.');
        }
    }
}