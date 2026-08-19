<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CitizenHistoryResource;
use App\Models\CitizenHistory;
use Illuminate\Http\Request;

class CitizenHistoryController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('WARGA', 'VIEW');

        $query = CitizenHistory::query();

        if ($request->has('id_citizen')) {
            $query->where('id_citizen', $request->query('id_citizen'));
        }

        return CitizenHistoryResource::collection($query->latest('changed_at')->paginate($request->query('per_page', 50)));
    }

    public function show(string $id)
    {
        $this->authorizeModule('WARGA', 'VIEW');

        return new CitizenHistoryResource(CitizenHistory::findOrFail($id));
    }
}
