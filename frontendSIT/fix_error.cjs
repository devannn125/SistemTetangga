
const fs = require("fs");
let content = fs.readFileSync("src/pages/dukuh/pages/DukuhOrganizationPage.jsx", "utf8");
content = content.replace("showToast(\"Gagal memuat data struktur organisasi.\", \"error\")", "showToast(\"Gagal: \" + (error.response?.data?.message || error.message), \"error\")");
content = content.replace("showToast('Gagal memuat data struktur organisasi.', 'error')", "showToast('Gagal: ' + (error.response?.data?.message || error.message), 'error')");
fs.writeFileSync("src/pages/dukuh/pages/DukuhOrganizationPage.jsx", content);

