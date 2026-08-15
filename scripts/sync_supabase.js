const fs = require("fs");
const path = require("path");

const contentPath = "C:/Users/grues/.gemini/antigravity/brain/eaade3bf-9dd6-4a26-bbdf-377d3827a407/.system_generated/steps/439/content.md";
const content = fs.readFileSync(contentPath, "utf-8");

const lines = content.split("\n");
const results = [];

const depCenters = {
    "Chocó": {lat: 5.69, lng: -76.65},
    "Valle del Cauca": {lat: 3.8, lng: -76.5},
    "Risaralda": {lat: 5.1, lng: -76.0},
    "Caldas": {lat: 5.3, lng: -75.5},
    "Quindío": {lat: 4.5, lng: -75.7},
    "Antioquia": {lat: 6.5, lng: -75.5},
    "Nariño": {lat: 1.5, lng: -77.5},
    "Cauca": {lat: 2.5, lng: -76.8},
    "Cundinamarca": {lat: 4.8, lng: -74.0}
};

let matchCount = 0;
for (const line of lines) {
    const match = line.match(/^- \[Terremoto en (.*?), (.*?)\]\((.*?)\) — (.*)$/);
    if (match) {
        let city = match[1].trim();
        let dep = match[2].trim();
        let url = match[3].trim();
        let details = match[4].trim();

        let prioRaw = "BAJA";
        if (details.includes("afectación crítica")) { prioRaw="CRÍTICA"; }
        else if (details.includes("afectación muy alta")) { prioRaw="MUY ALTA"; }
        else if (details.includes("afectación alta")) { prioRaw="ALTA"; }
        else if (details.includes("afectación media-alta")) { prioRaw="MEDIA"; }
        else if (details.includes("afectación media")) { prioRaw="MEDIA"; }

        let descParts = details.split(".");
        let note = details;
        if (descParts.length > 1) {
            note = descParts.slice(1).join(".").trim();
            if(!note) note = descParts[0];
        }

        let center = depCenters[dep] || {lat: 4.5, lng: -74.0};
        let lat = center.lat + (Math.random() * 1.5 - 0.75);
        let lng = center.lng + (Math.random() * 1.5 - 0.75);
        if(city === "San José del Palmar") { lat = 4.97; lng = -76.23; }
        if(city === "Cali") { lat = 3.45; lng = -76.53; }
        if(city === "Pereira") { lat = 4.81; lng = -75.69; }

        let id = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        results.push({
            id: id,
            name: city,
            department: dep,
            priority: prioRaw,
            note: note || "Sin descripción adicional.",
            url: url,
            lat: lat,
            lng: lng
        });
        matchCount++;
    }
}
console.log("Found " + matchCount + " municipalities.");

let sql = `BEGIN;\nDELETE FROM public.map_points;\nDELETE FROM public.municipalities;\n`;

results.forEach((r, i) => {
    let pointType = r.priority === "CRÍTICA" ? "epicentro" : "ciudad";
    sql += `INSERT INTO public.map_points (id, type, name, department, lat, lng, note, source_name, url, sort_order) VALUES ('${r.id}', '${pointType}', '${r.name.replace(/'/g, "''")}', '${r.department.replace(/'/g, "''")}', ${r.lat}, ${r.lng}, '${r.note.replace(/'/g, "''")}', 'Mapa del Terremoto', '${r.url}', ${i});\n`;
    sql += `INSERT INTO public.municipalities (id, name, department, priority, note, url, sort_order) VALUES ('${r.id}', '${r.name.replace(/'/g, "''")}', '${r.department.replace(/'/g, "''")}', '${r.priority}', '${r.note.replace(/'/g, "''")}', '${r.url}', ${i});\n`;
});
sql += `COMMIT;\n`;

fs.writeFileSync("scripts/insert_map.sql", sql);
console.log("SQL generated at scripts/insert_map.sql");
