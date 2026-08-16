<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasUuidPrimaryKey
{
    public function initializeHasUuidPrimaryKey(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }

    protected static function bootHasUuidPrimaryKey(): void
    {
        static::creating(function ($model): void {
            $key = $model->getKeyName();

            if (! $model->{$key}) {
                $model->{$key} = (string) Str::uuid();
            }
        });
    }
}
