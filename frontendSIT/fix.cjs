
const fs = require("fs");
let content = fs.readFileSync("src/pages/dukuh/pages/DukuhOrganizationPage.jsx", "utf8");

content = content.replace("getUsers, getCitizenMe,", "getCitizens, getCitizenMe,");
content = content.replace("getUsers({ per_page: 100 }),", "getCitizens({ per_page: 100 }),");

const oldFilter = `const allUsers = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      const filteredUsers = allUsers.filter((u) => {
        const roles = (u.user_roles || []).filter((r) => r.status === "ACTIVE").map((r) => r.role?.kode_role || "")
        return !roles.includes("ADMIN") && !roles.includes("DUKUH")
      })

      const arrCitizens = filteredUsers.map((u) => {
        const citizenData = u.citizen || {}
        return {
          id_citizen: citizenData.id_citizen || u.id_users,
          nama_lengkap: citizenData.nama_lengkap || u.nama_users || "Tanpa Nama",
        }
      })`;

const newFilter = `const allCitizens = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      const arrCitizens = allCitizens.map((c) => ({
        id_citizen: c.id_citizen,
        nama_lengkap: c.nama_lengkap || "Tanpa Nama",
      }))`;

content = content.replace(oldFilter, newFilter);
fs.writeFileSync("src/pages/dukuh/pages/DukuhOrganizationPage.jsx", content);

