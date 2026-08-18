
const fs = require("fs");

let appjs = fs.readFileSync("assets/js/app.js", "utf8");

const renderMuniStr = `function renderMunicipios() {
      var box = $("#muniGrid"); if (!box) return;
      populateMuniDept();
      var q = norm($("#muniSearch") ? $("#muniSearch").value : "");
      var dep = $("#muniDept") ? $("#muniDept").value : "";
      var all = TERR.municipalities || [];
      var list = all.filter(function (m) {
        if (dep && m.department !== dep) return false;
        if (q && norm((m.name || "") + " " + (m.department || "")).indexOf(q) === -1) return false;
        return true;
      });
      list.sort(function (a, b) { var d = muniRank(a) - muniRank(b); return d !== 0 ? d : String(a.name || "").localeCompare(String(b.name || "")); });
      
      // Group by department
      var byDept = {};
      list.forEach(function(m) {
        var d = m.department || "Otros";
        if(!byDept[d]) byDept[d] = [];
        byDept[d].push(m);
      });
      
      var depts = Object.keys(byDept).sort(function(a,b){
         // Sort departments by number of criticals, then by size
         var aCrit = byDept[a].filter(x => x.priority==="CRÍTICA" || x.priority==="MUY ALTA").length;
         var bCrit = byDept[b].filter(x => x.priority==="CRÍTICA" || x.priority==="MUY ALTA").length;
         if(bCrit !== aCrit) return bCrit - aCrit;
         return byDept[b].length - byDept[a].length;
      });
      
      var html = "";
      depts.forEach(function(d) {
         var muns = byDept[d];
         html += "<div class=\"muni-dept-group\">";
         html += "<h3 class=\"dept-title\">" + esc(d) + " <span class=\"dept-count\">(" + muns.length + ")</span></h3>";
         
         var crit = muns.filter(x => x.priority === "CRÍTICA" || x.priority === "MUY ALTA" || x.priority === "ALTA");
         var rest = muns.filter(x => x.priority !== "CRÍTICA" && x.priority !== "MUY ALTA" && x.priority !== "ALTA");
         
         if(crit.length) {
            html += "<div class=\"muni-grid\">" + crit.map(function(m) {
               var prio = m.priority ? "<span class=\"muni-prio p-" + slug(m.priority) + "\">" + esc(m.priority) + "</span>" : "";
               var link = m.url ? "<a class=\"open\" href=\"" + esc(m.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\">Ver fuente ?</a>" : "";
               return "<article class=\"muni-card\"><div class=\"muni-top\"><h3 class=\"muni-name\">" + esc(m.name) + "</h3></div>" + prio + (m.note ? "<p class=\"muni-note\">" + esc(m.note) + "</p>" : "") + link + "</article>";
            }).join("") + "</div>";
         }
         
         if(rest.length) {
            html += "<div class=\"muni-list-compact\">" + rest.map(function(m) {
               var prio = m.priority ? "<span class=\"muni-prio p-" + slug(m.priority) + " compact\">" + esc(m.priority) + "</span>" : "";
               return "<div class=\"muni-compact-item\"><span class=\"muni-name\">" + esc(m.name) + "</span>" + prio + "</div>";
            }).join("") + "</div>";
         }
         
         html += "</div>";
      });
      
      box.innerHTML = html || "<p class=\"ge-empty\" style=\"grid-column:1/-1;color:var(--fg-muted)\">Ningún municipio coincide con la búsqueda.</p>";
      var cnt = $("#muniCount"); if (cnt) cnt.textContent = list.length + (list.length === 1 ? " municipio" : " municipios") + (all.length !== list.length ? " de " + all.length : "");
      var nm = $("#navMuniCount"); if (nm) nm.textContent = all.length + " municipios afectados";
    }`;

appjs = appjs.replace(/function renderMunicipios\(\) \{[\s\S]*?navMuniCount"\);\n    \}/, renderMuniStr);
fs.writeFileSync("assets/js/app.js", appjs);

let styles = fs.readFileSync("assets/css/styles.css", "utf8");
let newStyles = `
/* Municipios Redesign */
.muni-dept-group { margin-bottom: 32px; }
.dept-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--line); color: var(--fg); display: flex; align-items: center; gap: 8px; }
.dept-count { font-size: 0.9rem; color: var(--fg-muted); font-weight: normal; }
.muni-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-bottom: 16px; }
.muni-card { background: var(--bg-card); border: 1px solid var(--line); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.muni-top { display: flex; justify-content: space-between; align-items: flex-start; }
.muni-name { font-weight: 600; font-size: 1.05rem; margin: 0; color: var(--fg); }
.muni-prio { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: var(--line); color: var(--fg); width: max-content; }
.muni-prio.p-crtica { background: #fee2e2; color: #991b1b; }
.muni-prio.p-muy-alta { background: #ffedd5; color: #9a3412; }
.muni-prio.p-alta { background: #fef3c7; color: #92400e; }
.muni-prio.p-media { background: #e0f2fe; color: #075985; }
.muni-prio.p-baja { background: #f3f4f6; color: #374151; }
/* dark mode overrides for prio */
@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]) .muni-prio.p-crtica { background: #7f1d1d; color: #fecaca; }
  html:not([data-theme="light"]) .muni-prio.p-muy-alta { background: #7c2d12; color: #fed7aa; }
  html:not([data-theme="light"]) .muni-prio.p-alta { background: #78350f; color: #fde68a; }
  html:not([data-theme="light"]) .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
  html:not([data-theme="light"]) .muni-prio.p-baja { background: #374151; color: #d1d5db; }
}
html[data-theme="dark"] .muni-prio.p-crtica { background: #7f1d1d; color: #fecaca; }
html[data-theme="dark"] .muni-prio.p-muy-alta { background: #7c2d12; color: #fed7aa; }
html[data-theme="dark"] .muni-prio.p-alta { background: #78350f; color: #fde68a; }
html[data-theme="dark"] .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
html[data-theme="dark"] .muni-prio.p-baja { background: #374151; color: #d1d5db; }

.muni-note { font-size: 0.9rem; color: var(--fg-muted); margin: 0; line-height: 1.4; }
.muni-list-compact { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.muni-compact-item { background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
.muni-compact-item .muni-name { font-size: 0.9rem; font-weight: 500; }
.muni-prio.compact { padding: 2px 6px; font-size: 0.65rem; }
`;

fs.writeFileSync("assets/css/styles.css", styles + newStyles);
console.log("Updated app.js and styles.css");

