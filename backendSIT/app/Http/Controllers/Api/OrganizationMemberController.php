<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\OrganizationMemberRequest;
use App\Http\Resources\OrganizationMemberResource;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;

class OrganizationMemberController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('ORGANISASI', 'VIEW');

        $query = OrganizationMember::query()->with(['citizen', 'wilayah']);

        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }
        if ($request->has('jabatan')) {
            $query->where('jabatan', $request->query('jabatan'));
        }
        if ($request->has('status_aktif')) {
            $query->where('status_aktif', $request->boolean('status_aktif'));
        }

        return OrganizationMemberResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(OrganizationMemberRequest $request)
    {
        $this->authorizeModule('ORGANISASI', 'CREATE');

        $member = OrganizationMember::create($request->validated());

        $this->audit('ORGANISASI', 'CREATE', 'organization_member', $member->id_organization_member);

        return (new OrganizationMemberResource($member->load('citizen')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('ORGANISASI', 'VIEW');

        return new OrganizationMemberResource(OrganizationMember::with(['citizen', 'wilayah'])->findOrFail($id));
    }

    public function update(OrganizationMemberRequest $request, string $id)
    {
        $this->authorizeModule('ORGANISASI', 'UPDATE');

        $member = OrganizationMember::findOrFail($id);
        $old = $member->toArray();
        $member->update($request->validated());

        $this->audit('ORGANISASI', 'UPDATE', 'organization_member', $member->id_organization_member, $old, $member->toArray());

        return new OrganizationMemberResource($member->load('citizen'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('ORGANISASI', 'DELETE');

        $member = OrganizationMember::findOrFail($id);
        $member->update(['status_aktif' => false]);

        $this->audit('ORGANISASI', 'DELETE', 'organization_member', $member->id_organization_member);

        return response()->json(['message' => 'Anggota dinonaktifkan.']);
    }
}
