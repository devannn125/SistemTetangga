<?php

namespace App\Providers;

use App\Services\RbacService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(RbacService::class);
    }

    public function boot(): void
    {
        // Data sensitif (kurang mampu, bansos, WNA) hanya utk RT/Sekretaris/Bendahara
        // (PRD 3.4). Dipakai CitizenResource untuk filtering response API.
        Gate::define('viewSensitive', function ($user) {
            return app(RbacService::class)->canViewSensitive($user);
        });
    }
}
