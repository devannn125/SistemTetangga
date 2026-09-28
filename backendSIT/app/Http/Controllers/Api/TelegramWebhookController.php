<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TelegramWebhookController extends Controller
{
    public function generateLink(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Generate 6 digit code
        $code = random_int(100000, 999999);
        
        // Simpan ke cache berlaku 15 menit
        Cache::put('tg_link_' . $code, $user->id_users, now()->addMinutes(15));

        return response()->json([
            'status' => 'success',
            'code' => $code,
            'url' => "https://t.me/SistemTetangga_bot?start=" . $code
        ]);
    }

    /**
     * Webhook endpoint untuk menerima pesan/event dari Telegram Bot.
     */
    public function handle(Request $request)
    {
        // 1. Ambil data dari request
        $update = $request->all();
        
        // Log untuk keperluan debugging
        Log::info('Telegram Webhook Payload:', $update);

        if (isset($update['message'])) {
            $message = $update['message'];
            $chatId = $message['chat']['id'] ?? null;
            $text = trim($message['text'] ?? '');
            
            // Cek apakah ini pesan /start dengan parameter kode
            if (str_starts_with($text, '/start ')) {
                $parts = explode(' ', $text);
                if (count($parts) > 1) {
                    $code = $parts[1];
                    $id_users = Cache::get('tg_link_' . $code);
                    
                    if ($id_users) {
                        $userToLink = \App\Models\User::find($id_users);
                        if ($userToLink) {
                            $userToLink->telegram_chat_id = $chatId;
                            $userToLink->save();
                            Cache::forget('tg_link_' . $code);
                            
                            $reply = "Berhasil! Akun Telegram ini sekarang tertaut dengan user {$userToLink->nama_users} ({$userToLink->email}). Anda sekarang dikenali sesuai wewenang Anda di sistem.";
                            $this->sendMessage($chatId, $reply);
                            return response()->json(['status' => 'success']);
                        }
                    } else {
                        $this->sendMessage($chatId, "Maaf, kode tautan sudah kadaluarsa atau tidak valid. Silakan buat ulang tautan dari website.");
                        return response()->json(['status' => 'success']);
                    }
                }
            }

            // Cari User di database
            $user = \App\Models\User::with('userRoles.role')->where('telegram_chat_id', $chatId)->first();
            $aiService = new \App\Services\ChatbotAiService();

            if ($text === '/start') {
                if ($user) {
                    $reply = "Halo {$user->nama_users}! Selamat datang kembali di Sistem Administrasi RT Digital.";
                } else {
                    $reply = "Halo! Selamat datang di Sistem Administrasi RT Digital. Sepertinya akun Anda belum ditautkan ke sistem kami.";
                }
                $this->sendMessage($chatId, $reply);
            } else {
                $this->sendChatAction($chatId, 'typing');
                $reply = $aiService->getResponse($text, $user);
                $this->sendMessage($chatId, $reply);
            }
        }

        // 3. Selalu return 200 OK
        return response()->json(['status' => 'success']);
    }

    private function sendChatAction($chatId, $action = 'typing')
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        $url = "https://api.telegram.org/bot{$token}/sendChatAction";
        
        try {
            \Illuminate\Support\Facades\Http::timeout(3)->post($url, [
                'chat_id' => $chatId,
                'action' => $action,
            ]);
        } catch (\Exception $e) {
            // Ignore
        }
    }

    /**
     * Contoh fungsi untuk mengirim pesan ke Telegram
     */
    private function sendMessage($chatId, $text)
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        $url = "https://api.telegram.org/bot{$token}/sendMessage";
        
        \Illuminate\Support\Facades\Http::post($url, [
            'chat_id' => $chatId,
            'text' => $text,
        ]);
    }
}
