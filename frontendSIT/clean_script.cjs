
const fs = require("fs");
let content = fs.readFileSync("src/pages/dukuh/DukuhPage.jsx", "utf8");

content = content.replace(/function DukuhComplaintPage\(\)[\s\S]*?(?=\/\/\s*\d+\.\s*KEUANGAN)/, "");
content = content.replace(/function DukuhLetterPage\(\)[\s\S]*?(?=\/\/\s*\d+\.\s*STATISTIK)/, "");
content = content.replace(/function DukuhOrganizationPage\(\)[\s\S]*?(?=\/\/\s*\d+\.\s*INVENTARIS)/, "");

content = content.replace(/<th className="px-5 py-3 font-semibold text-right">Aksi<\/th>/g, "");
content = content.replace(/<td className="px-5 py-3 text-right">[\s\S]*?handleVerify[\s\S]*?<\/td>/g, "");

fs.writeFileSync("src/pages/dukuh/DukuhPage.jsx", content);

