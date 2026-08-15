/* Central de Recursos Digitales — Colombia. Enrutado de vistas + render + datos en vivo. */
(function () {
  "use strict";

  var DATA = window.CRC_DATA;
  var TERR = window.CRC_TERRITORY || {};
  var ORI = window.CRC_ORIENTA || {};
  var COMP = window.CRC_COMPRENDER || {};
  if (!DATA) { console.error("No se cargó data/resources.js"); return; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var NL = String.fromCharCode(10);
  var reDia = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(reDia, ""); };
  var slug = function (s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };

  /* ---------- Tema ---------- */
  var root = document.documentElement;
  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function setTheme(t) { root.setAttribute("data-theme", t); try { localStorage.setItem("crc-theme", t); } catch (e) {} }
  (function () { var s; try { s = localStorage.getItem("crc-theme"); } catch (e) {} if (s) root.setAttribute("data-theme", s); })();

  /* ---------- Enrutado de vistas ---------- */
  var VIEWS = ["inicio", "recursos", "mapa", "municipios", "entender", "actuar"];
  var mapReady = false;

  function showView(name) {
    if (VIEWS.indexOf(name) === -1) name = "inicio";
    VIEWS.forEach(function (v) {
      var sec = document.getElementById("view-" + v);
      if (sec) sec.hidden = (v !== name);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) {
      var on = t.getAttribute("data-view") === name;
      t.classList.toggle("active", on);
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    if (name === "mapa") initMap();
    window.scrollTo(0, 0);
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, "").split("?")[0];
    showView(h || "inicio");
  }

  /* ---------- Estado recursos ---------- */
  var state = { mode: "todos", intent: "", type: "", coverage: "", verification: "", q: "" };

  function intentsForMode(mode) {
    return DATA.intents.filter(function (it) { return mode === "todos" || it.mode === mode || it.mode === "ambos"; });
  }
  function resourceMatchesMode(r, mode) {
    if (mode === "todos") return true;
    var ids = intentsForMode(mode).map(function (i) { return i.id; });
    return r.intents.some(function (i) { return ids.indexOf(i) !== -1; });
  }
  function filtered() {
    var q = norm(state.q);
    return DATA.resources.filter(function (r) {
      if (!resourceMatchesMode(r, state.mode)) return false;
      if (state.intent && r.intents.indexOf(state.intent) === -1) return false;
      if (state.type && r.type !== state.type) return false;
      if (state.coverage && r.coverage !== state.coverage) return false;
      if (state.verification && r.verification !== state.verification) return false;
      if (q) { var hay = norm([r.name, r.org, r.description, r.action, r.coverage].join(" ")); if (hay.indexOf(q) === -1) return false; }
      return true;
    });
  }

  function renderIntents() {
    var box = $("#intents"); if (!box) return;
    box.innerHTML = "";
    box.appendChild(makeIntentChip({ id: "", icon: "✦", label: "Todas las necesidades" }, state.intent === ""));
    intentsForMode(state.mode).forEach(function (it) { box.appendChild(makeIntentChip(it, state.intent === it.id)); });
  }
  function makeIntentChip(it, pressed) {
    var b = el("button", { "class": "intent", type: "button", "aria-pressed": pressed ? "true" : "false" });
    b.innerHTML = '<span class="emoji" aria-hidden="true">' + esc(it.icon) + "</span>" + esc(it.label);
    if (it.hint) b.title = it.hint;
    b.addEventListener("click", function () { state.intent = (state.intent === it.id) ? "" : it.id; applyResources(); });
    return b;
  }
  function fillSelect(sel, options, current, allLabel) {
    if (!sel) return;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "" }, allLabel));
    options.forEach(function (o) { var opt = el("option", { value: o.value }, esc(o.label)); if (o.value === current) opt.selected = true; sel.appendChild(opt); });
  }
  function uniqueCoverages() {
    var seen = {}, out = [];
    DATA.resources.forEach(function (r) { if (!seen[r.coverage]) { seen[r.coverage] = 1; out.push(r.coverage); } });
    return out.sort().map(function (c) { return { value: c, label: c }; });
  }
  function renderFilters() {
    fillSelect($("#fType"), Object.keys(DATA.types).map(function (k) { return { value: k, label: DATA.types[k].label }; }), state.type, "Cualquier tipo");
    fillSelect($("#fCoverage"), uniqueCoverages(), state.coverage, "Todo el territorio");
    fillSelect($("#fVerif"), Object.keys(DATA.verifications).map(function (k) { return { value: k, label: DATA.verifications[k].label }; }), state.verification, "Cualquier verificación");
    var s = $("#search"); if (s && s.value !== state.q) s.value = state.q;
  }
  function badge(cls, tone, dot, text, title) {
    return '<span class="badge ' + cls + (tone ? " tone-" + tone : "") + '"' + (title ? ' title="' + esc(title) + '"' : "") + ">" +
      (dot ? '<span class="tdot" aria-hidden="true"></span>' : "") + esc(text) + "</span>";
  }
  function metaRow(label, value) { return value ? "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>" : ""; }
  function card(r) {
    var t = DATA.types[r.type] || { label: r.type };
    var st = DATA.statuses[r.status] || { label: r.status, tone: "muted" };
    var vf = DATA.verifications[r.verification] || { label: r.verification, tone: "muted" };
    var badges = '<div class="badges">' + badge("type", "", false, t.label, t.help) + badge("verif", vf.tone, true, vf.label, vf.help) + badge("status", st.tone, true, st.label, st.help) + "</div>";
    var meta = '<dl class="meta">' + metaRow("Cobertura", r.coverage) + metaRow("Responsable", r.org) + metaRow("Actualización", r.declaredUpdate) + metaRow("Última revisión", r.lastReview) + "</dl>";
    var alerts = "";
    if (r.warn) alerts += '<p class="alert warn"><span class="ai" aria-hidden="true">⚠️</span><span>' + esc(r.warn) + "</span></p>";
    if (r.sensitive) alerts += '<p class="alert sensitive"><span class="ai" aria-hidden="true">🔒</span><span>' + esc(r.note || "Maneja datos personales: se enlaza al portal original; aquí no se replican.") + "</span></p>";
    else if (r.note) alerts += '<p class="alert sensitive"><span class="ai" aria-hidden="true">ℹ️</span><span>' + esc(r.note) + "</span></p>";
    var isTel = /^tel:/.test(r.url);
    var open = '<a class="open" href="' + esc(r.url) + '"' + (isTel ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + (isTel ? "Llamar ahora" : "Abrir recurso") + ' <span aria-hidden="true">' + (isTel ? "☎" : "↗") + "</span></a>";
    var body = ["Recurso: " + r.name, "Enlace: " + r.url, "", "Describe el problema (enlace caído, información desactualizada, dato sensible, etc.):", ""].join(NL);
    var mailto = "mailto:" + encodeURIComponent(DATA.meta.contactEmail) + "?subject=" + encodeURIComponent("Reporte sobre recurso: " + r.name) + "&body=" + encodeURIComponent(body);
    var report = '<a class="report" href="' + mailto + '" title="Reportar un problema con este recurso">Reportar</a>';
    var c = el("article", { "class": "card" });
    c.innerHTML = badges + "<h3>" + esc(r.name) + "</h3>" + '<p class="action">' + esc(r.action) + "</p>" + '<p class="desc">' + esc(r.description) + "</p>" + meta + alerts + '<div class="card-actions">' + open + report + "</div>";
    return c;
  }
  function applyResources() {
    renderIntents(); renderFilters();
    var list = filtered(), grid = $("#grid"); if (!grid) return;
    grid.innerHTML = "";
    if (!list.length) { grid.appendChild(makeEmpty()); }
    else { var frag = document.createDocumentFragment(); list.forEach(function (r) { frag.appendChild(card(r)); }); grid.appendChild(frag); }
    var count = $("#count");
    if (count) count.innerHTML = "<b>" + list.length + "</b> recurso" + (list.length === 1 ? "" : "s") + (state.mode === "ayuda" ? " para quien necesita ayuda" : state.mode === "aportar" ? " para quien quiere ayudar" : "");
    Array.prototype.forEach.call(document.querySelectorAll(".mode-switch button"), function (b) { b.setAttribute("aria-pressed", b.dataset.mode === state.mode ? "true" : "false"); });
    var nc = $("#navRecursosCount"); if (nc) nc.textContent = DATA.resources.length + " recursos verificados";
  }
  function makeEmpty() {
    var d = el("div", { "class": "empty" });
    d.innerHTML = "<h3>Sin resultados</h3><p>No hay recursos que coincidan con estos filtros.</p>";
    var b = el("button", { type: "button" }, "Limpiar filtros");
    b.addEventListener("click", resetAll); d.appendChild(b); return d;
  }
  function resetAll() { state = { mode: "todos", intent: "", type: "", coverage: "", verification: "", q: "" }; applyResources(); }

  /* ---------- Situación ---------- */
  function renderSituation(list) {
    var box = $("#situationList"); if (!box) return;
    if (!list || !list.length) { box.innerHTML = ""; return; }
    box.innerHTML = list.map(function (s) {
      var sev = s.severity || "info", asOf = s.as_of ? String(s.as_of).slice(0, 10) : "";
      var region = s.region ? '<span class="sit-region">' + esc(s.region) + "</span>" : "";
      var metric = s.metric ? '<div class="sit-metric">' + esc(s.metric) + "</div>" : "";
      var summary = s.summary ? '<p class="sit-summary">' + esc(s.summary) + "</p>" : "";
      var foot = '<div class="sit-foot"><span>' + esc(s.source_name || "") + "</span><span>" + esc(asOf) + "</span></div>";
      var href = s.url ? esc(s.url) : "#", attrs = s.url ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a class="sit-card sev-' + esc(sev) + '" href="' + href + '"' + attrs + ">" + region + '<div class="sit-title">' + esc(s.title) + "</div>" + metric + summary + foot + "</a>";
    }).join("");
  }
  function markLiveBadge(id, ok) { var b = $(id); if (!b) return; b.textContent = ok ? "En vivo" : "Local"; b.className = "live-state " + (ok ? "on" : "off"); b.hidden = false; }
  function fetchTable(table, order) {
    var sb = DATA.meta && DATA.meta.supabase;
    if (!sb || !sb.url || !sb.anonKey) return Promise.reject("sin config");
    var base = sb.url.charAt(sb.url.length - 1) === "/" ? sb.url.slice(0, -1) : sb.url;
    return fetch(base + "/rest/v1/" + table + "?select=*&is_published=eq.true&order=" + order, { headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey } })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); });
  }
  function loadSituation() {
    renderSituation(DATA.situation || []);
    fetchTable("situation_updates", "sort_order.asc")
      .then(function (rows) { if (Array.isArray(rows) && rows.length) { DATA.situation = rows; renderSituation(rows); markLiveBadge("#situationLive", true); } })
      .catch(function () { markLiveBadge("#situationLive", false); });
  }

  /* ---------- Recursos en vivo ---------- */
  function mapRow(r) {
    return { id: r.id, name: r.name, org: r.org, action: r.action, description: r.description,
      intents: Array.isArray(r.intents) ? r.intents : [], type: r.type, coverage: r.coverage, url: r.url,
      status: r.status, verification: r.verification, declaredUpdate: r.declared_update,
      lastReview: r.last_review ? String(r.last_review).slice(0, 10) : "", sensitive: !!r.sensitive,
      warn: r.warn || undefined, note: r.note || undefined };
  }
  function loadLiveResources() {
    fetchTable("digital_resources", "sort_order.asc,name.asc")
      .then(function (rows) { if (Array.isArray(rows) && rows.length) { DATA.resources = rows.map(mapRow); applyResources(); markLiveBadge("#liveState", true); } })
      .catch(function () { markLiveBadge("#liveState", false); });
  }
  function loadTerritory() {
    fetchTable("municipalities", "sort_order.asc")
      .then(function (rows) { if (Array.isArray(rows) && rows.length) { TERR.municipalities = rows; renderMunicipios(); } })
      .catch(function () {});
    fetchTable("map_points", "sort_order.asc")
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) {
          TERR.mapPoints = rows.map(function (p) { return { id: p.id, type: p.type, name: p.name, department: p.department, coords: [p.lat, p.lng], note: p.note, source: p.source_name, url: p.url }; });
          if (mapReady) addMapMarkers(); else renderMapList();
        }
      })
      .catch(function () {});
  }
  function loadTimeline() {
    fetchTable("timeline", "sort_order.asc")
      .then(function (rows) { if (Array.isArray(rows) && rows.length) { COMP.cronologia = rows; renderComprender(); renderHeroFacts(); } })
      .catch(function () {});
  }
  function loadExplicaciones() {
    fetchTable("explicaciones", "sort_order.asc")
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) {
          COMP.explicacion = rows.map(function (e) {
            return { icon: e.icon, title: e.title, body: e.body, mas: e.mas || [],
              link: e.link_label ? { label: e.link_label, url: e.link_url } : undefined };
          });
          renderComprender();
        }
      })
      .catch(function () {});
  }
  function loadOrientaciones() {
    fetchTable("orientaciones", "sort_order.asc")
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) {
          ORI.orientaciones = rows.map(function (o) {
            return { id: o.id, icon: o.icon, title: o.title, quePasa: o.que_pasa,
              pasos: o.pasos || [], acudir: o.acudir || [], estafa: o.estafa, linea: o.linea,
              diferencial: { rural: o.diferencial_rural, etnico: o.diferencial_etnico, mayores: o.diferencial_mayores },
              fuentes: o.fuentes || [] };
          });
          renderOrientaciones();
        }
      })
      .catch(function () {});
  }

  /* ---------- Territorio: municipios + guías + mapa ---------- */
  function renderMunicipios() {
    var box = $("#muniGrid"); if (!box) return;
    var list = TERR.municipalities || [];
    box.innerHTML = list.map(function (m) {
      var prio = '<span class="muni-prio p-' + slug(m.priority) + '">' + esc(m.priority) + "</span>";
      var link = m.url ? '<a class="open" href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer">Ver fuente ↗</a>' : "";
      return '<article class="muni-card"><div class="muni-top"><h3 class="muni-name">' + esc(m.name) + '</h3><span class="muni-dep">' + esc(m.department) + "</span></div>" +
        prio + '<p class="muni-note">' + esc(m.note || "") + "</p>" + link + "</article>";
    }).join("");
    var nm = $("#navMuniCount"); if (nm) nm.textContent = list.length + " municipios con afectación";
  }
  function chip(label, value) { return '<span class="ori-chip"><b>' + esc(label) + "</b> " + esc(value) + "</span>"; }
  var oriFase = "";
  function orientacionesForFase() {
    var all = ORI.orientaciones || [];
    if (!oriFase) return all;
    var m = ORI.fasesPorId || {};
    return all.filter(function (o) { return (m[o.id] || []).indexOf(oriFase) !== -1; });
  }
  function renderFases() {
    var box = $("#fasePicker"); if (!box) return;
    var items = [{ id: "", icon: "•", label: "Ver todas las guías" }].concat(ORI.fases || []);
    box.innerHTML = "";
    items.forEach(function (f) {
      var b = el("button", { "class": "fase-chip", type: "button", "aria-pressed": oriFase === f.id ? "true" : "false" });
      b.innerHTML = (f.icon ? '<span aria-hidden="true">' + esc(f.icon) + "</span> " : "") + esc(f.label);
      b.addEventListener("click", function () { 
        oriFase = f.id; 
        updateFaseIntro(); 
        renderFases(); 
        renderOrientaciones(); 
        // Sync with resources mode
        if (f.id === "ayuda" || f.id === "aportar") {
          state.mode = f.id;
          state.intent = "";
          applyResources();
        }
      });
      box.appendChild(b);
    });
  }
  function updateFaseIntro() {
    var p = $("#faseIntro"); if (!p) return;
    var f = (ORI.fases || []).filter(function (x) { return x.id === oriFase; })[0];
    p.textContent = f ? f.intro : "";
    p.hidden = !f;
  }
  function renderOrientaciones() {
    var box = $("#orientaciones"); if (!box) return;
    box.innerHTML = orientacionesForFase().map(function (o) {
      var pasos = (o.pasos || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      var acudir = (o.acudir || []).map(function (a) { return chip(a.who, a.channel); }).join("");
      var fuentes = (o.fuentes || []).map(function (f) { return '<a href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' + esc(f.label) + " ↗</a>"; }).join("");
      var dif = o.diferencial || {};
      var difBlock = '<div class="ori-dif"><h4>Según tu situación</h4>' +
        (dif.rural ? '<p><b>Rural o sin señal.</b> ' + esc(dif.rural) + "</p>" : "") +
        (dif.etnico ? '<p><b>Comunidades indígenas y afro.</b> ' + esc(dif.etnico) + "</p>" : "") +
        (dif.mayores ? '<p><b>Personas mayores o con discapacidad.</b> ' + esc(dif.mayores) + "</p>" : "") + "</div>";
      return '<details class="ori" id="ori-' + esc(o.id) + '">' +
        '<summary><span class="ori-ic" aria-hidden="true">' + esc(o.icon || "•") + '</span><span class="ori-sum"><span class="ori-t">' + esc(o.title) + '</span><span class="ori-q">' + esc(o.quePasa || "") + "</span></span></summary>" +
        '<div class="ori-body">' +
          "<ol class=\"ori-pasos\">" + pasos + "</ol>" +
          (acudir ? '<div class="ori-row"><h4>A quién acudir</h4><div class="ori-chips">' + acudir + "</div></div>" : "") +
          (o.estafa ? '<p class="ori-warn"><span aria-hidden="true">⚠️</span> ' + esc(o.estafa) + "</p>" : "") +
          (o.linea ? '<p class="ori-line"><span aria-hidden="true">☎</span> <b>Línea:</b> ' + esc(o.linea) + "</p>" : "") +
          difBlock +
          (fuentes ? '<p class="ori-src">Fuentes: ' + fuentes + "</p>" : "") +
        "</div></details>";
    }).join("");
  }
  function renderPreparacion() {
    var p = ORI.preparacion || {};
    var kit = $("#prepKit"); if (kit) kit.innerHTML = (p.kit || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    var plan = $("#prepPlan"); if (plan) plan.innerHTML = (p.plan || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    var fm = $("#prepFormacion");
    if (fm) fm.innerHTML = (p.formacion || []).map(function (f) {
      return '<a class="prep-link" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(f.label) + "</b><span>" + esc(f.desc || "") + "</span></a>";
    }).join("");
  }
  function renderLineas() {
    var box = $("#lineasTable"); if (!box) return;
    box.innerHTML = (ORI.lineas || []).map(function (l) {
      var tel = /^[0-9]/.test(l.num) ? '<a href="tel:' + esc(l.num.replace(/\s/g, "")) + '">' + esc(l.num) + "</a>" : esc(l.num);
      return '<div class="linea"><span class="linea-num">' + tel + '</span><span class="linea-lb">' + esc(l.label) + '</span><span class="linea-nt">' + esc(l.note || "") + "</span></div>";
    }).join("");
  }

  var mapMarkers = {};
  function markerColor(type) { return type === "epicentro" ? "#e6603f" : type === "incendio" ? "#e0a11a" : "#2f7de1"; }
  function addMapMarkers() {
    var map = window._crcMap; if (!map || !window.L) return;
    Object.keys(mapMarkers).forEach(function (k) { map.removeLayer(mapMarkers[k]); });
    mapMarkers = {};
    (TERR.mapPoints || []).forEach(function (p) {
      if (!p.coords) return;
      var m = L.circleMarker(p.coords, { radius: p.type === "epicentro" ? 11 : 8, color: "#fff", weight: 2, fillColor: markerColor(p.type), fillOpacity: .9 }).addTo(map);
      var src = p.url ? '<br><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.source || "Fuente") + " ↗</a>" : "";
      m.bindPopup("<b>" + esc(p.name) + "</b><br>" + esc(p.department || "") + "<br>" + esc(p.note || "") + src);
      mapMarkers[p.id] = m;
    });
    renderMapList();
  }
  function initMap() {
    var node = $("#map"); if (!node) return;
    if (!window.L) { node.innerHTML = '<p style="padding:20px;color:var(--fg-muted)">No se pudo cargar el mapa (sin conexión). Los puntos siguen listados a la derecha.</p>'; renderMapList(); return; }
    if (mapReady) { if (window._crcMap) window._crcMap.invalidateSize(); return; }
    mapReady = true;
    var map = L.map(node, { scrollWheelZoom: false }).setView(TERR.mapCenter || [4.6, -75.9], TERR.mapZoom || 7);
    window._crcMap = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
    
    // Add "Recentrar" control
    var centerBtn = L.control({position: 'topleft'});
    centerBtn.onAdd = function (m) {
      var btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
      btn.innerHTML = '⌂';
      btn.title = 'Recentrar mapa';
      btn.style.width = '30px'; btn.style.height = '30px'; btn.style.cursor = 'pointer'; btn.style.backgroundColor = 'white'; btn.style.border = '2px solid rgba(0,0,0,0.2)'; btn.style.borderRadius = '4px'; btn.style.fontSize = '16px'; btn.style.lineHeight = '30px';
      btn.onclick = function(e){ e.stopPropagation(); m.setView(TERR.mapCenter || [4.6, -75.9], TERR.mapZoom || 7); };
      return btn;
    };
    centerBtn.addTo(map);

    addMapMarkers();
    setTimeout(function () { map.invalidateSize(); }, 60);
  }
  
  function filterMapList() {
    var q = norm($("#muniSearch").value);
    var box = $("#mapList"); if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll(".leg-item"), function(el) {
      var txt = norm(el.textContent);
      el.style.display = txt.indexOf(q) === -1 ? 'none' : 'flex';
    });
  }

  function renderMapList() {
    var wrap = $("#mapListWrap"); 
    if (!wrap) return;
    wrap.innerHTML = '<input type="search" id="muniSearch" placeholder="Buscar municipio..." class="muni-search"><div id="mapList" class="map-list"></div>';
    $("#muniSearch").addEventListener("input", filterMapList);
    
    var box = $("#mapList");
    if (!box) return;
    box.innerHTML = (TERR.mapPoints || []).map(function (p) {
      return '<a class="leg-item" href="#mapa" data-point="' + esc(p.id) + '"><span class="lt">' + esc(p.name) + '</span><span class="ld">' + esc(p.department || "") + " · " + esc(p.note || "") + "</span></a>";
    }).join("");
    Array.prototype.forEach.call(box.querySelectorAll(".leg-item"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-point"), p = (TERR.mapPoints || []).filter(function (x) { return x.id === id; })[0];
        if (window._crcMap && p && p.coords) { window._crcMap.setView(p.coords, 9); if (mapMarkers[id]) mapMarkers[id].openPopup(); }
      });
    });
  }

  /* ---------- Entender qué pasó ---------- */
  function renderComprender() {
    var r = COMP.resumen || {};
    var rc = $("#resumenCard");
    if (rc && r.magnitud) {
      var stat = function (k, v) { return v ? '<div class="rc-stat"><dt>' + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>" : ""; };
      var src = r.fuente ? '<a class="rc-src" href="' + esc(r.fuente.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.fuente.label) + " ↗</a>" : "";
      rc.innerHTML = '<dl class="rc-stats">' + stat("Magnitud", r.magnitud) + stat("Fecha", r.fecha) + stat("Hora", r.hora) + stat("Epicentro", r.epicentro) + stat("Profundidad", r.profundidad) + "</dl>" +
        (r.nota ? '<p class="rc-nota">' + esc(r.nota) + "</p>" : "") + src;
    }
    var moreBlock = function (paras) {
      if (!paras || !paras.length) return "";
      var ps = paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
      return '<details class="more"><summary>Leer más</summary><div class="more-body">' + ps + "</div></details>";
    };
    var eg = $("#explicaGrid");
    if (eg) eg.innerHTML = (COMP.explicacion || []).map(function (e) {
      var link = e.link ? '<a class="explica-link" href="' + esc(e.link.url) + '"' + (/^#/.test(e.link.url) ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(e.link.label) + " →</a>" : "";
      return '<article class="explica-card"><div class="ex-ic" aria-hidden="true">' + esc(e.icon || "•") + "</div><h3>" + esc(e.title) + "</h3><p>" + esc(e.body) + "</p>" + moreBlock(e.mas) + link + "</article>";
    }).join("");
    var hi = $("#historiaIntro"); if (hi) hi.textContent = COMP.historiaIntro || "";
    var hg = $("#historiaGrid");
    if (hg) hg.innerHTML = (COMP.historia || []).map(function (h) {
      return '<article class="hist-card"><div class="hist-year">' + esc(h.year) + '</div><div class="hist-body"><b>' + esc(h.place) + '</b> <span class="hist-mag">M ' + esc(h.mag) + "</span><p>" + esc(h.note) + "</p></div></article>";
    }).join("");
    var cu = $("#cronoUpdated"); if (cu) cu.textContent = COMP.actualizado ? "Actualizado el " + COMP.actualizado + ". Se ampliará con los días." : "";
    var cl = $("#cronoList");
    if (cl) cl.innerHTML = (COMP.cronologia || []).map(function (d) {
      var items = (d.items || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
      var fuentes = (d.fuentes || []).map(function (f) { return '<a href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' + esc(f.label) + " ↗</a>"; }).join("");
      return '<div class="crono-item"><div class="crono-when"><span class="crono-dia">' + esc(d.dia) + '</span><span class="crono-fecha">' + esc(d.fecha) + "</span></div>" +
        '<div class="crono-card"><h3>' + esc(d.titulo) + "</h3><ul>" + items + "</ul>" + (d.detalle ? moreBlock([d.detalle]) : "") + (fuentes ? '<p class="crono-src">Fuentes: ' + fuentes + "</p>" : "") + "</div></div>";
    }).join("");
  }

  function renderHeroFacts() {
    var r = COMP.resumen || {}; var box = $("#heroFacts"); if (!box || !r.magnitud) return;
    var mag = String(r.magnitud).split(" ")[0];
    var row = function (k, v) { return v ? "<div><dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>" : ""; };
    box.innerHTML = '<div class="hf-card"><div class="hf-mag">' + esc(mag) + ' <span>Mw</span></div>' +
      "<dl>" + row("Fecha", r.fecha) + row("Epicentro", r.epicentro) + row("Profundidad", r.profundidad) + "</dl>" +
      '<a class="hf-link" href="#entender">Entender qué pasó →</a></div>';
  }

  /* ---------- Contenido estático ---------- */
  function fillStatic() {
    var eq = DATA.meta.earthquake, e = $("#eqInfo");
    if (e && eq) e.textContent = "Sismo " + eq.magnitude + " · " + eq.date + " · epicentro " + eq.epicenter;
    var rd = $("#reviewDate"); if (rd) rd.textContent = DATA.meta.lastReview;
    var le = $("#emergencyLines"); if (le) le.textContent = DATA.emergencyLines.map(function (l) { return l.number + " " + l.label; }).join(" · ");
    var cta = $("#proposeCta");
    if (cta) {
      var pb = ["Nombre del recurso:", "Enlace (URL):", "Organización responsable:", "¿Qué resuelve?:", "Cobertura territorial:", "¿Maneja datos personales?:", ""].join(NL);
      cta.href = "mailto:" + encodeURIComponent(DATA.meta.contactEmail) + "?subject=" + encodeURIComponent("Propuesta de recurso para el directorio") + "&body=" + encodeURIComponent(pb);
    }
    var mail = $("#contactMail"); if (mail) { mail.textContent = DATA.meta.contactEmail; mail.href = "mailto:" + DATA.meta.contactEmail; }
  }

  /* ---------- Eventos ---------- */
  function bind() {
    Array.prototype.forEach.call(document.querySelectorAll(".mode-switch button"), function (b) {
      b.addEventListener("click", function () { state.mode = b.dataset.mode; state.intent = ""; applyResources(); });
    });
    // Puertas de recorrido en Inicio → van a Actuar y sincronizan el modo
    Array.prototype.forEach.call(document.querySelectorAll(".door"), function (d) {
      d.addEventListener("click", function () { 
        var aud = d.getAttribute("data-audiencia") || "ayuda";
        
        // Sincronizar Recursos
        state.mode = aud; 
        state.intent = ""; 
        applyResources(); 
        
        // Sincronizar Guías (Actuar)
        oriFase = aud;
        updateFaseIntro(); 
        renderFases(); 
        renderOrientaciones();
      });
    });
    var byId = function (id, ev, fn) { var n = $(id); if (n) n.addEventListener(ev, fn); };
    byId("#fType", "change", function (e) { state.type = e.target.value; applyResources(); });
    byId("#fCoverage", "change", function (e) { state.coverage = e.target.value; applyResources(); });
    byId("#fVerif", "change", function (e) { state.verification = e.target.value; applyResources(); });
    var timer; byId("#search", "input", function (e) { clearTimeout(timer); var v = e.target.value; timer = setTimeout(function () { state.q = v; applyResources(); }, 160); });
    byId("#resetFilters", "click", resetAll);
    byId("#themeToggle", "click", function () { setTheme(currentTheme() === "dark" ? "light" : "dark"); });
    var pm = $("#printModal");
    byId("#openPrintModal", "click", function () { if (pm) pm.showModal(); });
    byId("#closePrintModal", "click", function () { if (pm) pm.close(); });
    byId("#printForm", "submit", function (e) {
      e.preventDefault();
      if (pm) pm.close();
      
      var pAyuda = e.target.elements["p_ayuda"].checked;
      var pAportar = e.target.elements["p_aportar"].checked;
      var pLineas = e.target.elements["p_lineas"].checked;
      var pPrep = e.target.elements["p_prep"].checked;

      // Temporarily render all guides so we can print what's selected
      var oldFase = oriFase;
      oriFase = ""; 
      renderOrientaciones();
      
      // Open all details to print
      Array.prototype.forEach.call(document.querySelectorAll("#orientaciones details"), function (d) { d.open = true; });

      // Apply no-print classes
      Array.prototype.forEach.call(document.querySelectorAll("#orientaciones details"), function (d) {
        var id = d.id.replace("ori-", "");
        var fases = ORI.fasesPorId[id] || [];
        var isAyuda = fases.indexOf("ayuda") !== -1;
        var isAportar = fases.indexOf("aportar") !== -1;
        
        var keep = false;
        if (pAyuda && isAyuda) keep = true;
        if (pAportar && isAportar) keep = true;
        
        if (!keep) d.classList.add("no-print");
      });

      var blockLineas = $("#block-lineas");
      if (blockLineas) {
        if (!pLineas) blockLineas.classList.add("no-print");
        else blockLineas.classList.remove("no-print");
      }

      var blockPrep = $("#block-prep");
      if (blockPrep) {
        if (!pPrep) blockPrep.classList.add("no-print");
        else blockPrep.classList.remove("no-print");
      }

      window.print();

      // Restore state
      oriFase = oldFase;
      renderOrientaciones();
      if (blockLineas) blockLineas.classList.remove("no-print");
      if (blockPrep) blockPrep.classList.remove("no-print");
    });
    window.addEventListener("hashchange", route);
  }

  /* ---------- Init ---------- */
  fillStatic();
  bind();
  applyResources();
  renderMunicipios();
  renderFases();
  updateFaseIntro();
  renderOrientaciones();
  renderPreparacion();
  renderLineas();
  renderComprender();
  renderHeroFacts();
  renderSituation(DATA.situation || []);
  route();              // muestra la vista según el hash (o Inicio)
  loadSituation();      // en vivo
  loadLiveResources();  // recursos en vivo
  loadTerritory();      // municipios + mapa en vivo
  loadTimeline();       // cronología en vivo
  loadExplicaciones();  // explicaciones en vivo
  loadOrientaciones();  // orientaciones en vivo
})();
