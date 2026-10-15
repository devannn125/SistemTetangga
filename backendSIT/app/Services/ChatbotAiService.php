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
     * @param string $message Pesan dari Telegram atau Web
     * @param \App\Models\User|null $user Instance user jika ditemukan
     * @param string|null $pathname Halaman web aktif pengguna jika ada
     * @return string Balasan dari AI
     */
    public function getResponse(string $message, $user, ?string $pathname = null): string
    {
        // 1. Filter Keamanan Teknis (Hard Guardrail)
        if ($this->isTechnicalQuestion($message)) {
            return "Mohon maaf, informasi mengenai arsitektur teknis, teknologi, dan infrastruktur sistem bersifat rahasia/internal pengembang dan tidak dapat dibagikan. Saya hanya dapat membantu terkait informasi administrasi dan layanan masyarakat.";
        }

        $systemPrompt = $this->buildSystemPrompt($user, $pathname);

        // Format Payload untuk Pollinations (OpenAI format - tanpa model berbayar agar gratis dan stabil)
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
            ],
        ];

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(35)->post("https://text.pollinations.ai/", $payload);

                if ($response->successful()) {
                    $text = trim($response->body());
                    if (!empty($text)) {
                        return $text;
                    }
                }

                if ($response->status() === 402) {
                    Log::warning("Pollinations 402 cooldown, attempt {$attempt}, sleeping 2s...");
                    sleep(2);
                    continue;
                }

                Log::error('ChatGPT API Error:', ['status' => $response->status(), 'body' => $response->body()]);
            } catch (\Exception $e) {
                Log::error('ChatbotAiService Exception: ' . $e->getMessage());
                if ($attempt < 3) {
                    sleep(2);
                    continue;
                }
            }
        }

        return "Mohon maaf, saya sedang mengalami kendala jaringan saat memproses pesan Anda. Silakan coba lagi sebentar lagi.";
    }

    /**
     * Membangun konteks AI berdasarkan role user dengan proteksi ketat.
     */
    /**
     * Membangun konteks AI berdasarkan role user dengan proteksi ketat.
     */
    private function buildSystemPrompt($user, ?string $pathname = null): string
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
            return $basePrompt . "\n\nPengguna saat ini BELUM login atau belum menautkan akun. Jelaskan bahwa mereka harus login ke aplikasi Sistem Tetangga agar dapat dilayani sesuai peran dan wewenangnya.";
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

        // Tambahkan konteks halaman aktif jika dikirimkan oleh web chatbox
        if ($pathname) {
            $cleanPath = trim($pathname);
            $pageName = match (true) {
                str_contains($cleanPath, '/struktur') => 'Struktur Organisasi (Hirarki Pengurus Kelurahan, Dukuh, RW, dan RT)',
                str_contains($cleanPath, '/perangkat') => 'Perangkat Desa & Daftar Pengurus',
                str_contains($cleanPath, '/warga') => 'Kependudukan & Data Warga',
                str_contains($cleanPath, '/wilayah') => 'Manajemen Wilayah',
                str_contains($cleanPath, '/users') => 'Manajemen Pengguna & Akun',
                str_contains($cleanPath, '/keuangan') => 'Keuangan, Kas, dan Iuran Wilayah',
                str_contains($cleanPath, '/surat') => 'Pengajuan & Layanan Surat',
                str_contains($cleanPath, '/pengaduan') => 'Layanan Pengaduan Warga',
                str_contains($cleanPath, '/ronda') || str_contains($cleanPath, '/siskamling') => 'Jadwal Siskamling & Ronda',
                str_contains($cleanPath, '/peraturan') => 'Peraturan & Regulasi Wilayah',
                str_contains($cleanPath, '/portal') => 'Manajemen Portal Berita & Profil Landing',
                default => 'Beranda / Dashboard Sistem',
            };
            $prompt .= "Konteks Tampilan: Pengguna saat ini sedang membuka halaman '{$pageName}' (URL: {$cleanPath}). Jawablah pertanyaan pengguna sesuai dengan data resmi sistem yang tertampil pada halaman ini.\n";
        }

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

            // Injeksi Hirarki Struktur Organisasi (Lurah -> Dukuh -> RW -> RT)
            $prompt .= "\n- HIERARKI STRUKTUR ORGANISASI & PENGURUS WILAYAH (SESUAI HALAMAN STRUKTUR ORGANISASI):\n";
            $prompt .= $this->buildStrukturOrganisasiText($scopeIds) . "\n";
            $prompt .= "  * Petunjuk Jawaban Pengurus:\n";
            $prompt .= "    - Jika pengguna bertanya siapa pejabat di wilayah tertentu (misal: 'Siapa kepala dukuh Wangon?'), jawab langsung nama pejabatnya (misal: 'Kepala Dukuh Wangon adalah Devan').\n";
            $prompt .= "    - Jika posisi tertulis 'Belum ada pengurus' / 'Belum ada Kepala Dukuh', jawab dengan jujur dan jelas bahwa posisi tersebut saat ini belum ada pengurus / masih kosong.\n";
            $prompt .= "    - Hirarki: RT berada di bawah naungan RW, RW berada di bawah Dukuh, dan Dukuh berada di bawah Kelurahan.\n";

            // Ringkasan Pengurus Aktif (Direct Flat Lookup)
            $orgQuery = \App\Models\OrganizationMember::with(['citizen', 'wilayah'])
                ->where('status_aktif', true);
            if ($scopeIds !== null) {
                $orgQuery->whereIn('id_wilayah', $scopeIds);
            }
            $orgMembers = $orgQuery->get();
            if ($orgMembers->isNotEmpty()) {
                $prompt .= "\n- DAFTAR RINGKAS PEJABAT AKTIF:\n";
                foreach ($orgMembers as $om) {
                    $jabatan = $om->jabatan;
                    $namaPejabat = $om->citizen->nama_lengkap ?? 'Tidak diketahui';
                    $namaWil = $om->wilayah->nama_wilayah ?? '';
                    $tipeWil = $om->wilayah->tipe ?? '';
                    $prompt .= "  * {$jabatan} {$tipeWil} {$namaWil}: {$namaPejabat}\n";
                }
            }

            // HANYA Pengurus/Pimpinan yang boleh melihat daftar data warga di bawah wewenangnya
            if ($isPengurus) {
                $citizensQuery = \App\Models\Citizen::with('wilayah')->where('status_aktif', true);
                if ($scopeIds !== null) {
                    $citizensQuery->whereIn('id_wilayah', $scopeIds);
                }
                $citizens = $citizensQuery->limit(60)->get([
                    'id_citizen', 'nama_lengkap', 'nik', 'no_hp', 'email',
                    'jenis_kelamin', 'status_warga', 'status_ekonomi', 'penerima_bansos', 'id_wilayah'
                ]);
                if ($citizens->isNotEmpty()) {
                    $prompt .= "\n- DAFTAR DATA RESMI WARGA DI BAWAH WEWENANG ANDA (Total " . $citizens->count() . " warga):\n";
                    foreach ($citizens as $c) {
                        $wilDesc = $c->wilayah ? "{$c->wilayah->tipe} {$c->wilayah->nama_wilayah}" : "";
                        $kontak = [];
                        if ($c->no_hp) $kontak[] = "HP: " . $c->no_hp;
                        if ($c->email) $kontak[] = "Email: " . $c->email;
                        $kontakStr = !empty($kontak) ? implode(', ', $kontak) : "Tidak ada";
                        $jk = $c->jenis_kelamin === 'L' ? 'Laki-laki' : ($c->jenis_kelamin === 'P' ? 'Perempuan' : '-');
                        $nik = $c->nik ?: '-';
                        $status = $c->status_warga ?: 'Tetap';
                        $ekonomi = $c->status_ekonomi ?: 'Mampu';
                        $bansos = $c->penerima_bansos ? 'Penerima Bansos' : 'Non-Bansos';
                        
                        $prompt .= "  * Nama: {$c->nama_lengkap} | NIK: {$nik} | JK: {$jk} | Kontak: {$kontakStr} | Wilayah: {$wilDesc} | Status: {$status} | Status Sosial: {$ekonomi} ({$bansos})\n";
                    }
                    $prompt .= "  * ATURAN PENTING MENGENAI DATA WARGA:\n";
                    $prompt .= "    - Pengguna saat ini adalah PENGURUS/PIMPINAN RESMI ({$roleStr}) yang MEMILIKI WEWENANG RESMI untuk melihat data warga di atas (termasuk NIK, nomor kontak/HP, email, dll.).\n";
                    $prompt .= "    - Jika pengguna bertanya tentang data warga di atas (seperti NIK, nomor kontak, nama, telepon, email, status), JAWAB DENGAN LENGKAP DAN JELAS berdasarkan data resmi di atas!\n";
                    $prompt .= "    - Jangan pernah menolak atau mengatakan 'tidak memiliki informasi' jika data warga tersebut tercantum di atas.\n";
                }

                // Data Transaksi Keuangan Real-Time Sesuai Menu Keuangan
                $finQuery = \App\Models\FinanceTransaction::query();
                if ($scopeIds !== null) {
                    $finQuery->whereIn('id_wilayah', $scopeIds);
                }
                $incomeReal = (float) (clone $finQuery)->where('tipe', 'PEMASUKAN')->sum('jumlah');
                $expenseReal = (float) (clone $finQuery)->where('tipe', 'PENGELUARAN')->sum('jumlah');
                $saldoKasReal = $incomeReal - $expenseReal;
                $prompt .= "\n- KEUANGAN & KAS WILAYAH RESMI (Sesuai Menu Keuangan):\n";
                $prompt .= "  * Saldo Kas Saat Ini: Rp" . number_format($saldoKasReal, 0, ',', '.') . "\n";
                $prompt .= "  * Total Pemasukan: Rp" . number_format($incomeReal, 0, ',', '.') . "\n";
                $prompt .= "  * Total Pengeluaran: Rp" . number_format($expenseReal, 0, ',', '.') . "\n";
                
                $recentTx = (clone $finQuery)->latest('tanggal')->limit(5)->get();
                if ($recentTx->isNotEmpty()) {
                    $prompt .= "  * 5 Transaksi Keuangan Terakhir:\n";
                    foreach ($recentTx as $tx) {
                        $tgl = $tx->tanggal ? date('d/m/Y', strtotime($tx->tanggal)) : '-';
                        $jml = 'Rp' . number_format($tx->jumlah, 0, ',', '.');
                        $prompt .= "    - {$tgl} [{$tx->tipe}] {$tx->kategori} ({$jml}): {$tx->deskripsi}\n";
                    }
                } else {
                    $prompt .= "  * Belum ada transaksi keuangan yang tercatat di sistem (Saldo kas masih Rp0).\n";
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
            } else {
                // Warga biasa: beri info dirinya sendiri
                if ($user->citizen) {
                    $myCit = $user->citizen;
                    $prompt .= "\n- DATA PRIBADI ANDA SENDIRI:\n";
                    $prompt .= "  * Nama: {$myCit->nama_lengkap} | NIK: {$myCit->nik} | JK: {$myCit->jenis_kelamin} | Kontak: {$myCit->no_hp} | Email: {$myCit->email}\n";
                    $prompt .= "  * Sebagai warga, Anda berhak melihat data pribadi Anda sendiri, namun tidak berhak melihat NIK warga lain.\n";
                }
            }
        } catch (\Exception $e) {
            // Abaikan jika gagal mengambil data real-time
        }

        return $prompt;
    }

    /**
     * Membangun representasi teks hierarki struktur organisasi dan pengurus
     * sesuai wewenang/scope wilayah pengguna (meniru tree pada halaman Struktur Organisasi).
     */
    private function buildStrukturOrganisasiText(?array $scopeIds): string
    {
        $wilayahQuery = \App\Models\Wilayah::query();
        if ($scopeIds !== null) {
            $wilayahQuery->whereIn('id_wilayah', $scopeIds);
        }
        $wilayahs = $wilayahQuery->get();

        $orgQuery = \App\Models\OrganizationMember::with(['citizen', 'wilayah'])
            ->where('status_aktif', true);
        if ($scopeIds !== null) {
            $orgQuery->whereIn('id_wilayah', $scopeIds);
        }
        $orgMembers = $orgQuery->get();

        $memberByWilayah = [];
        foreach ($orgMembers as $om) {
            $nama = $om->citizen->nama_lengkap ?? 'Tidak Diketahui';
            $memberByWilayah[$om->id_wilayah][] = "{$om->jabatan}: {$nama}";
        }

        $lines = [];
        $kelurahans = $wilayahs->where('tipe', 'KELURAHAN');

        if ($kelurahans->isEmpty()) {
            $dukuhs = $wilayahs->where('tipe', 'DUKUH');
            foreach ($dukuhs as $dukuh) {
                $dukuhPejabat = implode(', ', $memberByWilayah[$dukuh->id_wilayah] ?? ['Belum ada Kepala Dukuh']);
                $lines[] = "DUKUH {$dukuh->nama_wilayah} ({$dukuhPejabat})";
                $rws = $wilayahs->where('parent_id', $dukuh->id_wilayah)->where('tipe', 'RW');
                foreach ($rws as $rw) {
                    $rwPejabat = implode(', ', $memberByWilayah[$rw->id_wilayah] ?? ['Belum ada pengurus RW']);
                    $lines[] = "  - RW {$rw->nama_wilayah} ({$rwPejabat})";
                    $rts = $wilayahs->where('parent_id', $rw->id_wilayah)->where('tipe', 'RT');
                    foreach ($rts as $rt) {
                        $rtPejabat = implode(', ', $memberByWilayah[$rt->id_wilayah] ?? ['Belum ada pengurus RT']);
                        $lines[] = "    * RT {$rt->nama_wilayah} ({$rtPejabat})";
                    }
                }
            }
        } else {
            foreach ($kelurahans as $kel) {
                $kelPejabat = implode(', ', $memberByWilayah[$kel->id_wilayah] ?? ['Belum ada pengurus kelurahan']);
                $lines[] = "KELURAHAN {$kel->nama_wilayah} ({$kelPejabat}):";
                $dukuhs = $wilayahs->where('parent_id', $kel->id_wilayah)->where('tipe', 'DUKUH');
                foreach ($dukuhs as $dukuh) {
                    $dukuhPejabat = implode(', ', $memberByWilayah[$dukuh->id_wilayah] ?? ['Belum ada Kepala Dukuh']);
                    $lines[] = "  - DUKUH {$dukuh->nama_wilayah} ({$dukuhPejabat})";
                    $rws = $wilayahs->where('parent_id', $dukuh->id_wilayah)->where('tipe', 'RW');
                    foreach ($rws as $rw) {
                        $rwPejabat = implode(', ', $memberByWilayah[$rw->id_wilayah] ?? ['Belum ada pengurus RW']);
                        $lines[] = "    * RW {$rw->nama_wilayah} ({$rwPejabat})";
                        $rts = $wilayahs->where('parent_id', $rw->id_wilayah)->where('tipe', 'RT');
                        foreach ($rts as $rt) {
                            $rtPejabat = implode(', ', $memberByWilayah[$rt->id_wilayah] ?? ['Belum ada pengurus RT']);
                            $lines[] = "      + RT {$rt->nama_wilayah} ({$rtPejabat})";
                        }
                    }
                }
            }
        }

        return implode("\n", $lines);
    }
}
