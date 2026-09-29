<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Wilayah;

class ChatbotAiService
{
    /**
     * Memanggil API ChatGPT gratis (via Pollinations)
     *
     * @param string $message Pesan dari Telegram
     * @param \App\Models\User|null $user Instance user jika ditemukan
     * @return string Balasan dari AI
     */
    public function getResponse(string $message, $user): string
    {
        $systemPrompt = $this->buildSystemPrompt($user);

        // Format Payload untuk Pollinations (OpenAI format)
        $payload = [
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ]
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(45)->retry(3, 2000)->post("https://text.pollinations.ai/", $payload);

            if ($response->successful()) {
                // Pollinations API mengembalikan plain text secara langsung!
                $text = $response->body();
                if (!empty($text)) {
                    return trim($text);
                }
            }

            Log::error('ChatGPT API Error:', ['status' => $response->status(), 'body' => $response->body()]);
            return "Mohon maaf, saya sedang mengalami kendala jaringan saat memproses pesan Anda. Silakan coba lagi sebentar lagi.";

        } catch (\Exception $e) {
            Log::error('ChatbotAiService Exception: ' . $e->getMessage());
            return "Mohon maaf, terjadi kesalahan pada server AI kami.";
        }
    }

    /**
     * Membangun konteks AI berdasarkan role user.
     */
    private function buildSystemPrompt($user): string
    {
        $basePrompt = "Anda adalah asisten virtual cerdas untuk Sistem Informasi Administrasi RT Digital (Sistem Tetangga). Tugas Anda adalah menjawab pertanyaan pengguna secara ringkas, jelas, dan profesional. Jawab dalam bahasa Indonesia. Jangan gunakan format Markdown berlebihan, cukup teks biasa yang mudah dibaca di Telegram. ";

        if (!$user) {
            return $basePrompt . "Pengguna yang mengirim pesan ini BELUM menautkan akun Telegram mereka dengan sistem. Beri tahu mereka dengan ramah bahwa mereka harus login ke aplikasi Sistem Tetangga dan menautkan akun Telegram mereka agar dapat mengakses fitur penuh.";
        }

        // Ambil role-role pengguna yang aktif
        $roles = [];
        if ($user->userRoles) {
            foreach ($user->userRoles as $ur) {
                if ($ur->status === 'ACTIVE' && $ur->role) {
                    $roles[] = $ur->role->nama_role;
                }
            }
        }

        $nama = $user->nama_users ?? 'Warga';
        $roleStr = count($roles) > 0 ? implode(', ', $roles) : 'Warga';

        $prompt = $basePrompt . "Saat ini Anda sedang berbicara dengan Bapak/Ibu {$nama}, yang memiliki peran sebagai: {$roleStr} di sistem. ";
        $prompt .= "BERIKUT ADALAH BATASAN AKSES DAN WEWENANG MEREKA (Jawablah sesuai wewenang ini):\n";

        // Tambahkan konteks spesifik berdasarkan role
        if (in_array('Administrator', $roles) || in_array('Admin', $roles)) {
            $prompt .= "- Sebagai Administrator, pengguna memiliki akses penuh ke seluruh fitur dan data sistem di tingkat mana pun.\n";
            $prompt .= "- Berwenang mengelola wewenang akun lain.\n";
            $prompt .= "- Boleh melihat data agregat dan total warga di seluruh wilayah kelurahan.\n";
        } elseif (in_array('Kepala Lurah', $roles) || in_array('Kepala Dukuh', $roles) || in_array('Ketua RW', $roles) || in_array('Ketua RT', $roles) || in_array('RT', $roles)) {
            $prompt .= "- Sebagai pimpinan wilayah (" . implode(', ', $roles) . "), pengguna memiliki hak akses manajerial untuk melihat data warga dan laporan di wilayahnya.\n";
            $prompt .= "- Berwenang menyetujui (approve) final permohonan surat warga.\n";
            $prompt .= "- Berwenang menyetujui tamu warga.\n";
            $prompt .= "- Mengatur jadwal shift siskamling dan menerima notifikasi panic button.\n";
            $prompt .= "- Mengelola struktur organisasi dan periode jabatan pengurus.\n";
            $prompt .= "- Boleh mengakses data statistik sensitif (warga kurang mampu, penyakit, bansos).\n";
            $prompt .= "- Boleh melihat data agregat dan total warga di wilayahnya.\n";
        } elseif (in_array('Sekretaris RT', $roles) || in_array('Sekretaris', $roles)) {
            $prompt .= "- Sebagai Sekretaris RT, bertugas memverifikasi kelengkapan dokumen surat sebelum diapprove Ketua RT.\n";
            $prompt .= "- Menginput/mengelola data kependudukan warga secara langsung.\n";
            $prompt .= "- Mengelola peraturan dan tata tertib RT.\n";
        } elseif (in_array('Bendahara RT', $roles) || in_array('Bendahara', $roles)) {
            $prompt .= "- Sebagai Bendahara RT, berwenang penuh mengelola keuangan, uang kas, dan pemasukan/pengeluaran.\n";
            $prompt .= "- Mengelola tagihan iuran per KK dan mengonfirmasi pembayaran.\n";
            $prompt .= "- Boleh mengakses data sensitif warga terkait penerima bansos.\n";
        } else {
            // Default warga
            $prompt .= "- Sebagai Warga biasa, pengguna hanya bisa mengelola data miliknya sendiri.\n";
            $prompt .= "- Bisa mengajukan permohonan surat keterangan.\n";
            $prompt .= "- Bisa mendaftarkan tamu yang menginap.\n";
            $prompt .= "- Bisa melihat laporan keuangan (publik).\n";
            $prompt .= "- Tidak memiliki wewenang untuk melihat data pribadi warga lain.\n";
        }

        $prompt .= "\nJika pengguna menanyakan hal yang di luar wewenangnya, tolak dengan sopan dan jelaskan bahwa mereka tidak memiliki akses tersebut.";
        
        // --- INJEKSI DATA REAL-TIME ---
        try {
            $dashboard = app(\App\Services\DashboardService::class)->summaryForUser($user);
            $prompt .= "\n\n=== INFORMASI DATA SISTEM REAL-TIME UNTUK WILAYAH PENGGUNA SAAT INI ===\n";
            $prompt .= "Gunakan data di bawah ini untuk menjawab jika pengguna bertanya tentang statistik atau data wilayah mereka:\n";
            $prompt .= "- Nama Wilayah yang dinaungi pengguna: " . ($dashboard['area'] ?? 'Seluruh Wilayah') . "\n";
            
            // Ambil nama dan total Dukuh, RW, RT
            $scopeIds = $dashboard['scopeIds'] ?? null;
            
            $wilayahQuery = Wilayah::query();
            if ($scopeIds !== null) {
                $wilayahQuery->whereIn('id_wilayah', $scopeIds);
            }
            
            $dukuhs = (clone $wilayahQuery)->where('tipe', 'DUKUH')->get();
            $rws = (clone $wilayahQuery)->where('tipe', 'RW')->get();
            $rts = (clone $wilayahQuery)->where('tipe', 'RT')->get();
            
            $prompt .= "- Total Dukuh di bawah wewenang pengguna: " . $dukuhs->count() . " Dukuh. (Daftar nama: " . implode(', ', $dukuhs->pluck('nama_wilayah')->toArray()) . ")\n";
            $prompt .= "- Total RW di bawah wewenang pengguna: " . $rws->count() . " RW. (Daftar nama: " . implode(', ', $rws->pluck('nama_wilayah')->toArray()) . ")\n";
            $prompt .= "- Total RT di bawah wewenang pengguna: " . $rts->count() . " RT. (Daftar nama: " . implode(', ', $rts->pluck('nama_wilayah')->toArray()) . ")\n";

            if (isset($dashboard['summaryCards'])) {
                foreach ($dashboard['summaryCards'] as $card) {
                    $prompt .= "- " . $card['title'] . ": " . $card['value'] . " (" . ($card['note'] ?? '') . ", " . ($card['detail'] ?? '') . ")\n";
                }
            }
            if (isset($dashboard['financeCards'])) {
                foreach ($dashboard['financeCards'] as $card) {
                    $prompt .= "- Keuangan: " . $card['title'] . ": " . $card['value'] . "\n";
                }
            }
            if (isset($dashboard['demografi'])) {
                $prompt .= "- Demografi Warga: Laki-laki (" . ($dashboard['demografi']['L'] ?? 0) . "), Perempuan (" . ($dashboard['demografi']['P'] ?? 0) . "), Total (" . ($dashboard['demografi']['total'] ?? 0) . ")\n";
            }
        } catch (\Exception $e) {
            // Abaikan jika gagal mengambil data real-time
        }

        return $prompt;
    }
}
