
const fs = require("fs");
let appjs = fs.readFileSync("assets/js/app.js", "utf8");

// Remove filterMapList entirely
appjs = appjs.replace(/function filterMapList\(\) \{[\s\S]*?if \(!box\) return;\s*Array\.prototype\.forEach\.call[\s\S]*?\}\s*\}\s*\n/g, "");

// Remove renderMapList entirely
appjs = appjs.replace(/function renderMapList\(\) \{[\s\S]*?\}\s*\}\s*\n/g, "");

// Fix calls to renderMapList
appjs = appjs.replace(/if \(mapReady\) addMapMarkers\(\); else renderMapList\(\);/g, "if (mapReady) addMapMarkers();");
appjs = appjs.replace(/renderMapList\(\);/g, "");

// Remove old renderMunicipios
appjs = appjs.replace(/function renderMunicipios\(\) \{[\s\S]*?navMuniCount"\);\s*if \(nm\).*?;?\s*\}/, "function renderMunicipios() { /*REPLACE_ME*/ }");

const newRenderMuni = `function renderMunicipios() {
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
      
      // Update Map Markers visibility
      var visibleNames = {};
      list.forEach(function(m) { visibleNames[norm(m.name) + "|" + norm(m.department || "")] = true; });
      if(window._crcMap && typeof mapMarkers !== "undefined") {
        (TERR.mapPoints || []).forEach(function(p) {
          var k = norm(p.name) + "|" + norm(p.department || "");
          var mkr = mapMarkers[p.id];
          if(mkr) {
             if(!q && !dep) {
               if(!window._crcMap.hasLayer(mkr)) window._crcMap.addLayer(mkr);
             } else {
               if(visibleNames[k]) {
                 if(!window._crcMap.hasLayer(mkr)) window._crcMap.addLayer(mkr);
               } else {
                 if(window._crcMap.hasLayer(mkr)) window._crcMap.removeLayer(mkr);
               }
             }
          }
        });
      }
      
      // Group by department
      var byDept = {};
      list.forEach(function(m) {
        var d = m.department || "Otros";
        if(!byDept[d]) byDept[d] = [];
        byDept[d].push(m);
      });
      
      var depts = Object.keys(byDept).sort(function(a,b){
         var aCrit = byDept[a].filter(x => x.priority==="CRÍTICA" || x.priority==="MUY ALTA").length;
         var bCrit = byDept[b].filter(x => x.priority==="CRÍTICA" || x.priority==="MUY ALTA").length;
         if(bCrit !== aCrit) return bCrit - aCrit;
         return byDept[b].length - byDept[a].length;
      });
      
      var html = "";
      depts.forEach(function(d) {
         var muns = byDept[d];
         html += "<div class=\\"muni-dept-group\\">";
         html += "<h3 class=\\"dept-title\\">" + esc(d) + " <span class=\\"dept-count\\">(" + muns.length + ")</span></h3>";
         
         var crit = muns.filter(x => x.priority === "CRÍTICA" || x.priority === "MUY ALTA" || x.priority === "ALTA");
         var rest = muns.filter(x => x.priority !== "CRÍTICA" && x.priority !== "MUY ALTA" && x.priority !== "ALTA");
         
         var mapMatcher = function(m) {
            var k = norm(m.name) + "|" + norm(m.department || "");
            var point = (TERR.mapPoints || []).find(p => norm(p.name) + "|" + norm(p.department || "") === k);
            return point ? point.id : "";
         };
         
         if(crit.length) {
            html += "<div class=\\"muni-grid\\">" + crit.map(function(m) {
               var prio = m.priority ? "<span class=\\"muni-prio p-" + slug(m.priority) + "\\">" + esc(m.priority) + "</span>" : "";
               var pid = mapMatcher(m);
               var attrs = pid ? " data-point=\\"" + esc(pid) + "\\" style=\\"cursor:pointer\\"" : "";
               return "<article class=\\"muni-card\\"" + attrs + "><div class=\\"muni-top\\"><h3 class=\\"muni-name\\">" + esc(m.name) + "</h3></div>" + prio + "</article>";
            }).join("") + "</div>";
         }
         
         if(rest.length) {
            html += "<div class=\\"muni-list-compact\\">" + rest.map(function(m) {
               var prio = m.priority ? "<span class=\\"muni-prio p-" + slug(m.priority) + " compact\\">" + esc(m.priority) + "</span>" : "";
               var pid = mapMatcher(m);
               var attrs = pid ? " data-point=\\"" + esc(pid) + "\\" style=\\"cursor:pointer\\"" : "";
               return "<div class=\\"muni-compact-item\\"" + attrs + "><span class=\\"muni-name\\">" + esc(m.name) + "</span>" + prio + "</div>";
            }).join("") + "</div>";
         }
         
         html += "</div>";
      });
      
      box.innerHTML = html || "<p class=\\"ge-empty\\" style=\\"padding: 10px; color:var(--fg-muted)\\">Ningún municipio coincide con la búsqueda.</p>";
      
      // Bind click events
      Array.prototype.forEach.call(box.querySelectorAll("[data-point]"), function (el) {
        el.addEventListener("click", function (e) {
          var id = el.getAttribute("data-point");
          var p = (TERR.mapPoints || []).find(x => x.id === id);
          if (window._crcMap && p && p.coords) {
             window._crcMap.setView(p.coords, 10);
             if (typeof mapMarkers !== "undefined" && mapMarkers[id]) mapMarkers[id].openPopup();
          }
        });
      });
    }`;

appjs = appjs.replace("function renderMunicipios() { /*REPLACE_ME*/ }", newRenderMuni);

fs.writeFileSync("assets/js/app.js", appjs);
console.log("Updated app.js");

