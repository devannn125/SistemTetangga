const fs = require('fs');
let content = fs.readFileSync('src/pages/dukuh/DukuhPage.jsx', 'utf8');

if (!content.includes("import DukuhOrganizationPage from './pages/DukuhOrganizationPage'")) {
    content = content.replace("import { PortalLayout } from '@/components/layout/PortalLayout'", "import { PortalLayout } from '@/components/layout/PortalLayout'\nimport DukuhOrganizationPage from './pages/DukuhOrganizationPage'");
}

content = content.replace(/function DukuhComplaintPage\(\) \{[\s\S]*?\}\s*(?=\/\/\s*\d+\.\s*KEUANGAN)/g, '');
content = content.replace(/function DukuhLetterPage\(\) \{[\s\S]*?\}\s*(?=\/\/\s*\d+\.\s*STATISTIK)/g, '');
content = content.replace(/function DukuhOrganizationPage\(\) \{[\s\S]*?\}\s*(?=\/\/\s*\d+\.\s*INVENTARIS)/g, '');

const menuRegex = /const dukuhMenus = \[[\s\S]*?\]/m;
const newMenu = \const dukuhMenus = [
  { label: 'Beranda', path: '/dukuh', icon: 'home' },
  { label: 'Data Warga', path: '/dukuh/warga', icon: 'users' },
  { label: 'Perumahan', path: '/dukuh/perumahan', icon: 'box' },
  { label: 'Keuangan', path: '/dukuh/keuangan', icon: 'wallet' },
  { label: 'Informasi & Statistik', path: '/dukuh/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/dukuh/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/dukuh/organisasi', icon: 'users' },
  { label: 'Inventaris', path: '/dukuh/inventaris', icon: 'box' },
]\;
content = content.replace(menuRegex, newMenu);

const renderPageRegex = /function renderPage\\(activePath\\) \\{[\\s\\S]*?return <HomePage \\/>\\s*\\}/m;
const newRenderPage = \unction renderPage(activePath) {
  if (activePath === '/dukuh/warga') return <DukuhCitizenPage />
  if (activePath === '/dukuh/perumahan') return <DukuhHousingPage />
  if (activePath === '/dukuh/keuangan') return <DukuhFinancePage />
  if (activePath === '/dukuh/statistik') return <DukuhStatisticsPage />
  if (activePath === '/dukuh/peraturan') return <DukuhRegulationPage />
  if (activePath === '/dukuh/organisasi') return <DukuhOrganizationPage />
  if (activePath === '/dukuh/inventaris') return <DukuhInventoryPage />
  return <HomePage />
}\;
content = content.replace(renderPageRegex, newRenderPage);

// Remove Aksi header
content = content.replace(/<th className="px-5 py-3 font-semibold text-right">Aksi<\\/th>/g, '');

fs.writeFileSync('src/pages/dukuh/DukuhPage.jsx', content);
console.log('Script done');
