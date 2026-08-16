<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $dashboard)
    {
        $role = $request->get('role') ?? $request->header('X-Role');
        $userId = $request->get('user_id') ?? $request->header('X-User-Id');

        return response()->json($dashboard->summary($role, $userId));
    }
}
