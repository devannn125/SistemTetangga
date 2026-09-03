const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'src/pages')

const filesToUpdate = [
  { file: 'rt/RtPage.jsx', dashboard: 'RtDashboard', name: 'Ketua RT' },
  { file: 'rw/RwPage.jsx', dashboard: 'RwDashboard', name: 'Ketua RW' },
  { file: 'warga/WargaPage.jsx', dashboard: 'WargaDashboard', name: 'Warga', isWarga: true },
  { file: 'dukuh/DukuhPage.jsx', dashboard: 'LurahDashboard', name: 'Kepala Dukuh' },
  { file: 'kelurahan/KelurahanPage.jsx', dashboard: 'LurahDashboard', name: 'Kepala Lurah' },
  { file: 'sek/SekretarisPage.jsx', dashboard: 'SekretarisDashboard', name: 'Sekretaris' },
  { file: 'ben/BendaharaPage.jsx', dashboard: 'BendaharaDashboard', name: 'Bendahara' }
]

for (const item of filesToUpdate) {
  const filePath = path.join(dir, item.file)
  if (!fs.existsSync(filePath)) continue

  let content = fs.readFileSync(filePath, 'utf-8')
  
  // Add import if not exists
  if (!content.includes(item.dashboard)) {
    const importStatement = `import { ${item.dashboard} } from '@/components/dashboard/roles/${item.dashboard}'\n`
    content = content.replace(/(import .*?\n)(?!import)/s, `$1${importStatement}`)
  }

  // Replace <HomePage /> in renderPage
  let pageShellStart = `<PageShell eyebrow="Portal ${item.name}" title="Dashboard ${item.name}" description="Ringkasan informasi dan metrik terkini untuk ${item.name}.">\n        <${item.dashboard} ${item.isWarga ? 'role={getAuthData()?.role || "WARGA"}' : ''} />\n      </PageShell>`

  if (content.includes('return <HomePage />')) {
    content = content.replace('return <HomePage />', `return (\n      ${pageShellStart}\n    )`)
  } else if (content.includes('return <BerandaPage />')) {
    content = content.replace('return <BerandaPage />', `return (\n      ${pageShellStart}\n    )`)
  }
  
  // Actually some files might have `return <HomePage />` inside `renderPage(activePath)`
  
  fs.writeFileSync(filePath, content)
  console.log('Updated', item.file)
}
