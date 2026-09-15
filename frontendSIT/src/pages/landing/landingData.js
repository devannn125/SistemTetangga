export const landingData = {
  brand: {
    name: 'Kenaran',
    shortName: 'Kenaran',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Lambang_Kabupaten_Gunungkidul.png',
  },
  navItems: [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Profil', href: '#profil' },
    { label: 'Kegiatan', href: '#kegiatan' },
    { label: 'UMKM', href: '#umkm' },
    { label: 'Kontak', href: '#kontak' },
    { label: 'Login', href: '/login' },
  ],
  hero: {
    title: 'Selamat Datang di Website Resmi Kenaran',
    description: 'Menyajikan informasi seputar profil, kegiatan, dan potensi UMKM warga kami.',
    ctaLabel: 'Jelajahi Kenaran',
    ctaHref: '#profil',
  },
  // ponytail: Google Maps embed gratis tanpa API key (output=embed). Ganti coords/q when koordinat Kenaran final.
  berandaMapEmbed:
    'https://www.google.com/maps?q=Kenaran%2C%20Gedangsari%2C%20Gunungkidul%20Yogyakarta&z=14&hl=id&output=embed',
  visi: 'Terwujudnya Kenaran yang mandiri, guyub, dan sejahtera melalui semangat gotong royong serta pemberdayaan potensi warga secara berkelanjutan.',
  misi: [
    'Meningkatkan kualitas pelayanan kepada warga secara ramah, transparan, dan mudah diakses.',
    'Memperkuat semangat gotong royong dan kebersamaan dalam setiap kegiatan kemasyarakatan.',
    'Mendorong pemberdayaan ekonomi warga melalui pengembangan UMKM dan potensi lokal.',
    'Meningkatkan kualitas sumber daya manusia melalui kegiatan pendidikan, kesehatan, dan sosial bagi seluruh lapisan usia.',
    'Menjaga keamanan, ketertiban, dan kerukunan hidup bermasyarakat yang harmonis dan agamis.',
  ],
  video: {
    title: 'Video Profil Kenaran',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  },
  // fallback mock ketika API belum public / belum login
  struktur: [
    { name: 'Nurhidayat', role: 'Lurah', image: 'https://i.pravatar.cc/300?img=11' },
    { name: 'Suyanto', role: 'Dukuh', image: 'https://i.pravatar.cc/300?img=12' },
    { name: 'Purwanto', role: 'Ketua RW 02', image: 'https://i.pravatar.cc/300?img=13' },
    { name: 'Paino', role: 'Ketua RT 01', image: 'https://i.pravatar.cc/300?img=14' },
    { name: 'Widayanta', role: 'Ketua RT 02', image: 'https://i.pravatar.cc/300?img=15' },
    { name: 'Sutarjo', role: 'Ketua RT 03', image: 'https://i.pravatar.cc/300?img=16' },
    { name: 'Sulastri', role: 'Ketua RT 04', image: 'https://i.pravatar.cc/300?img=17' },
    { name: 'Marimin', role: 'Ketua RT 05', image: 'https://i.pravatar.cc/300?img=18' },
    { name: 'Solikin', role: 'Ketua RT 06', image: 'https://i.pravatar.cc/300?img=19' },
  ],
  strukturTabs: ['Semua', 'Lurah', 'Dukuh', 'RW', 'RT'],
  kegiatan: [
    {
      title: 'Pembagian Bibit Gratis',
      date: '25 Agustus 2026',
      description: 'Pembagian bibit gratis kepada masyarakat Kenaran',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      href: '#',
    },
    {
      title: 'Tabligh Akbar Kenaran',
      date: '24 Agustus 2026',
      description: 'Tabligh Akbar Peringatan Maulid Nabi Muhammad SAW',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
      href: '#',
    },
    {
      title: 'Kegiatan Lomba 17 Agustus di Kenaran',
      date: '14-15 Agustus 2026',
      description: 'Mengadakan kegiatan lomba dari kategori anak-anak, dewasa dan orang tua.',
      image: 'https://images.unsplash.com/photo-1526726538690-5cbf2293457f?auto=format&fit=crop&w=600&q=80',
      href: '#',
    },
  ],
  umkm: {
    headerTitle: 'UMKM Kerajinan Bambu',
    headerDesc: 'Sentra Kerajinan Bambu Sidodadi',
    headerSub: 'Kumpulan karya pengrajin bambu Kenaran — kunjungi Instagram kami',
    instagramHref: '#',
    items: [
      {
        title: 'Box Hampers Bambu 25x10 cm',
        description: 'Kemasan hampers berbahan bambu dengan desain rapi dan estetik, pas untuk parsel, hadiah, atau suvenir yang berkes...',
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Aneka Rantang Susun Bambu Diameter 20 cm',
        description: 'Rantang susun berbahan bambu alami, praktis untuk membawa dan menyajikan makanan bertingkat, cocok untuk acara...',
        image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Aneka Nampan/Tampah Bambu',
        description: 'Nampan bambu dengan berbagai model dan ukuran, cocok untuk menyajikan hidangan, hantaran, maupun...',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  kontak: {
    alamat: 'Kenaran, Kec. Gedangsari, Kabupaten Gunungkidul, Daerah Istimewa Yogyakarta 55863',
    jamKerja: 'Senin - Jumat: 08.00 - 15.30',
    telepon: '085228416945',
    waNumber: '6285228416945',
    email: 'testaja@gmail.com',
    // ponytail: Google Maps embed gratis tanpa key; ganti when koordinat resmi tersedia
    mapEmbed:
      'https://www.google.com/maps?q=Kenaran%2C%20Gedangsari%2C%20Gunungkidul%20Yogyakarta&z=14&hl=id&output=embed',
  },
  services: [
    {
      title: 'Laporan Warga',
      icon: 'megaphone',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
      description: 'Sampaikan aspirasi, keluhan, atau laporan kejadian di lingkungan Anda secara langsung dan tertata.',
    },
    {
      title: 'Informasi Terkini',
      icon: 'file',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
      description: 'Akses pengumuman, peraturan baru, dan berita penting terkait lingkungan rukun tetangga.',
    },
    {
      title: 'Agenda Kegiatan',
      icon: 'calendar',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80',
      description: 'Jadwal kegiatan rutin, rapat warga, kerja bakti, hingga acara perayaan komunitas.',
    },
  ],
  reasons: [
    { title: 'Efisiensi Administrasi', description: 'Digitalisasi dokumen untuk proses yang lebih cepat dan mengurangi birokrasi yang berbelit.' },
    { title: 'Transparansi & Akuntabilitas', description: 'Warga dapat memantau penggunaan dana dan kebijakan lingkungan secara terbuka dan jujur.' },
    { title: 'Akses Informasi 24/7', description: 'Informasi pengumuman dan agenda desa tersedia kapan saja melalui perangkat digital Anda.' },
  ],
  stats: [
    { value: '1,204', label: 'Warga Terdaftar' },
    { value: '856', label: 'Laporan Selesai' },
    { value: '24', label: 'Kegiatan Mendatang' },
  ],
}
