# Prompt: Komponen Struktur Organisasi

Buatkan komponen React "StrukturOrganisasi" menggunakan Tailwind CSS, komponen Card dari shadcn/ui, dan ikon dari lucide-react.

## Struktur Konten

1. Card besar terpusat untuk Kepala Dukuh: foto rounded, nama, badge hijau kecil "Kepala Dukuh"
2. Baris tab/pill untuk memilih RW (contoh: RW 01, RW 02, RW 03) — tab aktif berwarna biru gelap dengan teks putih, tab non-aktif abu-abu terang
3. Garis vertikal penghubung + heading "Pengurus RW [X]" (dengan garis horizontal kiri-kanan di sekitar teks)
4. Grid 2 kolom berisi card Ketua RW dan Sekretaris RW: masing-masing ada foto kecil bulat, nama (bold), jabatan (teks hijau)
5. Garis vertikal penghubung + heading "Badan Pengurus RT di RW [X]"
6. Card container abu-abu muda berisi:
   - Header per RT (contoh "RT 01") dengan icon pin lokasi
   - List baris untuk Ketua RT, Sekretaris, Bendahara — tiap baris ada foto kecil bulat, nama, jabatan (teks hijau), dipisah garis tipis antar baris

## Requirements

- Data (kepala dukuh, daftar RW, pengurus RW, daftar RT per RW, pengurus RT) di-mock lewat array/object di atas komponen, buat strukturnya scalable untuk banyak RW dan RT
- Gunakan `useState` untuk RW yang sedang aktif dipilih, konten di bawahnya berubah sesuai RW yang dipilih
- Buat komponen kecil reusable `PersonCard` (foto + nama + jabatan) yang dipakai berulang
- Layout max-width terpusat (misal `max-w-5xl mx-auto`), responsive
- Styling: card putih dengan border tipis + shadow ringan, `rounded-lg`, warna aksen biru (`#1e3a5f`-ish) untuk elemen aktif dan hijau untuk badge jabatan
- Return hanya JSX konten (bisa langsung ditaruh di dalam layout/page yang sudah ada)