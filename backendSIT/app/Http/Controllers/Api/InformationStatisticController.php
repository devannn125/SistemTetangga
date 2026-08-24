<?php

namespace App\Http\Controllers\Api;

use App\Services\InformationStatisticService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Informasi & Statistik (PRD 6.8) — read-only: ringkasan kategori a–j,
 * drill-down daftar warga per kategori, dan daftar KK (Informasi Keluarga).
 */
class InformationStatisticController extends BaseApiController
{
    public function __construct(private readonly InformationStatisticService $service)
    {
        parent::__construct();
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorizeModule('STATISTIK', 'VIEW');

        return response()->json([
            'data' => $this->service->summary($request->user()),
        ]);
    }

    public function show(Request $request, string $kode): JsonResponse
    {
        $this->authorizeModule('STATISTIK', 'VIEW');

        return response()->json([
            'data' => [
                'kode' => $kode,
                'warga' => $this->service->detail($request->user(), $kode),
            ],
        ]);
    }

    public function keluarga(Request $request): JsonResponse
    {
        $this->authorizeModule('STATISTIK', 'VIEW');

        return response()->json([
            'data' => $this->service->familySummary($request->user()),
        ]);
    }
}
