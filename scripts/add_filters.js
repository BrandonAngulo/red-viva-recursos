
const fs = require("fs");
let html = fs.readFileSync("index.html", "utf8");

const oldControls = `<div class="muni-controls">
              <input id="muniSearch" type="search" placeholder="Buscar municipio…" autocomplete="off" aria-label="Buscar municipio">
              <select id="muniDept" aria-label="Filtrar por departamento"><option value="">Todos los departamentos</option></select>
            </div>`;

const newControls = `<div class="muni-controls">
              <input id="muniSearch" type="search" placeholder="Buscar municipio…" autocomplete="off" aria-label="Buscar municipio">
              <select id="muniDept" aria-label="Filtrar por departamento"><option value="">Todos los departamentos</option></select>
              <select id="muniPrio" aria-label="Filtrar por prioridad">
                <option value="">Todas las prioridades</option>
                <option value="CRÍTICA">Crítica</option>
                <option value="MUY ALTA">Muy Alta</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
                <option value="EMERGENCIA PARALELA">Otro Evento (Ej. Incendios)</option>
              </select>
            </div>`;

html = html.replace(oldControls, newControls);
fs.writeFileSync("index.html", html);
console.log("Updated index.html");

