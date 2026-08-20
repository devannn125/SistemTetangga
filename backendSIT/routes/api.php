<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitizenController;
use App\Http\Controllers\Api\CitizenHistoryController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DigitalSignatureController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\FeeBillController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FinanceTransactionController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\HousePhotoController;
use App\Http\Controllers\Api\KosRoomController;
use App\Http\Controllers\Api\LetterRequestController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\NotificationLogController;
use App\Http\Controllers\Api\NotificationSubscriptionController;
use App\Http\Controllers\Api\OrganizationMemberController;
use App\Http\Controllers\Api\PermissionActionController;
use App\Http\Controllers\Api\PermissionOverrideController;
use App\Http\Controllers\Api\RegulationController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\SiskamlingCheckinController;
use App\Http\Controllers\Api\SiskamlingIncidentController;
use App\Http\Controllers\Api\SiskamlingScheduleController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Controllers\Api\UserSessionController;
use App\Http\Controllers\Api\WilayahController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

// Dashboard agregat statistik (publik, dipakai halaman login/landing).
Route::get('/dashboard', DashboardController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Kependudukan & Keluarga.
    Route::get('/citizens/me', [CitizenController::class, 'me']);
    Route::apiResource('citizens', CitizenController::class);
    Route::get('/citizens/{citizen}/history', [CitizenHistoryController::class, 'index']);
    Route::get('/citizen-history', [CitizenHistoryController::class, 'index']);
    Route::get('/citizen-history/{id}', [CitizenHistoryController::class, 'show']);
    Route::apiResource('families', FamilyController::class);

    // Perumahan & Kos.
    Route::get('/houses/mine', [HouseController::class, 'mine']);
    Route::apiResource('houses', HouseController::class);
    Route::apiResource('house-photos', HousePhotoController::class);
    Route::apiResource('kos-rooms', KosRoomController::class);

    // Tamu.
    Route::apiResource('guests', GuestController::class);

    // Surat & Tanda Tangan Digital.
    Route::apiResource('letter-requests', LetterRequestController::class);
    Route::apiResource('digital-signatures', DigitalSignatureController::class);

    // Siskamling.
    Route::apiResource('siskamling-schedules', SiskamlingScheduleController::class);
    Route::apiResource('siskamling-checkins', SiskamlingCheckinController::class);
    Route::apiResource('siskamling-incidents', SiskamlingIncidentController::class);

    // Organisasi & Regulasi.
    Route::apiResource('organization-members', OrganizationMemberController::class);
    Route::apiResource('regulations', RegulationController::class);

    // Pengumuman, Feedback, Pengaduan.
    Route::apiResource('announcements', AnnouncementController::class);
    Route::apiResource('feedback', FeedbackController::class);
    Route::apiResource('complaints', ComplaintController::class);

    // Keuangan & Iuran.
    Route::apiResource('finance-transactions', FinanceTransactionController::class);
    Route::apiResource('fee-bills', FeeBillController::class);

    // Notifikasi.
    Route::apiResource('notification-logs', NotificationLogController::class);
    Route::get('/notification-subscriptions', [NotificationSubscriptionController::class, 'index']);
    Route::post('/notification-subscriptions', [NotificationSubscriptionController::class, 'store']);
    Route::delete('/notification-subscriptions/{idUsers}/{category}', [NotificationSubscriptionController::class, 'destroy']);

    // Master & Wilayah.
    Route::apiResource('master-data', MasterDataController::class);
    Route::apiResource('wilayah', WilayahController::class);

    // RBAC & User Management.
    Route::apiResource('users', UserManagementController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('user-roles', UserRoleController::class);
    Route::apiResource('modules', ModuleController::class);
    Route::apiResource('permission-actions', PermissionActionController::class);
    Route::apiResource('role-permissions', RolePermissionController::class);
    Route::apiResource('permission-overrides', PermissionOverrideController::class);
    Route::apiResource('user-sessions', UserSessionController::class);

    // Audit.
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);
});
