
const fs = require("fs");
let appjs = fs.readFileSync("assets/js/app.js", "utf8");

// Change the crit/rest mapping
const oldCrit = `html += "<div class=\\"muni-grid\\">" + crit.map(function(m) {
             var prio = m.priority ? "<span class=\\"muni-prio p-" + slug(m.priority) + "\\">" + esc(m.priority) + "</span>" : "";`;

const newCrit = `html += "<div class=\\"muni-grid\\">" + crit.map(function(m) {
             var pText = m.priority === "EMERGENCIA PARALELA" ? "?? OTRO EVENTO" : esc(m.priority);
             var pSlug = m.priority === "EMERGENCIA PARALELA" ? "otra" : slug(m.priority);
             var prio = m.priority ? "<span class=\\"muni-prio p-" + pSlug + "\\">" + pText + "</span>" : "";`;

appjs = appjs.replace(oldCrit, newCrit);

const oldRest = `html += "<div class=\\"muni-list-compact\\">" + rest.map(function(m) {
             var prio = m.priority ? "<span class=\\"muni-prio p-" + slug(m.priority) + " compact\\">" + esc(m.priority) + "</span>" : "";`;

const newRest = `html += "<div class=\\"muni-list-compact\\">" + rest.map(function(m) {
             var pText = m.priority === "EMERGENCIA PARALELA" ? "?? OTRO EVENTO" : esc(m.priority);
             var pSlug = m.priority === "EMERGENCIA PARALELA" ? "otra" : slug(m.priority);
             var prio = m.priority ? "<span class=\\"muni-prio p-" + pSlug + " compact\\">" + pText + "</span>" : "";`;

appjs = appjs.replace(oldRest, newRest);

// Add the legend above the grid
const oldBox = `box.innerHTML = html || "<p class=\\"ge-empty\\" style=\\"padding: 10px; color:var(--fg-muted)\\">Ningún municipio coincide con la búsqueda.</p>";`;
const newBox = `
      var legendHtml = "<div class=\\"prio-legend\\" style=\\"font-size:12px; color:var(--fg-muted); margin-bottom:12px; padding:8px; background:var(--bg-card); border-radius:6px; border:1px solid var(--line);\\">" +
         "<b>Escala de daño por sismo:</b> Crítica, Muy Alta, Alta, Media, Baja.<br>" +
         "<b>?? Otro evento:</b> Zonas con afectación por otras emergencias (ej. incendios) ajenas al sismo." +
         "</div>";
      box.innerHTML = html ? (legendHtml + html) : "<p class=\\"ge-empty\\" style=\\"padding: 10px; color:var(--fg-muted)\\">Ningún municipio coincide con la búsqueda.</p>";`;

appjs = appjs.replace(oldBox, newBox);

fs.writeFileSync("assets/js/app.js", appjs);
console.log("Updated app.js with priority logic");

