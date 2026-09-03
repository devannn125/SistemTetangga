const fs = require('fs')
let content = fs.readFileSync('src/pages/warga/WargaPage.jsx', 'utf-8')
// Find the function PageShell and remove it
const regex = /function PageShell\(\{ children, eyebrow, title, description \}\) \{[\s\S]*?\n\s*\n/
content = content.replace(regex, '')
fs.writeFileSync('src/pages/warga/WargaPage.jsx', content)
console.log('Fixed WargaPage.jsx')
