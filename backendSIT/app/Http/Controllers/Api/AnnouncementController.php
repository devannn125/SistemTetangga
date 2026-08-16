<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;

class AnnouncementController extends Controller
{
    public function index()
    {
        return AnnouncementResource::collection(Announcement::latest()->paginate(15));
    }

    public function store(AnnouncementRequest $request)
    {
        return new AnnouncementResource(Announcement::create($request->validated()));
    }

    public function show(Announcement $announcement)
    {
        return new AnnouncementResource($announcement);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement)
    {
        $announcement->update($request->validated());

        return new AnnouncementResource($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->noContent();
    }
}
