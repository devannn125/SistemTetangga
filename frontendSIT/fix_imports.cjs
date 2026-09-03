const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'src/pages')

const files = [
  'rw/RwPage.jsx',
  'warga/WargaPage.jsx',
  'dukuh/DukuhPage.jsx',
  'kelurahan/KelurahanPage.jsx',
  'sek/SekretarisPage.jsx',
  'ben/BendaharaPage.jsx'
]

for (const file of files) {
  const filePath = path.join(dir, file)
  if (!fs.existsSync(filePath)) continue

  let content = fs.readFileSync(filePath, 'utf-8')
  
  if (!content.includes('import { PageShell }')) {
    content = content.replace(/(import .*?\n)/, `$1import { PageShell } from '@/components/layout/PageShell'\n`)
  }
  
  if (file === 'warga/WargaPage.jsx' && !content.includes('getAuthData')) {
    content = content.replace(/import \{ getAuthRole \}/, 'import { getAuthRole, getAuthData }')
  }

  fs.writeFileSync(filePath, content)
  console.log('Fixed imports for', file)
}
