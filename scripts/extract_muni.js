
const fs = require("fs");
let content = fs.readFileSync("data/territory.js", "utf8");
// territory.js defines window.CRC_TERRITORY = { ... }
// we can evaluate it
content = content.replace("window.CRC_TERRITORY =", "module.exports =");
fs.writeFileSync("scripts/temp_territory.js", content);
const terr = require("./temp_territory.js");
console.log("Total map points:", terr.mapPoints ? terr.mapPoints.length : 0);
console.log("Total municipalities:", terr.municipalities ? terr.municipalities.length : 0);
// Check if municipalities have coords
let countWithCoords = 0;
terr.municipalities.forEach(m => {
  if (m.coords || m.lat) countWithCoords++;
});
console.log("Municipalities with coords:", countWithCoords);
// Output first 2 for inspection
console.log(JSON.stringify(terr.municipalities.slice(0, 2), null, 2));

