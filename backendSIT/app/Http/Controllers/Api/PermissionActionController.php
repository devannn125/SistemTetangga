<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PermissionActionResource;
use App\Models\PermissionAction;
use Illuminate\Http\Request;

class PermissionActionController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return PermissionActionResource::collection(PermissionAction::query()->get());
    }

    public function store(Request $request)
    {
        $this->authorizeModule('MASTER', 'CREATE');

        $data = $request->validate([
            'kode_permission' => ['required', 'string', 'max:20', 'unique:permission_action,kode_permission'],
            'deskripsi' => ['nullable', 'string', 'max:150'],
        ]);

        $action = PermissionAction::create($data);

        $this->audit('MASTER', 'CREATE', 'permission_action', (string) $action->id_permission_action);

        return (new PermissionActionResource($action))->response()->setStatusCode(201);
    }

    public function destroy(int $id)
    {
        $this->authorizeModule('MASTER', 'DELETE');

        $action = PermissionAction::findOrFail($id);
        $action->delete();

        $this->audit('MASTER', 'DELETE', 'permission_action', (string) $action->id_permission_action);

        return response()->noContent();
    }
}
