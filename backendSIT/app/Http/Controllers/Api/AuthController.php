<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\LogoutRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Body: { "identifier": "NIK/email/no_hp", "password": "...", "role": "WARGA|ADMIN|RT|RW|DUKUH" }
     */
    public function login(LoginRequest $request): JsonResponse|UserResource
    {
        $identifier = $request->validated('identifier');
        $password = $request->validated('password');
        $requestedRole = $request->validated('role'); // sudah di-uppercase di LoginRequest

        // Cari user berdasarkan email, no_hp, ATAU nik milik data citizen-nya
        $user = User::with(['citizen', 'userRoles.role'])
            ->where(function ($query) use ($identifier) {
                $query->where('email', $identifier)
                    ->orWhere('no_hp', $identifier)
                    ->orWhereHas('citizen', function ($q) use ($identifier) {
                        $q->where('nik', $identifier);
                    });
            })
            ->first();

        if (! $user || ! $user->password_hash || ! Hash::check($password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'identifier' => ['NIK/Email/No HP atau password salah.'],
            ]);
        }

        if ($user->status === 'PENDING_VERIFICATION') {
            return response()->json([
                'message' => 'Akun belum diverifikasi. Silakan verifikasi terlebih dahulu.',
            ], 403);
        }

        if ($user->status === 'SUSPENDED') {
            return response()->json([
                'message' => 'Akun anda telah ditangguhkan (suspended).',
            ], 403);
        }

        if ($user->status === 'INACTIVE') {
            return response()->json([
                'message' => 'Akun anda sudah tidak aktif.',
            ], 403);
        }

        // Kumpulkan kode role yang sedang aktif untuk user ini (bisa lebih dari satu)
        $today = now()->toDateString();

        $activeRoleCodes = $user->userRoles
            ->filter(function ($userRole) use ($today) {
                return $userRole->status === 'ACTIVE'
                    && (! $userRole->periode_mulai || $userRole->periode_mulai->toDateString() <= $today)
                    && (! $userRole->periode_selesai || $userRole->periode_selesai->toDateString() >= $today);
            })
            ->pluck('role.kode')
            ->filter()
            ->values();

        // User yang punya data citizen otomatis dianggap WARGA,
        // di luar role tambahan (RT/RW/DUKUH/ADMIN) dari tabel user_role.
        if ($user->id_citizen && ! $activeRoleCodes->contains('WARGA')) {
            $activeRoleCodes->push('WARGA');
        }

        if (! $activeRoleCodes->contains($requestedRole)) {
            throw ValidationException::withMessages([
                'role' => ["Akun ini tidak memiliki akses sebagai {$requestedRole}."],
            ]);
        }

        $selectedRole = Role::where('kode', $requestedRole)->first();

        $token = $user->createToken('auth_token')->plainTextToken;

        $user->forceFill(['last_login_at' => now()])->save();

        // Lampirkan data turunan (bukan kolom asli tabel users) ke model
        // supaya bisa dibaca oleh UserResource.
        $user->setAttribute('nik', $user->citizen->nik ?? null);
        $user->setAttribute('active_role', $selectedRole ? [
            'kode' => $selectedRole->kode,
            'nama_role' => $selectedRole->nama_role,
        ] : ['kode' => $requestedRole, 'nama_role' => $requestedRole]);
        $user->setAttribute('available_roles', $activeRoleCodes->values());

        return (new UserResource($user))->additional([
            'message' => 'Login berhasil.',
            'token_type' => 'Bearer',
            'access_token' => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     * Perlu header: Authorization: Bearer {token}
     */
    public function logout(LogoutRequest $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * GET /api/auth/me
     * Perlu header: Authorization: Bearer {token}
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }
}