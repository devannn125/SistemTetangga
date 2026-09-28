<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramPoll extends Command
{
    protected $signature = 'telegram:poll';
    protected $description = 'Listen for Telegram messages locally via long polling';

    public function handle()
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        if (!$token) {
            $this->error('TELEGRAM_BOT_TOKEN not found in .env');
            return;
        }

        $this->info("Menghapus webhook lama (jika ada) agar fitur polling aktif...");
        // First, ensure webhook is removed so getUpdates can work
        Http::post("https://api.telegram.org/bot{$token}/deleteWebhook");

        $this->info("Berhasil! Sedang mendengarkan pesan masuk dari Telegram... (Tekan Ctrl+C untuk berhenti)");

        $offset = 0;
        $aiService = new \App\Services\ChatbotAiService();
        
        while (true) {
            try {
                $response = Http::timeout(35)->get("https://api.telegram.org/bot{$token}/getUpdates", [
                    'offset' => $offset,
                    'timeout' => 30, // long polling timeout
                ]);

                if ($response->successful() && isset($response['result'])) {
                    foreach ($response['result'] as $update) {
                        $offset = $update['update_id'] + 1; // Mark as read
                        
                        if (isset($update['message'])) {
                            $message = $update['message'];
                            $chatId = $message['chat']['id'] ?? null;
                            $text = trim($message['text'] ?? '');
                            
                            $username = $message['from']['first_name'] ?? 'Unknown';
                            $this->line("<fg=cyan>Pesan masuk dari {$username}</>: {$text}");

                            // Cek apakah ini pesan /start dengan parameter kode (Deep Link)
                            if (str_starts_with($text, '/start ')) {
                                $parts = explode(' ', $text);
                                if (count($parts) > 1) {
                                    $code = $parts[1];
                                    $id_users = \Illuminate\Support\Facades\Cache::get('tg_link_' . $code);
                                    
                                    if ($id_users) {
                                        $userToLink = \App\Models\User::find($id_users);
                                        if ($userToLink) {
                                            $userToLink->telegram_chat_id = $chatId;
                                            $userToLink->save();
                                            \Illuminate\Support\Facades\Cache::forget('tg_link_' . $code);
                                            
                                            $reply = "Berhasil! Akun Telegram ini sekarang tertaut dengan user {$userToLink->nama_users} ({$userToLink->email}). Anda sekarang dikenali sesuai wewenang Anda di sistem.";
                                            $this->sendMessage($token, $chatId, $reply);
                                            continue; // Lanjut ke pesan berikutnya
                                        }
                                    } else {
                                        $this->sendMessage($token, $chatId, "Maaf, kode tautan sudah kadaluarsa atau tidak valid. Silakan buat ulang tautan dari website.");
                                        continue;
                                    }
                                }
                            }

                            // Cari User di database berdasarkan telegram_chat_id
                            $user = \App\Models\User::with('userRoles.role')->where('telegram_chat_id', $chatId)->first();

                            // Logic membalas pesan dengan AI
                            if ($text === '/start') {
                                if ($user) {
                                    $reply = "Halo {$user->nama_users}! Selamat datang kembali di Sistem Administrasi RT Digital.";
                                } else {
                                    $reply = "Halo! Selamat datang di Sistem Administrasi RT Digital. Sepertinya akun Anda belum ditautkan ke sistem kami.";
                                }
                                $this->sendMessage($token, $chatId, $reply);
                            } else {
                                // Lempar ke AI
                                $this->line("<fg=yellow>Sedang memproses AI...</>");
                                $this->sendChatAction($token, $chatId, 'typing');
                                $reply = $aiService->getResponse($text, $user);
                                $this->sendMessage($token, $chatId, $reply);
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Connection error: " . $e->getMessage());
                sleep(2);
            }
        }
    }

    private function sendChatAction($token, $chatId, $action = 'typing')
    {
        try {
            \Illuminate\Support\Facades\Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendChatAction", [
                'chat_id' => $chatId,
                'action' => $action,
            ]);
        } catch (\Exception $e) {
            // Abaikan jika gagal mengirim action
        }
    }

    private function sendMessage($token, $chatId, $text)
    {
        try {
            \Illuminate\Support\Facades\Http::retry(3, 1000)->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
            ]);
            $this->line("<fg=green>Membalas ke {$chatId}</>: {$text}\n");
        } catch (\Exception $e) {
            $this->error("Gagal mengirim pesan balasan ke Telegram: " . $e->getMessage());
        }
    }
}
