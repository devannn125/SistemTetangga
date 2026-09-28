# Panduan Mengakses & Menguji Chatbot AI Telegram

Dokumen ini ditujukan bagi tim pengembang (developer) dan penguji (tester) untuk mengetahui cara menjalankan dan menguji fitur Chatbot Telegram "Sistem Tetangga" di tahap pengembangan lokal (Localhost).

---

## 1. Persiapan Menjalankan Bot di Lokal
Bot Telegram ini menggunakan pendekatan **Long-Polling** selama tahap *development* (karena Telegram tidak bisa menembak Webhook ke localhost yang tidak dipublikasikan).

**Langkah-langkah menyalakan Bot:**
1. Buka terminal baru di folder `backendSIT`.
2. Pastikan file `.env` sudah memiliki token bot:
   ```env
   TELEGRAM_BOT_TOKEN=8235461415:AAFE4XjNimAu1JXnRD0IwTUc6W9IG1aWCZQ
   ```
   *(Catatan: Anda tidak perlu men-setting API Key AI karena sistem saat ini sudah diatur otomatis menggunakan jalur ChatGPT gratis).*
3. Jalankan perintah berikut di terminal:
   ```bash
   php artisan telegram:poll
   ```
4. Jika muncul tulisan **"Berhasil! Sedang mendengarkan pesan masuk..."**, berarti bot Anda sudah menyala dan siap diuji. Jangan tutup terminal ini selama pengujian.

---

## 2. Cara Menautkan Akun (Secure Deep Linking)
Agar bot mengenali siapa yang sedang mengajaknya bicara (apakah ia Ketua RT, Bendahara, atau Warga biasa), penguji **wajib** menautkan akun Telegram-nya ke akun Sistem Tetangga mereka.

**Langkah-langkah Penautan:**
1. Jalankan *frontend* Vue/React Anda (`npm run dev`).
2. Buka *website* Sistem Tetangga di *browser* dan **Login** menggunakan akun penguji (misalnya akun Devan, atau akun Ketua RT).
3. Setelah masuk ke *dashboard* atau halaman apa pun, perhatikan ada **Logo Telegram Melayang (Floating Button)** berwarna biru di pojok kanan bawah layar.
4. **Klik logo tersebut.**
5. Sistem akan mengambil kode OTP rahasia (contoh: `123456`) di latar belakang, lalu otomatis membuka aplikasi Telegram Anda dengan format link khusus.
6. Di Telegram, tekan tombol **Start**.
7. Bot akan merespons: *"Berhasil! Akun Telegram ini sekarang tertaut dengan user [Nama Anda]..."*

Selamat! Akun Anda kini sudah dikenali oleh bot.

---

## 3. Cara Menguji (Testing) Kecerdasan Bot
Bot ini ditenagai oleh **ChatGPT (OpenAI)** dan dilengkapi fitur **Role-Based Context** serta **Typing Animation**.

**Skenario Uji Coba yang Bisa Anda Lakukan:**
- **Uji Coba Wewenang (Role):** 
  Jika Anda *login* sebagai Admin, cobalah bertanya: *"Tolong beritahukan apa saja wewenang dan batasan akses saya di aplikasi ini?"* AI akan menjabarkan wewenang Admin secara spesifik sesuai aturan sistem.
- **Uji Coba Warga Biasa:**
  Ganti akun (*logout* dari web, lalu *login* sebagai Warga, dan klik logo Telegram lagi untuk menimpa tautan). Tanyakan pertanyaan yang sama. AI akan menolak memberikan informasi sensitif karena mengetahui Anda hanyalah warga biasa.
- **Uji Coba Animasi (UX):**
  Perhatikan bagian atas aplikasi Telegram sesaat setelah Anda mengirim pertanyaan. Anda akan melihat tulisan *"Sistem Tetangga is typing..."* yang menandakan bot sedang memproses jawaban.

---

## 4. Gambaran Teknis Singkat (Untuk Developer)
1. **File Controller (Production):** `app/Http/Controllers/Api/TelegramWebhookController.php` (digunakan jika aplikasi sudah *live* dengan domain HTTPS).
2. **File Polling (Local):** `app/Console/Commands/TelegramPoll.php` (digunakan hanya untuk lokal).
3. **AI Service:** `app/Services/ChatbotAiService.php` (Berisi pengaturan *System Prompt* dinamis berdasarkan *Role* dari database yang lalu dikirimkan ke ChatGPT via *Pollinations API*).

> **Penting:** Pastikan saat sistem naik ke *Production* (Server Asli), fitur polling tidak perlu dijalankan lagi. Cukup daftarkan Webhook dari Telegram ke URL backend Anda: `https://domain-anda.com/api/telegram/webhook`.
