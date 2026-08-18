
const fs = require("fs");
let raw = fs.readFileSync("data/territory.js", "utf8");

const matchBefore = raw.match(/([\s\S]*?mapPoints:\s*\[)/);
const pointsMatch = raw.match(/mapPoints:\s*\[([\s\S]*?)\],\s*municipalities:/);
const matchAfter = raw.match(/(\],\s*municipalities:[\s\S]*)/);

if (!matchBefore || !pointsMatch || !matchAfter) {
  console.log("Could not parse territory.js sections!");
  process.exit(1);
}

let mapPoints;
try {
  mapPoints = eval("[" + pointsMatch[1] + "]");
} catch(e) {
  console.error("Eval error", e);
  process.exit(1);
}

let dataStr = raw.replace("window.CRC_TERRITORY =", "module.exports =");
fs.writeFileSync("temp_test.js", dataStr);
const terr = require("../temp_test.js");

mapPoints.forEach(p => {
  const m = terr.municipalities.find(m => m.name === p.name && m.department === p.department);
  let type = "ciudad";
  if (m) {
    if (m.priority === "Emergencia paralela") type = "incendio";
    if (m.name === "San José del Palmar") type = "epicentro";
  }
  p.type = type;
});

let newMapPointsStr = mapPoints.map(p => "  " + JSON.stringify(p, null, 2).replace(/\n/g, "\n  ")).join(",\n");

const finalContent = matchBefore[1] + "\n" + newMapPointsStr + "\n" + matchAfter[1];
fs.writeFileSync("data/territory.js", finalContent);
console.log("territory.js fixed successfully.");

