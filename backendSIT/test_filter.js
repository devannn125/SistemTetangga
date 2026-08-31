const members = [
  { citizen: { nama_lengkap: 'Maria' }, jabatan: 'Kepala Dukuh', wilayah: { tipe: 'KELURAHAN', id_wilayah: 'WIL-001' }, status_aktif: true, id_wilayah: 'WIL-001' },
  { citizen: { nama_lengkap: 'Budi' }, jabatan: 'Ketua RT', wilayah: { tipe: 'RT', id_wilayah: 'WIL-004' }, status_aktif: true, id_wilayah: 'WIL-004' },
  { citizen: { nama_lengkap: 'Rudi' }, jabatan: 'Ketua RW', wilayah: { tipe: 'RW', id_wilayah: 'WIL-002' }, status_aktif: true, id_wilayah: 'WIL-002' },
  { citizen: { nama_lengkap: 'Sari' }, jabatan: 'Sekretaris', wilayah: { tipe: 'RT', id_wilayah: 'WIL-004' }, status_aktif: true, id_wilayah: 'WIL-004' },
  { citizen: { nama_lengkap: 'Dewi' }, jabatan: 'Bendahara', wilayah: { tipe: 'RT', id_wilayah: 'WIL-004' }, status_aktif: true, id_wilayah: 'WIL-004' }
];

const wil = { id_wilayah: 'WIL-004', parent_id: 'WIL-002' };

const meId = wil.id_wilayah;
const parentId = wil.parent_id;
const kelWilayahId = members.find(m => m.wilayah?.tipe === 'KELURAHAN')?.wilayah?.id_wilayah;

const validIds = [kelWilayahId, parentId, meId].filter(Boolean);
const filtered = members.filter(m => m.status_aktif && validIds.includes(m.id_wilayah));

const rank = { KELURAHAN: 1, RW: 2, RT: 3 };
filtered.sort((a, b) => {
  const rA = rank[a.wilayah?.tipe] || 99;
  const rB = rank[b.wilayah?.tipe] || 99;
  if (rA !== rB) return rA - rB;
  
  const getJobRank = (job = '') => {
    const j = job.toLowerCase();
    if (j.includes('dukuh')) return 1;
    if (j.includes('ketua rw')) return 2;
    if (j.includes('ketua rt')) return 3;
    if (j.includes('sekretaris')) return 4;
    if (j.includes('bendahara')) return 5;
    return 99;
  };
  return getJobRank(a.jabatan) - getJobRank(b.jabatan);
});

console.log(filtered.map(m => m.citizen.nama_lengkap + ' - ' + m.jabatan));
