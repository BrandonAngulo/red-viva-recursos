
const terr = require("./temp_territory.js");
let mapPointsNames = new Set(terr.mapPoints.map(m => m.name + "|" + m.department));
let muniNames = new Set(terr.municipalities.map(m => m.name + "|" + m.department));

let missingInMap = [];
for (let m of terr.municipalities) {
  if (!mapPointsNames.has(m.name + "|" + m.department)) {
    missingInMap.push(m.name);
  }
}

console.log("Missing in mapPoints:", missingInMap.length);
if (missingInMap.length > 0) {
  console.log("First few missing:", missingInMap.slice(0, 5));
}

