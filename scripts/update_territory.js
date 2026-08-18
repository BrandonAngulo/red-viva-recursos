
const fs = require("fs");
let raw = fs.readFileSync("data/territory.js", "utf8");

// Extract the pre-mapPoints content and post-mapPoints content
const matchBefore = raw.match(/([\s\S]*?mapPoints:\s*\[)/);
const matchAfter = raw.match(/(\],\s*municipalities:[\s\S]*)/);

if (!matchBefore || !matchAfter) {
  console.log("Could not parse territory.js sections!");
  process.exit(1);
}

const geocoded = JSON.parse(fs.readFileSync("scripts/geocoded_munis.json", "utf8"));

// Build the new mapPoints array content
// The geocoded object has {name, department, priority, note, url, coords}
// But mapPoints usually has {id, type, name, department, coords, note, source, url}
const newPoints = geocoded.map(m => {
  const id = (m.name + "-" + (m.department || "")).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  return {
    id: id,
    type: "ciudad",
    name: m.name,
    department: m.department,
    coords: m.coords,
    note: m.note,
    source: "UNGRD",
    url: m.url
  };
});

let newMapPointsStr = newPoints.map(p => "  " + JSON.stringify(p, null, 2).replace(/\n/g, "\n  ")).join(",\n");

const finalContent = matchBefore[1] + "\n" + newMapPointsStr + "\n" + matchAfter[1];
fs.writeFileSync("data/territory.js", finalContent);
console.log("territory.js updated successfully.");

