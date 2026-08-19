<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PENGUMUMAN', 'VIEW');

        $query = Announcement::query()->with('wilayah')->latest();

        if ($request->has('kategori')) {
            $query->where('kategori', $request->query('kategori'));
        }
        if ($request->has('status_approval')) {
            $query->where('status_approval', $request->query('status_approval'));
        }

        return AnnouncementResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(AnnouncementRequest $request)
    {
        $this->authorizeModule('PENGUMUMAN', 'CREATE');

        $data = $request->validated();
        $data['created_by'] = $this->requestUser()->id_users;

        $announcement = Announcement::create($data);

        $this->audit('PENGUMUMAN', 'CREATE', 'announcement', $announcement->id_announcement);

        return (new AnnouncementResource($announcement->load('wilayah')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PENGUMUMAN', 'VIEW');

        return new AnnouncementResource(Announcement::with('wilayah')->findOrFail($id));
    }

    public function update(AnnouncementRequest $request, string $id)
    {
        $this->authorizeModule('PENGUMUMAN', 'UPDATE');

        $announcement = Announcement::findOrFail($id);
        $old = $announcement->toArray();
        $announcement->update($request->validated());

        $this->audit('PENGUMUMAN', 'UPDATE', 'announcement', $announcement->id_announcement, $old, $announcement->toArray());

        return new AnnouncementResource($announcement->load('wilayah'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PENGUMUMAN', 'DELETE');

        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        $this->audit('PENGUMUMAN', 'DELETE', 'announcement', $announcement->id_announcement);

        return response()->noContent();
    }
}
