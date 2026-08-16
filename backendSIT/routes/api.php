<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FeeBillController;
use App\Http\Controllers\Api\FinanceTransactionController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\LetterRequestController;
use Illuminate\Support\Facades\Route;

Route::get('dashboard', DashboardController::class);
Route::post('auth/login', [AuthController::class, 'login']);
Route::apiResource('citizens', CitizenController::class);
Route::apiResource('families', FamilyController::class);
Route::apiResource('houses', HouseController::class);
Route::apiResource('letter-requests', LetterRequestController::class);
Route::apiResource('announcements', AnnouncementController::class);
Route::apiResource('finance-transactions', FinanceTransactionController::class);
Route::apiResource('fee-bills', FeeBillController::class);
Route::apiResource('complaints', ComplaintController::class);
Route::apiResource('feedback', FeedbackController::class);
