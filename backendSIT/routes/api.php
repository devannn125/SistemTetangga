<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::prefix('citizens')->group(function () {
        Route::get('/', [CitizenController::class, 'index'])->name('citizens.index');
        Route::get('/me', [CitizenController::class, 'me'])->name('citizens.me');
        Route::get('/{citizen}', [CitizenController::class, 'show'])->name('citizens.show');
        Route::post('/', [CitizenController::class, 'store'])->name('citizens.store');
        Route::put('/{citizen}', [CitizenController::class, 'update'])->name('citizens.update');
        Route::patch('/{citizen}', [CitizenController::class, 'update']);
        Route::delete('/{citizen}', [CitizenController::class, 'destroy'])->name('citizens.destroy');
    });
});

Route::get('/dashboard', DashboardController::class);