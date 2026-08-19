<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Menghasilkan primary key sekuensial berformat "PREFIX-001".
 * Model pengguna wajib mendefinisikan `public const ID_PREFIX = 'XXX';`.
 */
trait HasSequentialId
{
    public function initializeHasSequentialId(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }

    protected static function bootHasSequentialId(): void
    {
        static::creating(function ($model): void {
            $key = $model->getKeyName();

            if (empty($model->{$key})) {
                $model->{$key} = static::nextSequentialId($key);
            }
        });
    }

    protected static function nextSequentialId(string $keyName): string
    {
        $prefix = static::ID_PREFIX;
        $pattern = $prefix.'-%';

        $keys = static::query()
            ->where($keyName, 'like', $pattern)
            ->pluck($keyName)
            ->map(fn (string $key) => (int) Str::after($key, $prefix.'-'));

        $number = $keys->isNotEmpty() ? $keys->max() + 1 : 1;

        return $prefix.'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }
}
