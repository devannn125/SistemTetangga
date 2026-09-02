<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class OrganizationMember extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'ORG';

    public const STRATEGIC_POSITIONS = [
        'Kepala Lurah',
        'Kepala Dukuh',
        'Ketua RW',
        'Ketua RT',
        'Sekretaris',
        'Bendahara',
    ];

    public const POSITION_TO_ROLE = [
        'Kepala Lurah' => 'LURAH',
        'Kepala Dukuh' => 'DUKUH',
        'Ketua RW' => 'RW',
        'Ketua RT' => 'RT',
        'Sekretaris' => 'SEKRETARIS',
        'Bendahara' => 'BENDAHARA',
        'Pengurus Siskamling' => 'SISKAMLING',
        'Ibu PKK' => 'PKK',
        'Karang Taruna' => 'KARANG_TARUNA',
    ];

    public $timestamps = false;

    protected $table = 'organization_member';

    protected $primaryKey = 'id_organization_member';

    protected $fillable = [
        'id_citizen', 'jabatan', 'id_wilayah',
        'periode_mulai', 'periode_selesai', 'foto_url', 'status_aktif',
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
        'status_aktif' => 'boolean',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_citizen', 'id_citizen');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function isStrategic(): bool
    {
        return in_array($this->jabatan, self::STRATEGIC_POSITIONS);
    }

    public static function isStrategicPosition(string $jabatan): bool
    {
        return in_array($jabatan, self::STRATEGIC_POSITIONS);
    }

    public const SYNC_USER_ROLE_POSITIONS = [
        'Kepala Lurah',
        'Kepala Dukuh',
        'Ketua RW',
        'Ketua RT',
        'Sekretaris',
        'Bendahara',
        'Pengurus Siskamling',
        'Ibu PKK',
        'Karang Taruna',
    ];

    public static function requiresUserRoleSync(string $jabatan): bool
    {
        return in_array($jabatan, self::SYNC_USER_ROLE_POSITIONS);
    }

    public function shouldSyncUserRole(): bool
    {
        return in_array($this->jabatan, self::SYNC_USER_ROLE_POSITIONS);
    }

    public static function isPositionTaken(string $jabatan, string $idWilayah, string $periodeMulai, ?string $excludeId = null): bool
    {
        // Only enforce uniqueness for strategic positions
        if (!self::isStrategicPosition($jabatan)) {
            return false;
        }

        $query = self::where('jabatan', $jabatan)
            ->where('id_wilayah', $idWilayah)
            ->where('periode_mulai', $periodeMulai)
            ->where('status_aktif', true);

        if ($excludeId) {
            $query->where('id_organization_member', '!=', $excludeId);
        }

        return $query->exists();
    }

    public static function hasInactiveHistory(string $jabatan, string $idWilayah, string $periodeMulai, ?string $excludeId = null): bool
    {
        // Only enforce for strategic positions
        if (!self::isStrategicPosition($jabatan)) {
            return false;
        }

        $query = self::where('jabatan', $jabatan)
            ->where('id_wilayah', $idWilayah)
            ->where('periode_mulai', $periodeMulai)
            ->where('status_aktif', false);

        if ($excludeId) {
            $query->where('id_organization_member', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function getRoleCode(): ?string
    {
        return self::POSITION_TO_ROLE[$this->jabatan] ?? null;
    }
}
