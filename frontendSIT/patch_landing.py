import re

with open("src/pages/landing/LandingPage.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add import
code = code.replace("import { getPublicOrganizationMembers, getPublicWilayah } from '@/services/api'", "import { getPublicOrganizationMembers, getPublicWilayah, getLandingData } from '@/services/api'")

# 2. Add state
code = code.replace("const [orgMembers, setOrgMembers] = useState(null)", "const [orgMembers, setOrgMembers] = useState(null)\n  const [cmsData, setCmsData] = useState(null)")

# 3. Add useEffect
code = code.replace("  // Data dari sistem", "  useEffect(() => { getLandingData().then(setCmsData).catch(console.error) }, [])\n\n  // Data dari sistem")

# 4. Overwrite variables with cmsData
destruct = "const { brand, navItems, hero, visi, misi, video, struktur, kegiatan, umkm, kontak } = landingData"
new_destruct = """const { brand, navItems, video, struktur, kontak } = landingData
  const heroData = cmsData?.profile?.hero_title ? { title: cmsData.profile.hero_title, description: cmsData.profile.hero_subtitle, ctaLabel: landingData.hero.ctaLabel, ctaHref: landingData.hero.ctaHref } : landingData.hero
  const visiData = cmsData?.profile?.visi || landingData.visi
  const misiData = cmsData?.profile?.misi ? cmsData.profile.misi.split('\\n') : landingData.misi
  const sejarahData = cmsData?.profile?.sejarah || ''
  const emailData = cmsData?.profile?.kontak_email || kontak?.email
  const hpData = cmsData?.profile?.kontak_hp || kontak?.phone
  const alamatData = cmsData?.profile?.kontak_alamat || kontak?.address
  const kegiatanData = (cmsData?.articles?.length > 0) ? cmsData.articles.map(a => ({ id: a.id_article, title: a.judul, description: a.konten, image: a.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80', date: new Date(a.published_at).toLocaleDateString('id-ID') })) : landingData.kegiatan
  const umkmData = (cmsData?.umkms?.length > 0) ? cmsData.umkms.map(u => ({ id: u.id_umkm, name: u.nama_usaha, owner: u.nama_pemilik, description: u.deskripsi, phone: u.no_hp, image: u.image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80' })) : landingData.umkm
"""
code = code.replace(destruct, new_destruct)

# 5. Fix HTML usage of variables
code = code.replace("{hero.title}", "{heroData.title}")
code = code.replace("{hero.description}", "{heroData.description}")
code = code.replace("{hero.ctaHref}", "{heroData.ctaHref}")
code = code.replace("{hero.ctaLabel}", "{heroData.ctaLabel}")
code = code.replace("{visi}", "{visiData}")

# Misi map
code = code.replace("misi.map", "misiData.map")
# Kegiatan map
code = code.replace("kegiatan.map", "kegiatanData.map")
# Umkm map
code = code.replace("umkm.map", "umkmData.map")

# Update contact
code = code.replace("{kontak.phone}", "{hpData}")
code = code.replace("{kontak.email}", "{emailData}")
code = code.replace("{kontak.address}", "{alamatData}")

# Add Sejarah below visi
misi_block = """<h3 className="text-lg font-extrabold text-neutral-900">Misi</h3>"""
sejarah_block = """
              {sejarahData && (
                <div className="mt-6">
                  <h3 className="text-lg font-extrabold text-neutral-900">Sejarah Singkat</h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-7 text-neutral-600 whitespace-pre-wrap">{sejarahData}</p>
                </div>
              )}
              <h3 className="text-lg font-extrabold text-neutral-900 mt-6">Misi</h3>
"""
code = code.replace(misi_block, sejarah_block)

with open("src/pages/landing/LandingPage.jsx", "w", encoding="utf-8") as f:
    f.write(code)
