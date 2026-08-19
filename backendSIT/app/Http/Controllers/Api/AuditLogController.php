<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('AUDIT', 'VIEW');

        $query = AuditLog::query()->with('module')->latest();

        if ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->query('entity_type'));
        }
        if ($request->has('id_permission_action')) {
            $query->where('id_permission_action', $request->query('id_permission_action'));
        }

        return AuditLogResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function show(string $id)
    {
        $this->authorizeModule('AUDIT', 'VIEW');

        return new AuditLogResource(AuditLog::with('module')->findOrFail($id));
    }
}
