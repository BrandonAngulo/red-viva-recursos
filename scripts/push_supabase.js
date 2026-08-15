
const fs = require("fs");
const contentPath = "C:/Users/grues/.gemini/antigravity/brain/eaade3bf-9dd6-4a26-bbdf-377d3827a407/.system_generated/steps/439/content.md";
const content = fs.readFileSync(contentPath, "utf-8");
const lines = content.split("\n");

const depCenters = {
    "Chocó": {lat: 5.69, lng: -76.65}, "Valle del Cauca": {lat: 3.8, lng: -76.5},
    "Risaralda": {lat: 5.1, lng: -76.0}, "Caldas": {lat: 5.3, lng: -75.5},
    "Quindío": {lat: 4.5, lng: -75.7}, "Antioquia": {lat: 6.5, lng: -75.5},
    "Nariño": {lat: 1.5, lng: -77.5}, "Cauca": {lat: 2.5, lng: -76.8},
    "Cundinamarca": {lat: 4.8, lng: -74.0}
};

const mapPoints = [];
const municipalities = [];

let order = 0;
for (const line of lines) {
    const match = line.match(/^- \[Terremoto en (.*?), (.*?)\]\((.*?)\) — (.*)$/);
    if (match) {
        let city = match[1].trim(); let dep = match[2].trim(); let url = match[3].trim(); let details = match[4].trim();
        let prioRaw = "BAJA";
        if (details.includes("afectación crítica")) { prioRaw="CRÍTICA"; }
        else if (details.includes("afectación muy alta")) { prioRaw="MUY ALTA"; }
        else if (details.includes("afectación alta")) { prioRaw="ALTA"; }
        else if (details.includes("afectación media-alta")) { prioRaw="MEDIA"; }
        else if (details.includes("afectación media")) { prioRaw="MEDIA"; }

        let descParts = details.split(".");
        let note = details;
        if (descParts.length > 1) { note = descParts.slice(1).join(".").trim(); if(!note) note = descParts[0]; }

        let center = depCenters[dep] || {lat: 4.5, lng: -74.0};
        let lat = center.lat + (Math.random() * 1.5 - 0.75); let lng = center.lng + (Math.random() * 1.5 - 0.75);
        if(city === "San José del Palmar") { lat = 4.97; lng = -76.23; }
        if(city === "Cali") { lat = 3.45; lng = -76.53; }
        if(city === "Pereira") { lat = 4.81; lng = -75.69; }

        let id = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        mapPoints.push({
            id: id, type: prioRaw === "CRÍTICA" ? "epicentro" : "ciudad",
            name: city, department: dep, lat: lat, lng: lng,
            note: note || "Sin descripción", source_name: "Mapa del Terremoto",
            url: url, sort_order: order, is_published: true
        });
        
        municipalities.push({
            id: id, name: city, department: dep, priority: prioRaw,
            note: note || "Sin descripción", url: url, sort_order: order, is_published: true
        });
        order++;
    }
}

const supabaseUrl = "https://afnwhdoqdwopvcsdgswi.supabase.co";
const anonKey = "sb_publishable_1EcdaBYdh9GVIVTdqtWZoQ_anWOqq8a";

async function push() {
    console.log("Emptying map_points...");
    await fetch(`${supabaseUrl}/rest/v1/map_points?id=not.is.null`, { method: "DELETE", headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` } });
    
    console.log("Emptying municipalities...");
    await fetch(`${supabaseUrl}/rest/v1/municipalities?id=not.is.null`, { method: "DELETE", headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` } });
    
    // Batch insert 100 at a time
    console.log("Inserting map_points...");
    for(let i=0; i<mapPoints.length; i+=100) {
        let chunk = mapPoints.slice(i, i+100);
        let res = await fetch(`${supabaseUrl}/rest/v1/map_points`, {
            method: "POST", headers: { "Content-Type": "application/json", "apikey": anonKey, "Authorization": `Bearer ${anonKey}`, "Prefer": "return=minimal" },
            body: JSON.stringify(chunk)
        });
        if(!res.ok) console.error("Error inserting map_points", await res.text());
    }
    
    console.log("Inserting municipalities...");
    for(let i=0; i<municipalities.length; i+=100) {
        let chunk = municipalities.slice(i, i+100);
        let res = await fetch(`${supabaseUrl}/rest/v1/municipalities`, {
            method: "POST", headers: { "Content-Type": "application/json", "apikey": anonKey, "Authorization": `Bearer ${anonKey}`, "Prefer": "return=minimal" },
            body: JSON.stringify(chunk)
        });
        if(!res.ok) console.error("Error inserting municipalities", await res.text());
    }
    console.log("Done!");
}

push();

