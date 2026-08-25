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
        'Ketua RW',
        'Ketua RT',
        'Sekretaris',
        'Bendahara',
    ];

    public const POSITION_TO_ROLE = [
        'Ketua RW' => 'KETUA_RW',
        'Ketua RT' => 'KETUA_RT',
        'Sekretaris' => 'SEKRETARIS',
        'Bendahara' => 'BENDAHARA',
    ];

    public const STRATEGIC_POSITION_GROUPS = [
        'KETUA_RW' => ['Ketua RW'],
        'KETUA_RT' => ['Ketua RT'],
        'SEKRETARIS' => ['Sekretaris'],
        'BENDAHARA' => ['Bendahara'],
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

    public static function getPositionGroup(string $jabatan): ?string
    {
        foreach (self::STRATEGIC_POSITION_GROUPS as $group => $positions) {
            if (in_array($jabatan, $positions)) {
                return $group;
            }
        }
        return null;
    }

    public static function getGroupPositions(string $group): array
    {
        return self::STRATEGIC_POSITION_GROUPS[$group] ?? [];
    }

    public static function checkUniqueStrategicPosition(string $jabatan, string $idWilayah, string $periodeMulai, ?string $excludeId = null): bool
    {
        $group = self::getPositionGroup($jabatan);
        if (!$group) {
            return true;
        }

        $groupPositions = self::getGroupPositions($group);

        $query = self::whereIn('jabatan', $groupPositions)
            ->where('id_wilayah', $idWilayah)
            ->where('periode_mulai', $periodeMulai)
            ->where('status_aktif', true);

        if ($excludeId) {
            $query->where('id_organization_member', '!=', $excludeId);
        }

        return !$query->exists();
    }

    public function getRoleCode(): ?string
    {
        return self::POSITION_TO_ROLE[$this->jabatan] ?? null;
    }

    public function getPositionGroupName(): ?string
    {
        return self::getPositionGroup($this->jabatan);
    }
}
