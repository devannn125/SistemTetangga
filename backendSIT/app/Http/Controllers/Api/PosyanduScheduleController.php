<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\PosyanduScheduleRequest;
use App\Http\Resources\PosyanduScheduleResource;
use App\Models\PosyanduSchedule;
use Illuminate\Http\Request;

class PosyanduScheduleController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('POSYANDU', 'VIEW');

        $query = PosyanduSchedule::query()->with('wilayah')->latest('tanggal_jadwal');
        $this->scopeQuery($query, 'POSYANDU', 'VIEW');

        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }
        if ($request->has('from')) {
            $query->whereDate('tanggal_jadwal', '>=', $request->query('from'));
        }
        if ($request->has('to')) {
            $query->whereDate('tanggal_jadwal', '<=', $request->query('to'));
        }

        return PosyanduScheduleResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(PosyanduScheduleRequest $request)
    {
        $this->authorizeModule('POSYANDU', 'CREATE');

        $schedule = PosyanduSchedule::create($request->validated());

        $this->audit('POSYANDU', 'CREATE', 'posyandu_schedule', $schedule->id_posyandu_schedule);

        return (new PosyanduScheduleResource($schedule->load('wilayah')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('POSYANDU', 'VIEW');

        return new PosyanduScheduleResource(PosyanduSchedule::with('wilayah')->findOrFail($id));
    }

    public function update(PosyanduScheduleRequest $request, string $id)
    {
        $this->authorizeModule('POSYANDU', 'UPDATE');

        $schedule = PosyanduSchedule::findOrFail($id);
        $old = $schedule->toArray();
        $schedule->update($request->validated());

        $this->audit('POSYANDU', 'UPDATE', 'posyandu_schedule', $schedule->id_posyandu_schedule, $old, $schedule->toArray());

        return new PosyanduScheduleResource($schedule->load('wilayah'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('POSYANDU', 'DELETE');

        $schedule = PosyanduSchedule::findOrFail($id);
        $schedule->delete();

        $this->audit('POSYANDU', 'DELETE', 'posyandu_schedule', $schedule->id_posyandu_schedule);

        return response()->noContent();
    }
}
