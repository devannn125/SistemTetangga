<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Webhook endpoint untuk menerima pesan/event dari Telegram Bot.
     * 
     * Cara setup:
     * 1. Buat bot di @BotFather dan dapatkan BOT_TOKEN.
     * 2. Daftarkan URL ini ke Telegram menggunakan metode setWebhook:
     *    https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<domain_anda>/api/telegram/webhook
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
            $text = $message['text'] ?? '';
            
            // 2. Logic dasar membalas pesan (template)
            if ($text === '/start') {
                $this->sendMessage($chatId, "Halo! Selamat datang di Sistem Administrasi RT Digital.");
            }
        }

        // 3. Selalu return 200 OK agar Telegram tidak mencoba mengirim ulang pesan (retry)
        return response()->json(['status' => 'success']);
    }

    /**
     * Contoh fungsi untuk mengirim pesan ke Telegram (bisa menggunakan HTTP Client bawaan Laravel)
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
