<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $dashboard)
    {
        // Prioritaskan auth user (Bearer Sanctum) — anti spoof role/user_id
        $authUser = $request->user();
        if ($authUser) {
            return response()->json($dashboard->summaryForUser($authUser));
        }

        $role = $request->get('role') ?? $request->header('X-Role');
        $userId = $request->get('user_id') ?? $request->header('X-User-Id');

        return response()->json($dashboard->summary($role, $userId));
    }
}
