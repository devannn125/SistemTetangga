<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ChatbotAiService;

class ChatbotController extends Controller
{
    /**
     * Endpoint untuk menerima pesan dari Web Floating Chatbox
     */
    public function send(Request $request, ChatbotAiService $aiService)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'pathname' => 'nullable|string|max:255',
        ]);

        // Otomatis mengenali user yang sedang login via Sanctum (atau null jika guest)
        $user = $request->user('sanctum');

        // Fallback robust jika request tidak melalui middleware auth:sanctum
        if (!$user && $token = $request->bearerToken()) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && (!$accessToken->expires_at || !$accessToken->expires_at->isPast())) {
                $user = $accessToken->tokenable;
            }
        }

        if ($user) {
            $user->loadMissing(['citizen', 'userRoles.role']);
        }

        $reply = $aiService->getResponse(
            $request->input('message'),
            $user,
            $request->input('pathname')
        );

        return response()->json([
            'status' => 'success',
            'reply' => $reply,
        ]);
    }
}

