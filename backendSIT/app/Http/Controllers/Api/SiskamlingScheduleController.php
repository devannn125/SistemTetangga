<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SiskamlingScheduleRequest;
use App\Http\Resources\SiskamlingScheduleResource;
use App\Models\SiskamlingSchedule;
use Illuminate\Http\Request;

class SiskamlingScheduleController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        $query = SiskamlingSchedule::query()->with(['petugas', 'checkins'])->latest('tanggal_jadwal');

        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }
        if ($request->has('shift')) {
            $query->where('shift', $request->query('shift'));
        }
        if ($request->has('from')) {
            $query->whereDate('tanggal_jadwal', '>=', $request->query('from'));
        }
        if ($request->has('to')) {
            $query->whereDate('tanggal_jadwal', '<=', $request->query('to'));
        }

        return SiskamlingScheduleResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(SiskamlingScheduleRequest $request)
    {
        $this->authorizeModule('SISKAMLING', 'CREATE');

        $schedule = SiskamlingSchedule::create($request->validated());

        $this->audit('SISKAMLING', 'CREATE', 'siskamling_schedule', $schedule->id_siskamling_schedule);

        return (new SiskamlingScheduleResource($schedule->load(['petugas', 'checkins'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        return new SiskamlingScheduleResource(SiskamlingSchedule::with(['petugas', 'checkins'])->findOrFail($id));
    }

    public function update(SiskamlingScheduleRequest $request, string $id)
    {
        $this->authorizeModule('SISKAMLING', 'UPDATE');

        $schedule = SiskamlingSchedule::findOrFail($id);
        $old = $schedule->toArray();
        $schedule->update($request->validated());

        $this->audit('SISKAMLING', 'UPDATE', 'siskamling_schedule', $schedule->id_siskamling_schedule, $old, $schedule->toArray());

        return new SiskamlingScheduleResource($schedule->load(['petugas', 'checkins']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'DELETE');

        $schedule = SiskamlingSchedule::findOrFail($id);
        $schedule->delete();

        $this->audit('SISKAMLING', 'DELETE', 'siskamling_schedule', $schedule->id_siskamling_schedule);

        return response()->noContent();
    }
}
