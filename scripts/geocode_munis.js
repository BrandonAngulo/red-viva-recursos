
const fs = require("fs");
const https = require("https");
const terr = require("./temp_territory.js");

const munis = terr.municipalities;
let results = [];
let i = 0;

function fetchNext() {
  if (i >= munis.length) {
    fs.writeFileSync("scripts/geocoded_munis.json", JSON.stringify(results, null, 2));
    console.log("Geocoding complete.");
    return;
  }

  const m = munis[i];
  const query = encodeURIComponent(m.name + ", " + m.department + ", Colombia");
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  
  const options = {
    headers: { "User-Agent": "CentralRecursosColombia/1.0" }
  };

  https.get(url, options, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.length > 0) {
          results.push({ ...m, coords: [parseFloat(json[0].lat), parseFloat(json[0].lon)] });
          console.log(`[${i+1}/${munis.length}] Found: ${m.name}`);
        } else {
          results.push({ ...m, coords: [4.5709, -74.2973] }); // Fallback Colombia center
          console.log(`[${i+1}/${munis.length}] NOT FOUND: ${m.name}`);
        }
      } catch (e) {
        results.push({ ...m, coords: [4.5709, -74.2973] });
      }
      i++;
      setTimeout(fetchNext, 1100);
    });
  }).on("error", (e) => {
    results.push({ ...m, coords: [4.5709, -74.2973] });
    i++;
    setTimeout(fetchNext, 1100);
  });
}

fetchNext();

