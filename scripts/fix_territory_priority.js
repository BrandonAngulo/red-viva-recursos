
const fs = require("fs");
let raw = fs.readFileSync("data/territory.js", "utf8");

const matchBefore = raw.match(/([\s\S]*?mapPoints:\s*\[)/);
const pointsMatch = raw.match(/mapPoints:\s*\[([\s\S]*?)\],\s*municipalities:/);
const matchAfter = raw.match(/(\],\s*municipalities:[\s\S]*)/);

let mapPoints = eval("[" + pointsMatch[1] + "]");

let dataStr = raw.replace("window.CRC_TERRITORY =", "module.exports =");
fs.writeFileSync("temp_test.js", dataStr);
const terr = require("../temp_test.js");

mapPoints.forEach(p => {
  const m = terr.municipalities.find(m => m.name === p.name && m.department === p.department);
  if (m) {
    p.priority = m.priority;
  }
});

let newMapPointsStr = mapPoints.map(p => "  " + JSON.stringify(p, null, 2).replace(/\n/g, "\n  ")).join(",\n");

const finalContent = matchBefore[1] + "\n" + newMapPointsStr + "\n" + matchAfter[1];
fs.writeFileSync("data/territory.js", finalContent);
console.log("priority restored to territory.js");

