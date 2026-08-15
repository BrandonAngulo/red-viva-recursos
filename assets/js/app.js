/* =============================================================================
 * Central de Recursos Digitales — Colombia
 * Lógica de la interfaz: renderizado, filtros, búsqueda, tema y estado en URL.
 * Sin dependencias. Los datos viven en data/resources.js (window.CRC_DATA).
 * ========================================================================== */
(function () {
  "use strict";

  var DATA = window.CRC_DATA;
  if (!DATA) { console.error("No se cargó data/resources.js"); return; }

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
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
  var reDiacritics = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
  var norm = function (s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(reDiacritics, "");
  };

  /* ---------- Estado ------------------------------------------------------- */
  var state = { mode: "todos", intent: "", type: "", coverage: "", verification: "", q: "" };

  /* ---------- Tema --------------------------------------------------------- */
  var root = document.documentElement;
  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("crc-theme", t); } catch (e) {}
    var btn = $("#themeToggle");
    if (btn) btn.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
  (function initTheme() {
    var saved;
    try { saved = localStorage.getItem("crc-theme"); } catch (e) {}
    if (saved) root.setAttribute("data-theme", saved);
  })();

  /* ---------- Estado en URL (compartible) ---------------------------------- */
  function readURL() {
    var p = new URLSearchParams(location.hash.replace(/^#/, ""));
    state.mode = p.get("modo") || "todos";
    state.intent = p.get("necesidad") || "";
    state.type = p.get("tipo") || "";
    state.coverage = p.get("cobertura") || "";
    state.verification = p.get("verificacion") || "";
    state.q = p.get("q") || "";
  }
  function writeURL() {
    var p = new URLSearchParams();
    if (state.mode !== "todos") p.set("modo", state.mode);
    if (state.intent) p.set("necesidad", state.intent);
    if (state.type) p.set("tipo", state.type);
    if (state.coverage) p.set("cobertura", state.coverage);
    if (state.verification) p.set("verificacion", state.verification);
    if (state.q) p.set("q", state.q);
    var h = p.toString();
    history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
  }

  /* ---------- Filtrado ----------------------------------------------------- */
  function intentsForMode(mode) {
    return DATA.intents.filter(function (it) {
      return mode === "todos" || it.mode === mode || it.mode === "ambos";
    });
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
      if (q) {
        var hay = norm([r.name, r.org, r.description, r.action, r.coverage].join(" "));
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ---------- Render: chips de intención ----------------------------------- */
  function renderIntents() {
    var box = $("#intents");
    box.innerHTML = "";
    var list = intentsForMode(state.mode);
    // Chip "Todas"
    box.appendChild(makeIntentChip({ id: "", icon: "✦", label: "Todas las necesidades" }, state.intent === ""));
    list.forEach(function (it) {
      box.appendChild(makeIntentChip(it, state.intent === it.id));
    });
  }
  function makeIntentChip(it, pressed) {
    var b = el("button", { "class": "intent", type: "button", "aria-pressed": pressed ? "true" : "false" });
    b.innerHTML = '<span class="emoji" aria-hidden="true">' + esc(it.icon) + "</span>" + esc(it.label);
    if (it.hint) b.title = it.hint;
    b.addEventListener("click", function () {
      state.intent = (state.intent === it.id) ? "" : it.id;
      apply();
    });
    return b;
  }

  /* ---------- Render: selects de filtro ------------------------------------ */
  function fillSelect(sel, options, current, allLabel) {
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "" }, allLabel));
    options.forEach(function (o) {
      var opt = el("option", { value: o.value }, esc(o.label));
      if (o.value === current) opt.selected = true;
      sel.appendChild(opt);
    });
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
    var s = $("#search"); if (s.value !== state.q) s.value = state.q;
  }

  /* ---------- Render: tarjetas --------------------------------------------- */
  function badge(cls, tone, dot, text, title) {
    return '<span class="badge ' + cls + (tone ? " tone-" + tone : "") + '"' + (title ? ' title="' + esc(title) + '"' : "") +
      '>' + (dot ? '<span class="tdot" aria-hidden="true"></span>' : "") + esc(text) + "</span>";
  }
  function card(r) {
    var t = DATA.types[r.type] || { label: r.type };
    var st = DATA.statuses[r.status] || { label: r.status, tone: "muted" };
    var vf = DATA.verifications[r.verification] || { label: r.verification, tone: "muted" };

    var badges = '<div class="badges">' +
      badge("type", "", false, t.label, t.help) +
      badge("verif", vf.tone, true, vf.label, vf.help) +
      badge("status", st.tone, true, st.label, st.help) +
      "</div>";

    var meta = '<dl class="meta">' +
      metaRow("Cobertura", r.coverage) +
      metaRow("Responsable", r.org) +
      metaRow("Actualización", r.declaredUpdate) +
      metaRow("Última revisión", r.lastReview) +
      "</dl>";

    var alerts = "";
    if (r.warn) alerts += '<p class="alert warn"><span class="ai" aria-hidden="true">⚠️</span><span>' + esc(r.warn) + "</span></p>";
    if (r.sensitive) alerts += '<p class="alert sensitive"><span class="ai" aria-hidden="true">🔒</span><span>' +
      esc(r.note || "Maneja datos personales: se enlaza al portal original; aquí no se replican.") + "</span></p>";
    else if (r.note) alerts += '<p class="alert sensitive"><span class="ai" aria-hidden="true">ℹ️</span><span>' + esc(r.note) + "</span></p>";

    var isTel = /^tel:/.test(r.url);
    var openLabel = isTel ? "Llamar ahora" : "Abrir recurso";
    var open = '<a class="open" href="' + esc(r.url) + '"' + (isTel ? "" : ' target="_blank" rel="noopener noreferrer"') + '>' +
      esc(openLabel) + ' <span aria-hidden="true">' + (isTel ? "☎" : "↗") + "</span></a>";

    var reportBody = [
      "Recurso: " + r.name,
      "Enlace: " + r.url,
      "",
      "Describe el problema (enlace caído, información desactualizada, dato sensible, etc.):",
      "",
    ].join(NL);
    var mailto = "mailto:" + encodeURIComponent(DATA.meta.contactEmail) +
      "?subject=" + encodeURIComponent("Reporte sobre recurso: " + r.name) +
      "&body=" + encodeURIComponent(reportBody);
    var report = '<a class="report" href="' + mailto + '" title="Reportar un problema con este recurso">Reportar</a>';

    var c = el("article", { "class": "card" });
    c.innerHTML = badges +
      "<h3>" + esc(r.name) + "</h3>" +
      '<p class="action">' + esc(r.action) + "</p>" +
      '<p class="desc">' + esc(r.description) + "</p>" +
      meta + alerts +
      '<div class="card-actions">' + open + report + "</div>";
    return c;
  }
  function metaRow(label, value) {
    if (!value) return "";
    return "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  /* ---------- Render principal --------------------------------------------- */
  function apply() {
    renderIntents();
    renderFilters();

    var list = filtered();
    var grid = $("#grid");
    grid.innerHTML = "";

    if (!list.length) {
      grid.appendChild(makeEmpty());
    } else {
      var frag = document.createDocumentFragment();
      list.forEach(function (r) { frag.appendChild(card(r)); });
      grid.appendChild(frag);
    }

    var count = $("#count");
    count.innerHTML = "<b>" + list.length + "</b> recurso" + (list.length === 1 ? "" : "s") +
      (state.mode === "ayuda" ? " para quien necesita ayuda" : state.mode === "aportar" ? " para quien quiere ayudar" : "");

    // Estado de botones de modo
    Array.prototype.forEach.call(document.querySelectorAll(".mode-switch button"), function (b) {
      b.setAttribute("aria-pressed", b.dataset.mode === state.mode ? "true" : "false");
    });

    writeURL();
  }
  function makeEmpty() {
    var d = el("div", { "class": "empty" });
    d.innerHTML = "<h3>Sin resultados</h3><p>No hay recursos que coincidan con estos filtros. Prueba ampliar la búsqueda.</p>";
    var b = el("button", { type: "button" }, "Limpiar filtros");
    b.addEventListener("click", resetAll);
    d.appendChild(b);
    return d;
  }
  function resetAll() {
    state = { mode: "todos", intent: "", type: "", coverage: "", verification: "", q: "" };
    apply();
  }

  /* ---------- Eventos ------------------------------------------------------ */
  function bind() {
    Array.prototype.forEach.call(document.querySelectorAll(".mode-switch button"), function (b) {
      b.addEventListener("click", function () {
        state.mode = b.dataset.mode;
        state.intent = ""; // reinicia la necesidad al cambiar de modo
        apply();
        var c = document.getElementById("controls");
        if (c) c.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    $("#fType").addEventListener("change", function (e) { state.type = e.target.value; apply(); });
    $("#fCoverage").addEventListener("change", function (e) { state.coverage = e.target.value; apply(); });
    $("#fVerif").addEventListener("change", function (e) { state.verification = e.target.value; apply(); });

    var timer;
    $("#search").addEventListener("input", function (e) {
      clearTimeout(timer);
      var v = e.target.value;
      timer = setTimeout(function () { state.q = v; apply(); }, 160);
    });

    $("#resetFilters").addEventListener("click", resetAll);

    $("#themeToggle").addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    window.addEventListener("hashchange", function () { readURL(); apply(); });
  }

  /* ---------- Rellenos de contenido estático ------------------------------- */
  function fillStatic() {
    var eq = DATA.meta.earthquake;
    var s = $("#reviewDate"); if (s) s.textContent = DATA.meta.lastReview;
    var e = $("#eqInfo");
    if (e) e.textContent = "Sismo " + eq.magnitude + " · " + eq.date + " · epicentro " + eq.epicenter;

    // Enlaces de líneas de emergencia en el aviso
    var le = $("#emergencyLines");
    if (le) le.textContent = DATA.emergencyLines.map(function (l) { return l.number + " " + l.label; }).join(" · ");

    // CTA proponer recurso
    var cta = $("#proposeCta");
    if (cta) {
      var proposeBody = [
        "Nombre del recurso:",
        "Enlace (URL):",
        "Organización responsable:",
        "¿Qué resuelve?:",
        "Cobertura territorial:",
        "¿Maneja datos personales?:",
        "",
      ].join(NL);
      cta.href = "mailto:" + encodeURIComponent(DATA.meta.contactEmail) +
        "?subject=" + encodeURIComponent("Propuesta de recurso para el directorio") +
        "&body=" + encodeURIComponent(proposeBody);
    }
    var mail = $("#contactMail");
    if (mail) { mail.textContent = DATA.meta.contactEmail; mail.href = "mailto:" + DATA.meta.contactEmail; }
  }

  /* ---------- Datos en vivo desde Supabase --------------------------------- */
  // Convierte una fila de la tabla digital_resources al formato que usa la UI.
  function mapRow(r) {
    return {
      id: r.id,
      name: r.name,
      org: r.org,
      action: r.action,
      description: r.description,
      intents: Array.isArray(r.intents) ? r.intents : [],
      type: r.type,
      coverage: r.coverage,
      url: r.url,
      status: r.status,
      verification: r.verification,
      declaredUpdate: r.declared_update,
      lastReview: r.last_review ? String(r.last_review).slice(0, 10) : "",
      sensitive: !!r.sensitive,
      warn: r.warn || undefined,
      note: r.note || undefined,
    };
  }

  function loadLiveResources() {
    var sb = DATA.meta && DATA.meta.supabase;
    if (!sb || !sb.url || !sb.anonKey) return; // sin config -> se queda con datos locales
    var baseUrl = sb.url.charAt(sb.url.length - 1) === "/" ? sb.url.slice(0, -1) : sb.url;
    var endpoint = baseUrl +
      "/rest/v1/digital_resources?select=*&is_published=eq.true&order=sort_order.asc,name.asc";
    fetch(endpoint, { headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey } })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) {
          DATA.resources = rows.map(mapRow);
          apply();
          markLive(true);
        }
      })
      .catch(function (err) {
        console.warn("Recursos en vivo no disponibles; usando copia local.", err);
        markLive(false);
      });
  }

  function markLive(ok) {
    var badge = $("#liveState");
    if (!badge) return;
    badge.textContent = ok ? "Datos en vivo" : "Copia local";
    badge.className = "live-state " + (ok ? "on" : "off");
    badge.hidden = false;
  }

  /* ---------- Panel de situación ------------------------------------------- */
  function renderSituation(list) {
    var box = $("#situationList");
    if (!box) return;
    if (!list || !list.length) { box.innerHTML = ""; return; }
    box.innerHTML = list.map(function (s) {
      var sev = s.severity || "info";
      var asOf = s.as_of ? String(s.as_of).slice(0, 10) : "";
      var region = s.region ? '<span class="sit-region">' + esc(s.region) + "</span>" : "";
      var metric = s.metric ? '<div class="sit-metric">' + esc(s.metric) + "</div>" : "";
      var summary = s.summary ? '<p class="sit-summary">' + esc(s.summary) + "</p>" : "";
      var foot = '<div class="sit-foot"><span>' + esc(s.source_name || "") + "</span><span>" + esc(asOf) + "</span></div>";
      var href = s.url ? esc(s.url) : "#";
      var attrs = s.url ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a class="sit-card sev-' + esc(sev) + '" href="' + href + '"' + attrs + ">" +
        region + '<div class="sit-title">' + esc(s.title) + "</div>" + metric + summary + foot + "</a>";
    }).join("");
  }

  function loadSituation() {
    renderSituation(DATA.situation || []); // fallback inmediato
    var sb = DATA.meta && DATA.meta.supabase;
    if (!sb || !sb.url || !sb.anonKey) return;
    var base = sb.url.charAt(sb.url.length - 1) === "/" ? sb.url.slice(0, -1) : sb.url;
    fetch(base + "/rest/v1/situation_updates?select=*&is_published=eq.true&order=sort_order.asc", {
      headers: { apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey },
    })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) { DATA.situation = rows; renderSituation(rows); markSituationLive(true); }
      })
      .catch(function (err) { console.warn("Situación en vivo no disponible; usando copia local.", err); markSituationLive(false); });
  }

  function markSituationLive(ok) {
    var badge = $("#situationLive");
    if (!badge) return;
    badge.textContent = ok ? "En vivo" : "Local";
    badge.className = "live-state " + (ok ? "on" : "off");
    badge.hidden = false;
  }

  /* ---------- Init --------------------------------------------------------- */
  readURL();
  fillStatic();
  bind();
  apply();             // render inmediato con la copia local (resiliencia)
  loadSituation();     // panel de situación (fallback + en vivo)
  loadLiveResources(); // recursos: refresca desde Supabase si hay conexión
})();
