<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Wilayah;

class ChatbotAiService
{
    /**
     * Memeriksa apakah pesan pengguna berusaha menanyakan hal-hal teknis/sistem
     */
    public function isTechnicalQuestion(string $message): bool
    {
        $patterns = [
            '/\b(tech|tect)\s*stack/i',
            '/\bstack(nya| apa)?\b/i',
            '/\bframework/i',
            '/\b(laravel|codeigniter|react|vue|angular|tailwind|bootstrap|docker|nginx|apache)\b/i',
            '/\b(source\s*code|sourcecode|coding|koding)/i',
            '/\bbahasa\s*(pemrograman|apa)/i',
            '/\b(arsitektur|infrastruktur)/i',
            '/\b(backend|front-?end|database|db|server)\s*(pake|pakai|menggunakan|apa|nya)/i',
            '/\b(dibuat|dibangun)\s*(pake|pakai|menggunakan|dengan)\s*apa/i',
            '/\b(api\s*key|token\s*bot|\.env|github|gitlab|ci\/?cd|repository|repo)\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Memanggil API ChatGPT gratis (via Pollinations)
     *
     * @param string $message Pesan dari Telegram
     * @param \App\Models\User|null $user Instance user jika ditemukan
     * @return string Balasan dari AI
     */
    public function getResponse(string $message, $user): string
    {
        // 1. Filter Keamanan Teknis (Hard Guardrail)
        if ($this->isTechnicalQuestion($message)) {
            return "Mohon maaf, informasi mengenai arsitektur teknis, teknologi, dan infrastruktur sistem bersifat rahasia/internal pengembang dan tidak dapat dibagikan. Saya hanya dapat membantu terkait informasi administrasi dan layanan masyarakat.";
        }

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
     * Membangun konteks AI berdasarkan role user dengan proteksi ketat.
     */
    private function buildSystemPrompt($user): string
    {
        $basePrompt = <<<PROMPT
Anda adalah asisten virtual resmi untuk Sistem Informasi Administrasi RT Digital (Sistem Tetangga).
Tugas Anda HANYA membantu pelayanan administrasi kemasyarakatan (seperti informasi surat, kepengurusan wilayah, jadwal, pengaduan, dan data statistik warga yang diizinkan).
Jawab dalam bahasa Indonesia yang ringkas, sopan, dan jelas. Hindari markdown berlebihan.

=== KEBIJAKAN KEAMANAN & BATASAN KETAT (WAJIB DIPATUHI) ===
1. KEAMANAN & KERAHASIAAN SISTEM TEKNIS:
   - DILARANG KERAS menjawab atau membocorkan informasi teknis internal sistem, termasuk: tech stack, framework, bahasa pemrograman, arsitektur database, konfigurasi server, API internal, source code, infrastruktur, atau detail teknis pengembang lainnya.
   - Jika ditanya tentang teknologi, sistem internal, pembuatan sistem, atau tech stack yang digunakan, JAWAB DENGAN TEGAS DAN SOPAN:
     "Mohon maaf, informasi mengenai arsitektur teknis dan teknologi sistem bersifat rahasia/internal pengembang dan tidak dapat dibagikan."

2. PEMBATASAN WEWENANG & AKSES DATA (RBAC):
   - Jawab pertanyaan HANYA berdasarkan batasan peran pengguna dan data resmi yang tercantum di bawah.
   - JANGAN PERNAH memberikan informasi di luar wewenang role pengguna atau di luar wilayah cakupan mereka.
   - Jika pengguna menanyakan hal yang di luar wewenangnya (misalnya warga biasa menanyakan data warga lain, NIK, bansos, kas privat, atau pimpinan menanyakan wilayah lain di luar wewenangnya), TOLAK DENGAN TEGAS DAN SOPAN:
     "Mohon maaf, Anda tidak memiliki kewenangan atau hak akses untuk melihat informasi tersebut."
   - Jangan pernah berhalusinasi, berspekulasi, atau mengarang data yang tidak ada di sistem.
PROMPT;

        if (!$user) {
            return $basePrompt . "\n\nPengguna saat ini BELUM menautkan akun Telegram ke sistem. Jelaskan bahwa mereka harus login ke aplikasi Sistem Tetangga dan klik logo Telegram untuk menautkan akun agar dapat dilayani sesuai peran.";
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

        $isPengurus = in_array('Administrator', $roles) || in_array('Admin', $roles)
            || in_array('Kepala Lurah', $roles) || in_array('Kepala Dukuh', $roles)
            || in_array('Ketua RW', $roles) || in_array('Ketua RT', $roles) || in_array('RT', $roles)
            || in_array('Sekretaris RT', $roles) || in_array('Sekretaris', $roles)
            || in_array('Bendahara RT', $roles) || in_array('Bendahara', $roles);

        $prompt = $basePrompt . "\n\nSaat ini Anda sedang berbicara dengan Bapak/Ibu {$nama}, dengan peran: {$roleStr} di sistem.\n";
        $prompt .= "BATASAN AKSES DAN WEWENANG ROLE INI:\n";

        // Tambahkan konteks spesifik berdasarkan role
        if (in_array('Administrator', $roles) || in_array('Admin', $roles)) {
            $prompt .= "- Sebagai Administrator, berwenang mengelola data operasional sistem dan melihat statistik wilayah di seluruh kelurahan.\n";
            $prompt .= "- Tetap DILARANG membocorkan rahasia arsitektur teknis sistem/server/source code.\n";
        } elseif (in_array('Kepala Lurah', $roles) || in_array('Kepala Dukuh', $roles) || in_array('Ketua RW', $roles) || in_array('Ketua RT', $roles) || in_array('RT', $roles)) {
            $prompt .= "- Sebagai pimpinan wilayah (" . implode(', ', $roles) . "), berwenang memantau data kependudukan dan laporan di wilayahnya sendiri.\n";
            $prompt .= "- DILARANG melihat data privat di wilayah lain yang bukan di bawah wewenangnya.\n";
        } elseif (in_array('Sekretaris RT', $roles) || in_array('Sekretaris', $roles)) {
            $prompt .= "- Sebagai Sekretaris RT, bertugas memverifikasi kelengkapan dokumen surat dan administrasi kependudukan di RT-nya.\n";
            $prompt .= "- DILARANG mengakses keuangan kas RT atau wilayah RT lain.\n";
        } elseif (in_array('Bendahara RT', $roles) || in_array('Bendahara', $roles)) {
            $prompt .= "- Sebagai Bendahara RT, berwenang mengelola keuangan kas dan iuran di RT-nya.\n";
            $prompt .= "- DILARANG mengakses data di luar wilayah RT-nya.\n";
        } else {
            // Warga biasa
            $prompt .= "- Sebagai Warga biasa, HANYA berwenang mengurus keperluannya sendiri (surat mandiri, tamu, pengaduan).\n";
            $prompt .= "- Boleh melihat daftar nama pejabat/pengurus wilayah (Kepala Dukuh, RT, RW) untuk keperluan kontak/pengaduan.\n";
            $prompt .= "- DILARANG KERAS mengakses data pribadi warga lain (daftar nama warga, NIK, alamat lengkap, pekerjaan, status ekonomi, bansos).\n";
            $prompt .= "- DILARANG mengakses rincian saldo kas internal pengurus.\n";
        }

        // --- INJEKSI DATA REAL-TIME ---
        try {
            $dashboard = app(\App\Services\DashboardService::class)->summaryForUser($user);
            $prompt .= "\n=== DATA RESMI SISTEM REAL-TIME UNTUK PENGGUNA SAAT INI ===\n";
            $prompt .= "- Wilayah wewenang pengguna: " . ($dashboard['area'] ?? 'Seluruh Wilayah') . "\n";
            
            // Ambil nama dan total Dukuh, RW, RT
            $scopeIds = $dashboard['scopeIds'] ?? null;
            
            $wilayahQuery = Wilayah::query();
            if ($scopeIds !== null) {
                $wilayahQuery->whereIn('id_wilayah', $scopeIds);
            }
            
            $dukuhs = (clone $wilayahQuery)->where('tipe', 'DUKUH')->get();
            $rws = (clone $wilayahQuery)->where('tipe', 'RW')->get();
            $rts = (clone $wilayahQuery)->where('tipe', 'RT')->get();
            
            $prompt .= "- Total Dukuh di bawah wewenang: " . $dukuhs->count() . " Dukuh. (" . implode(', ', $dukuhs->pluck('nama_wilayah')->toArray()) . ")\n";
            $prompt .= "- Total RW di bawah wewenang: " . $rws->count() . " RW. (" . implode(', ', $rws->pluck('nama_wilayah')->toArray()) . ")\n";
            $prompt .= "- Total RT di bawah wewenang: " . $rts->count() . " RT. (" . implode(', ', $rts->pluck('nama_wilayah')->toArray()) . ")\n";

            // Ambil data pejabat/struktur organisasi aktif (Kepala Dukuh, RT, RW, Lurah, dll)
            $orgQuery = \App\Models\OrganizationMember::with(['citizen', 'wilayah'])
                ->where('status_aktif', true);
            if ($scopeIds !== null) {
                $orgQuery->whereIn('id_wilayah', $scopeIds);
            }
            $orgMembers = $orgQuery->get();
            if ($orgMembers->isNotEmpty()) {
                $prompt .= "- Pejabat / Pengurus Wilayah Aktif:\n";
                foreach ($orgMembers as $om) {
                    $jabatan = $om->jabatan;
                    $namaPejabat = $om->citizen->nama_lengkap ?? 'Tidak diketahui';
                    $namaWil = $om->wilayah->nama_wilayah ?? '';
                    $tipeWil = $om->wilayah->tipe ?? '';
                    $prompt .= "  * {$jabatan} ({$tipeWil} {$namaWil}): {$namaPejabat}\n";
                }
            }

            // HANYA Pengurus/Pimpinan yang boleh melihat daftar nama warga
            if ($isPengurus) {
                $citizensQuery = \App\Models\Citizen::with('wilayah')->where('status_aktif', true);
                if ($scopeIds !== null) {
                    $citizensQuery->whereIn('id_wilayah', $scopeIds);
                }
                $citizens = $citizensQuery->get(['id_citizen', 'nama_lengkap', 'id_wilayah']);
                if ($citizens->isNotEmpty()) {
                    $prompt .= "- Daftar Warga di bawah wewenang (Total " . $citizens->count() . " warga):\n";
                    foreach ($citizens as $c) {
                        $wilDesc = $c->wilayah ? "({$c->wilayah->tipe} {$c->wilayah->nama_wilayah})" : "";
                        $prompt .= "  * {$c->nama_lengkap} {$wilDesc}\n";
                    }
                }

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
                    $prompt .= "- Demografi: Laki-laki (" . ($dashboard['demografi']['L'] ?? 0) . "), Perempuan (" . ($dashboard['demografi']['P'] ?? 0) . "), Total (" . ($dashboard['demografi']['total'] ?? 0) . ")\n";
                }
            }
        } catch (\Exception $e) {
            // Abaikan jika gagal mengambil data real-time
        }

        return $prompt;
    }
}
