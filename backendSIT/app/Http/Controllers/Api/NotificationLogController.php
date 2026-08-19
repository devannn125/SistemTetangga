<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\NotificationLogRequest;
use App\Http\Resources\NotificationLogResource;
use App\Models\NotificationLog;
use Illuminate\Http\Request;

class NotificationLogController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('NOTIFIKASI', 'VIEW');

        $query = NotificationLog::query();

        if ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }
        if ($request->has('status_kirim')) {
            $query->where('status_kirim', $request->query('status_kirim'));
        }

        return NotificationLogResource::collection($query->latest()->paginate($request->query('per_page', 50)));
    }

    public function store(NotificationLogRequest $request)
    {
        $this->authorizeModule('NOTIFIKASI', 'CREATE');

        $log = NotificationLog::create($request->validated());

        return (new NotificationLogResource($log))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('NOTIFIKASI', 'VIEW');

        return new NotificationLogResource(NotificationLog::findOrFail($id));
    }

    public function update(NotificationLogRequest $request, string $id)
    {
        $this->authorizeModule('NOTIFIKASI', 'UPDATE');

        $log = NotificationLog::findOrFail($id);
        $log->update($request->validated());

        return new NotificationLogResource($log);
    }
}
