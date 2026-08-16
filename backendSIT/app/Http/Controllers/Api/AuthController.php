<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthLoginRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(AuthLoginRequest $request)
    {
        $data = $request->validated();
        $identifier = trim($data['identifier']);
        $requestedRole = strtoupper($data['role']);

        $user = User::query()
            ->leftJoin('citizen', 'citizen.id_citizen', '=', 'users.id_citizen')
            ->where(function ($query) use ($identifier): void {
                $query
                    ->where('users.email', $identifier)
                    ->orWhere('users.no_hp', $identifier)
                    ->orWhere('citizen.nik', $identifier)
                    ->orWhere('users.id_users', $identifier);
            })
            ->select('users.*', 'citizen.nik')
            ->first();

        if (! $user || ! $user->password_hash || ! Hash::check($data['password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'identifier' => ['NIK/ID atau kata sandi tidak sesuai.'],
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            throw ValidationException::withMessages([
                'identifier' => ['Akun belum aktif atau sedang dinonaktifkan.'],
            ]);
        }

        $roles = $this->rolesFor($user->id_users);

        if ($user->id_citizen && ! $roles->contains('kode', 'WARGA')) {
            $roles->push((object) ['kode' => 'WARGA', 'nama_role' => 'Warga']);
        }

        $role = $roles->firstWhere('kode', $requestedRole);

        if (! $role) {
            throw ValidationException::withMessages([
                'role' => ['Akun ini tidak memiliki akses sebagai '.$requestedRole.'.'],
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return new AuthUserResource([
            'id_users' => $user->id_users,
            'nama_users' => $user->nama_users,
            'email' => $user->email,
            'no_hp' => $user->no_hp,
            'id_citizen' => $user->id_citizen,
            'role' => [
                'kode' => $role->kode,
                'nama_role' => $role->nama_role,
            ],
            'redirect_to' => match ($role->kode) {
                'WARGA' => '/warga',
                'ADMIN', 'DUKUH' => '/dashboard',
                default => '/role/'.strtolower($role->kode),
            },
        ]);
    }

    private function rolesFor(string $userId)
    {
        return DB::table('user_role')
            ->join('role', 'role.id_role', '=', 'user_role.id_role')
            ->where('user_role.id_users', $userId)
            ->where('user_role.status', 'ACTIVE')
            ->select('role.kode', 'role.nama_role')
            ->get();
    }
}
