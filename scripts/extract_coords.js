
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("C:/Users/grues/.gemini/antigravity/brain/eaade3bf-9dd6-4a26-bbdf-377d3827a407/.system_generated/steps/985/content.md", "utf8").split("\n").slice(8).join("\n"));
const munis = {};
data.puntos.forEach(p => {
  if (p.municipio && p.lat && p.lon) {
    const key = p.municipio + "|" + p.departamento;
    if (!munis[key]) munis[key] = { lat: 0, lon: 0, count: 0 };
    munis[key].lat += p.lat;
    munis[key].lon += p.lon;
    munis[key].count++;
  }
});
const result = {};
Object.keys(munis).forEach(k => {
  result[k] = { lat: munis[k].lat / munis[k].count, lon: munis[k].lon / munis[k].count };
});
console.log("Municipalities found in JSON:", Object.keys(result).length);
fs.writeFileSync("scripts/muni_coords.json", JSON.stringify(result, null, 2));

