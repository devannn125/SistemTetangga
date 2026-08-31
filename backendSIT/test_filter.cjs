const fs = require('fs');
const resOrg = JSON.parse(fs.readFileSync('api_out.json', 'utf8'));
const wil = { id_wilayah: 'WIL-004', parent_id: 'WIL-002', tipe: 'RT' }; // Siti Aminah wilayah

const arr = resOrg;
const meId = wil.id_wilayah;
const parentId = wil.parent_id;
const kelWilayahId = arr.find(m => m.wilayah?.tipe === 'KELURAHAN')?.wilayah?.id_wilayah;

const validIds = [kelWilayahId, parentId, meId].filter(Boolean);
const filtered = arr.filter(m => m.status_aktif && validIds.includes(m.id_wilayah));

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

console.log('Resulting IDs:', filtered.map(m => m.jabatan + ' - ' + m.id_wilayah + ' - ' + m.citizen.nama_lengkap));
