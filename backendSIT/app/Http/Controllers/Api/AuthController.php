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
     * Body: { "email": "...", "password": "..." }
     * `role` opsional. Jika tidak dikirim, role dipilih otomatis dari role aktif akun.
     */
    public function login(LoginRequest $request): JsonResponse|UserResource
    {
        $email = $request->validated('email');
        $password = $request->validated('password');
        $requestedRole = $request->validated('role'); // sudah di-uppercase di LoginRequest

        // Login hanya melalui email (sudah di-lowercase oleh LoginRequest).
        $user = User::with(['citizen', 'userRoles.role'])
            ->where('email', $email)
            ->first();

        if (! $user || ! $user->password_hash || ! Hash::check($password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
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

        // Role akun murni dari tabel user_role yang sedang aktif (ACTIVE + periode berjalan).
        // Tidak ada fallback implisit WARGA — setiap akun hanya bisa memakai role yang
        // benar-benar diberikan, mis. akun ADMIN hanya masuk sebagai ADMIN.
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

        if ($activeRoleCodes->isEmpty()) {
            throw ValidationException::withMessages([
                'email' => ['Akun ini tidak memiliki role aktif.'],
            ]);
        }

        if (! $requestedRole) {
            // Auto-pilih role: jabatan strategis didahulukan, sisanya level terkecil.
            $selectedRole = $user->userRoles
                ->filter(fn ($ur) => $activeRoleCodes->contains($ur->role->kode))
                ->sortBy(fn ($ur) => [$ur->role->is_strategic ? 0 : 1, $ur->role->level])
                ->first()
                ?->role;

            $requestedRole = $selectedRole?->kode;

            if (! $requestedRole) {
                throw ValidationException::withMessages([
                    'email' => ['Tidak dapat menentukan role akun.'],
                ]);
            }
        } elseif (! $activeRoleCodes->contains($requestedRole)) {
            throw ValidationException::withMessages([
                'role' => ["Akun ini tidak memiliki akses sebagai {$requestedRole}."],
            ]);
        } else {
            $selectedRole = Role::where('kode', $requestedRole)->first();
        }

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
     * POST /api/auth/change-password
     * Body: { "current_password": "...", "new_password": "..." } (auth)
     */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! $user->password_hash || ! Hash::check($data['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama salah.'],
            ]);
        }

        $user->forceFill(['password_hash' => $data['new_password']])->save();

        return response()->json([
            'message' => 'Password berhasil diubah.',
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
        $user = $request->user()->load(['userRoles.role', 'citizen']);
        $today = now()->toDateString();

        $roles = $user->userRoles
            ->filter(function ($userRole) use ($today) {
                return $userRole->status === 'ACTIVE'
                    && (! $userRole->periode_mulai || $userRole->periode_mulai->toDateString() <= $today)
                    && (! $userRole->periode_selesai || $userRole->periode_selesai->toDateString() >= $today);
            })
            ->sortBy(fn ($ur) => [$ur->role?->is_strategic ? 0 : 1, $ur->role?->level])
            ->values();

        $selectedRole = $roles->first()?->role;

        $user->setAttribute('nik', $user->citizen->nik ?? null);
        $user->setAttribute('active_role', $selectedRole ? [
            'kode' => $selectedRole->kode,
            'nama_role' => $selectedRole->nama_role,
        ] : null);
        $user->setAttribute('available_roles', $roles->pluck('role.kode')->filter()->values());

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
