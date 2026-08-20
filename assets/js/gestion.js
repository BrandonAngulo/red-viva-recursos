/* Panel de gestión — Central de Recursos Digitales (Colombia).
   Auth (email+contraseña) con Supabase + editor genérico para todas las tablas.
   Solo los correos de la tabla `admins` pueden escribir (RLS). */
(function () {
  "use strict";

  var SUPA = {
    url: "https://afnwhdoqdwopvcsdgswi.supabase.co",
    key: "sb_publishable_1EcdaBYdh9GVIVTdqtWZoQ_anWOqq8a",
  };
  // ¿Llegamos desde un enlace de Supabase (confirmación / recuperación / error)?
  var _authStr = (location.hash || "") + "&" + (location.search || "");
  var arrivedFromAuth = /access_token=|type=signup|type=recovery|[?&]code=/.test(_authStr);
  var authType = (/[#&?]type=([a-z_]+)/.exec(_authStr) || [])[1] || "";
  var authError = (function () {
    var m = /error_description=([^&]+)/.exec(_authStr);
    if (m) return decodeURIComponent(m[1].replace(/\+/g, " "));
    if (/[#&?]error=/.test(_authStr)) return "El enlace no es válido o ya expiró.";
    return "";
  })();
  var sb = window.supabase.createClient(SUPA.url, SUPA.key);

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var app = $("#app");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- Configuración de entidades ---------- */
  var TYPE_RES = ["oficial", "institucional", "ciudadano"];
  var STATUS_RES = ["activo", "desactualizado", "caido", "cerrado"];
  var VERIF_RES = ["verificado", "en-revision", "por-verificar"];
  var SEV = ["info", "warning", "critical"];
  var MAPT = ["epicentro", "ciudad", "incendio"];
  var CONTRIB_STATUS = ["pendiente", "en_revision", "publicado", "fusionado", "descartado"];
  // Vocabularios controlados (evitan errores de digitación que rompen el enlace).
  var INTENTS_OPTS = [
    { v: "emergencia", l: "Emergencia inmediata" },
    { v: "buscar-persona", l: "Buscar o reportar una persona" },
    { v: "buscar-mascota", l: "Buscar o reportar una mascota" },
    { v: "ayuda-oficial", l: "Solicitar ayuda oficial" },
    { v: "reportar-danos", l: "Reportar daños en una vivienda" },
    { v: "albergue-salud", l: "Albergue, salud o conectividad" },
    { v: "cifras", l: "Cifras, réplicas y reportes" },
    { v: "donar", l: "Donar dinero o suministros" },
    { v: "acopios", l: "Encontrar centros de acopio" },
    { v: "voluntariado", l: "Participar como voluntario" },
  ];
  var GUIA_CATS = ["Actuar según tu situación", "Ayudar / Donar", "Prepararse", "Veeduría y seguimiento", "General"];

  var ENTITIES = [
    { key: "contributions", label: "Propuestas", icon: "📥", table: "contributions", order: "created_at.desc", listCols: ["territory", "organization", "status"], titleField: "territory", special: "contrib",
      fields: [
        { n: "territory", l: "Territorio", t: "text" }, { n: "organization", l: "Organización", t: "text" },
        { n: "description", l: "Descripción", t: "textarea" }, { n: "source_url", l: "Enlace", t: "text" },
        { n: "contact_email", l: "Correo de contacto", t: "text" },
        { n: "status", l: "Estado", t: "select", o: CONTRIB_STATUS }, { n: "review_notes", l: "Notas de revisión", t: "textarea" },
      ] },
    { key: "reports", label: "Reportes", icon: "⚠️", table: "resource_reports", order: "created_at.desc", listCols: ["resource_id", "kind"], titleField: "resource_id", readonly: true,
      fields: [{ n: "resource_id", l: "Recurso", t: "text" }, { n: "kind", l: "Tipo", t: "text" }, { n: "message", l: "Mensaje", t: "textarea" }] },
    { key: "resources", label: "Recursos", icon: "🔗", table: "digital_resources", order: "sort_order.asc", listCols: ["name", "type", "verification"], titleField: "name",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "name", l: "Nombre", t: "text" }, { n: "org", l: "Organización", t: "text" },
        { n: "action", l: "Acción principal", t: "text" }, { n: "description", l: "Descripción", t: "textarea" },
        { n: "intents", l: "Necesidades que resuelve (marca las que apliquen)", t: "multiselect", o: INTENTS_OPTS }, { n: "type", l: "Tipo", t: "select", o: TYPE_RES },
        { n: "coverage", l: "Cobertura", t: "text" }, { n: "url", l: "URL", t: "text" },
        { n: "status", l: "Estado", t: "select", o: STATUS_RES }, { n: "verification", l: "Verificación", t: "select", o: VERIF_RES },
        { n: "declared_update", l: "Actualización declarada", t: "text" }, { n: "last_review", l: "Última revisión", t: "date" },
        { n: "sensitive", l: "Datos sensibles", t: "bool" }, { n: "warn", l: "Advertencia", t: "textarea" }, { n: "note", l: "Nota", t: "textarea" },
        { n: "featured", l: "Destacado (misma familia)", t: "bool" },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "situation", label: "Situación", icon: "📊", table: "situation_updates", order: "sort_order.asc", listCols: ["title", "region", "severity"], titleField: "title",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "title", l: "Título", t: "text" }, { n: "metric", l: "Cifra destacada", t: "text" },
        { n: "summary", l: "Resumen", t: "textarea" }, { n: "region", l: "Región", t: "text" },
        { n: "severity", l: "Severidad", t: "select", o: SEV }, { n: "source_name", l: "Fuente", t: "text" }, { n: "url", l: "URL", t: "text" },
        { n: "as_of", l: "Fecha del dato", t: "date" }, { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "timeline", label: "Cronología", icon: "🗓️", table: "timeline", order: "sort_order.asc", listCols: ["dia", "titulo"], titleField: "titulo",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "dia", l: "Día (etiqueta)", t: "text" }, { n: "fecha", l: "Fecha (etiqueta)", t: "text" },
        { n: "titulo", l: "Título", t: "text" }, { n: "items", l: "Puntos (uno por línea)", t: "lines" }, { n: "detalle", l: "Detalle (Leer más)", t: "textarea" },
        { n: "fuentes", l: "Fuentes (etiqueta | url, una por línea)", t: "kv", keys: ["label", "url"] },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "municipalities", label: "Municipios", icon: "📍", table: "municipalities", order: "sort_order.asc", listCols: ["name", "department", "priority"], titleField: "name",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "name", l: "Nombre", t: "text" }, { n: "department", l: "Departamento", t: "text" },
        { n: "priority", l: "Prioridad", t: "text" }, { n: "note", l: "Nota", t: "textarea" }, { n: "url", l: "URL fuente", t: "text" },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "map_points", label: "Puntos del mapa", icon: "🗺️", table: "map_points", order: "sort_order.asc", listCols: ["name", "type", "department"], titleField: "name",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "type", l: "Tipo", t: "select", o: MAPT }, { n: "name", l: "Nombre", t: "text" },
        { n: "department", l: "Departamento", t: "text" }, { n: "lat", l: "Latitud", t: "float" }, { n: "lng", l: "Longitud", t: "float" },
        { n: "note", l: "Nota", t: "textarea" }, { n: "source_name", l: "Fuente", t: "text" }, { n: "url", l: "URL", t: "text" },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "orientaciones", label: "Orientaciones", icon: "🧭", table: "orientaciones", order: "sort_order.asc", listCols: ["title"], titleField: "title",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "icon", l: "Ícono (emoji)", t: "text" }, { n: "title", l: "Título", t: "text" },
        { n: "que_pasa", l: "Qué pasa", t: "textarea" }, { n: "pasos", l: "Pasos (uno por línea)", t: "lines" },
        { n: "acudir", l: "A quién acudir (quién | canal)", t: "kv", keys: ["who", "channel"] },
        { n: "estafa", l: "Advertencia anti-estafa", t: "textarea" }, { n: "linea", l: "Línea de apoyo", t: "text" },
        { n: "diferencial_rural", l: "Nota: rural / sin señal", t: "textarea" }, { n: "diferencial_etnico", l: "Nota: comunidades étnicas", t: "textarea" },
        { n: "diferencial_mayores", l: "Nota: mayores / discapacidad", t: "textarea" },
        { n: "fuentes", l: "Fuentes (etiqueta | url)", t: "kv", keys: ["label", "url"] },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "explicaciones", label: "Explicaciones", icon: "💡", table: "explicaciones", order: "sort_order.asc", listCols: ["title"], titleField: "title",
      fields: [
        { n: "id", l: "ID (slug)", t: "text", pk: true }, { n: "icon", l: "Ícono (emoji)", t: "text" }, { n: "title", l: "Título", t: "text" },
        { n: "body", l: "Cuerpo", t: "textarea" }, { n: "mas", l: "Leer más (un párrafo por línea)", t: "lines" },
        { n: "link_label", l: "Enlace: texto", t: "text" }, { n: "link_url", l: "Enlace: url", t: "text" },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "guias", label: "Guías visuales", icon: "🖼️", table: "guias", order: "sort_order.asc", listCols: ["title", "category"], titleField: "title", special: "guias",
      fields: [
        { n: "title", l: "Título de la guía", t: "text" },
        { n: "description", l: "Descripción (qué verá y descargará el usuario)", t: "textarea" },
        { n: "category", l: "Categoría", t: "select", o: GUIA_CATS },
        { n: "images", l: "Imágenes del paquete", t: "images" },
        { n: "zip_url", l: "ZIP pre-armado (opcional; si se deja vacío se genera solo al descargar)", t: "text" },
        { n: "cover_url", l: "Portada (opcional; por defecto usa la 1ª imagen)", t: "text" },
        { n: "is_published", l: "Publicado", t: "bool" }, { n: "sort_order", l: "Orden", t: "int" },
      ] },
    { key: "admins", label: "Administradores", icon: "👤", table: "admins", order: "created_at.asc", listCols: ["email"], titleField: "email",
      fields: [{ n: "email", l: "Correo del administrador", t: "text", pk: true }] },
  ];
  function entity(key) { for (var i = 0; i < ENTITIES.length; i++) if (ENTITIES[i].key === key) return ENTITIES[i]; return null; }

  /* ---------- Estado ---------- */
  var state = { user: null, isAdmin: false, current: "contributions", editing: null };
  var guiaImagesState = []; // piezas del paquete que se está editando (guías visuales)

  var reDiaG = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
  function slugG(s) { return String(s || "").toLowerCase().normalize("NFD").replace(reDiaG, "").replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, ""); }

  /* ---------- Conversión de valores ---------- */
  function toForm(field, value) {
    if (field.t === "lines") return (value || []).join("\n");
    if (field.t === "kv") return (value || []).map(function (o) { return (o[field.keys[0]] || "") + " | " + (o[field.keys[1]] || ""); }).join("\n");
    if (field.t === "bool") return !!value;
    return value == null ? "" : value;
  }
  function fromForm(field, raw) {
    if (field.t === "lines") return String(raw || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    if (field.t === "kv") return String(raw || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean).map(function (line) {
      var parts = line.split("|"); var o = {}; o[field.keys[0]] = (parts[0] || "").trim(); o[field.keys[1]] = (parts[1] || "").trim(); return o;
    });
    if (field.t === "bool") return !!raw;
    if (field.t === "int") return raw === "" || raw == null ? null : parseInt(raw, 10);
    if (field.t === "float") return raw === "" || raw == null ? null : parseFloat(raw);
    if (raw === "") return null;
    return raw;
  }

  /* ---------- Auth ---------- */
  function pwField(id, label, ac) {
    return "<label>" + label + '<div class="pw-wrap"><input id="' + id + '" type="password"' + (ac ? ' autocomplete="' + ac + '"' : "") + ' minlength="8" required><button type="button" class="pw-toggle" data-for="' + id + '">Mostrar</button></div></label>';
  }
  function bindPwToggles() {
    Array.prototype.forEach.call(document.querySelectorAll(".pw-toggle"), function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById(b.dataset.for); if (!inp) return;
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.textContent = show ? "Ocultar" : "Mostrar";
      });
    });
  }
  function renderLogin(msg, isError) {
    app.innerHTML =
      '<div class="admin-login"><div class="al-card">' +
      '<h1>Panel de gestión</h1><p class="al-sub">Central de Recursos Digitales — Colombia</p>' +
      (msg ? '<p class="al-msg ' + (isError ? "err" : "ok") + '">' + esc(msg) + "</p>" : "") +
      '<form id="loginForm"><label>Correo<input id="email" type="email" required autocomplete="email"></label>' +
      pwField("password", "Contraseña", "current-password") +
      '<button class="btn-primary" type="submit" id="loginBtn">Entrar</button></form>' +
      '<button class="al-link" id="toSignup" type="button">Primera vez: crear mi acceso</button>' +
      "</div></div>";
    bindPwToggles();
    $("#loginForm").addEventListener("submit", doLogin);
    $("#toSignup").addEventListener("click", renderSignup);
  }
  function renderSignup() {
    app.innerHTML =
      '<div class="admin-login"><div class="al-card">' +
      "<h1>Crear acceso</h1><p class=\"al-sub\">Usa el correo que fue habilitado como administrador. Recibirás un correo para confirmar la cuenta.</p>" +
      '<form id="signupForm"><label>Correo<input id="email" type="email" required autocomplete="email"></label>' +
      pwField("password", "Contraseña (mínimo 8 caracteres)", "new-password") +
      pwField("password2", "Confirmar contraseña", "new-password") +
      '<div id="suMsg" class="al-msg" hidden></div>' +
      '<button class="btn-primary" type="submit">Crear acceso</button></form>' +
      '<button class="al-link" id="toLogin" type="button">Ya tengo acceso: iniciar sesión</button>' +
      "</div></div>";
    bindPwToggles();
    $("#signupForm").addEventListener("submit", doSignup);
    $("#toLogin").addEventListener("click", function () { renderLogin(); });
  }
  function doLogin(e) {
    e.preventDefault();
    var btn = $("#loginBtn"); if (btn) btn.disabled = true;
    sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value }).then(function (r) {
      if (r.error) { renderLogin(r.error.message, true); return; }
      boot();
    });
  }
  function doSignup(e) {
    e.preventDefault();
    var msg = $("#suMsg");
    var p = $("#password").value, p2 = $("#password2").value;
    var showMsg = function (t) { if (msg) { msg.hidden = false; msg.className = "al-msg err"; msg.textContent = t; } };
    if (p.length < 8) { showMsg("La contraseña debe tener al menos 8 caracteres."); return; }
    if (p !== p2) { showMsg("Las contraseñas no coinciden."); return; }
    var redirectTo = location.origin + location.pathname; // vuelve a esta misma página (gestion.html)
    sb.auth.signUp({ email: $("#email").value.trim(), password: p, options: { emailRedirectTo: redirectTo } }).then(function (r) {
      if (r.error) { showMsg(r.error.message); return; }
      if (r.data && r.data.session) { boot(); }
      else { renderLogin("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.", false); }
    });
  }
  function signOut() { sb.auth.signOut().then(function () { state.user = null; state.isAdmin = false; renderLogin("Sesión cerrada.", false); }); }

  /* ---------- Shell ---------- */
  function renderShell() {
    var nav = ENTITIES.map(function (en) {
      return '<button class="ge-nav' + (en.key === state.current ? " active" : "") + '" data-key="' + en.key + '"><span>' + en.icon + "</span> " + esc(en.label) + "</button>";
    }).join("");
    var bannerMsg = authType === "recovery"
      ? "✅ Enlace válido. Tu sesión está iniciada — ya puedes gestionar la herramienta."
      : "✅ Tu correo quedó confirmado y tu sesión está iniciada. ¡Bienvenido/a al panel!";
    var banner = arrivedFromAuth ? '<div class="ge-banner" id="geBanner">' + bannerMsg + "</div>" : "";
    app.innerHTML =
      '<header class="ge-top"><b>Gestión · Central de Recursos</b>' +
      '<span class="ge-user">' + esc(state.user.email) + ' <button id="signOut" class="al-link">Salir</button></span></header>' +
      banner +
      '<div class="ge-body"><nav class="ge-side">' + nav + "</nav>" +
      '<main class="ge-main" id="geMain"></main></div>';
    if (arrivedFromAuth) { arrivedFromAuth = false; setTimeout(function () { var b = $("#geBanner"); if (b) b.style.display = "none"; }, 6000); }
    Array.prototype.forEach.call(document.querySelectorAll(".ge-nav"), function (b) {
      b.addEventListener("click", function () { state.current = b.dataset.key; state.editing = null; renderShell(); loadList(); });
    });
    $("#signOut").addEventListener("click", signOut);
    loadList();
  }

  function loadList() {
    var en = entity(state.current), main = $("#geMain");
    main.innerHTML = '<p class="ge-loading">Cargando…</p>';
    var parts = en.order.split("."), col = parts[0], asc = parts[1] !== "desc";
    sb.from(en.table).select("*").order(col, { ascending: asc }).then(function (r) {
      if (r.error) { main.innerHTML = '<p class="al-msg err">' + esc(r.error.message) + "</p>"; return; }
      renderList(en, r.data || []);
    });
  }

  function rowHaystack(row) {
    var parts = [];
    for (var k in row) { var v = row[k]; if (v == null) continue; parts.push(typeof v === "object" ? JSON.stringify(v) : String(v)); }
    return parts.join(" ").toLowerCase();
  }
  function renderList(en, rows) {
    var main = $("#geMain");
    var hasPub = rows.length && ("is_published" in rows[0]);
    var controls =
      '<input id="listSearch" class="ge-search" type="search" placeholder="Buscar…" autocomplete="off">' +
      (hasPub ? '<select id="pubFilter" class="ge-filter"><option value="">Todos</option><option value="pub">Publicados</option><option value="hidden">Ocultos</option></select>' : "") +
      (en.special === "contrib" ? '<select id="contribFilter" class="ge-filter"><option value="">Todos los estados</option>' + CONTRIB_STATUS.map(function (s) { return '<option value="' + s + '">' + s + "</option>"; }).join("") + "</select>" : "");
    main.innerHTML =
      '<div class="ge-head"><h2>' + en.icon + " " + esc(en.label) + ' <span class="ge-count" id="listCount">' + rows.length + "</span></h2>" +
      (en.readonly ? "" : '<button class="btn-primary" id="newRow">+ Nuevo</button>') + "</div>" +
      (rows.length ? '<div class="ge-list-controls">' + controls + "</div>" : "") +
      '<div id="tableHost">' + (rows.length ? "" : '<p class="ge-empty">Sin registros.</p>') + "</div>";
    if ($("#newRow")) $("#newRow").addEventListener("click", function () { openEditor(en, null); });
    if (!rows.length) return;

    var q = "", statusF = "", contribF = "", timer;
    function apply() {
      var qn = q.trim().toLowerCase();
      var f = rows.filter(function (row) {
        if (qn && rowHaystack(row).indexOf(qn) === -1) return false;
        if (statusF === "pub" && !row.is_published) return false;
        if (statusF === "hidden" && row.is_published) return false;
        if (contribF && row.status !== contribF) return false;
        return true;
      });
      paintRows(en, f, rows.length);
    }
    var s = $("#listSearch"); if (s) s.addEventListener("input", function (e) { q = e.target.value; clearTimeout(timer); timer = setTimeout(apply, 120); });
    var pf = $("#pubFilter"); if (pf) pf.addEventListener("change", function (e) { statusF = e.target.value; apply(); });
    var cf = $("#contribFilter"); if (cf) cf.addEventListener("change", function (e) { contribF = e.target.value; apply(); });
    apply();
  }
  function paintRows(en, rows, total) {
    var host = $("#tableHost");
    var cnt = $("#listCount"); if (cnt) cnt.textContent = rows.length + (rows.length !== total ? " / " + total : "");
    if (!rows.length) { host.innerHTML = '<p class="ge-empty">Sin resultados para esta búsqueda.</p>'; return; }
    var rowsHtml = rows.map(function (row, i) {
      var cells = en.listCols.map(function (c) { return "<td>" + esc(cell(row[c])) + "</td>"; }).join("");
      var pub = ("is_published" in row) ? "<td>" + (row.is_published ? '<span class="pill ok">Publicado</span>' : '<span class="pill off">Oculto</span>') + "</td>" : "<td></td>";
      var acts = '<td class="ge-acts">' + (en.readonly ? '<button class="mini" data-act="view" data-i="' + i + '">Ver</button>' : '<button class="mini" data-act="edit" data-i="' + i + '">Editar</button><button class="mini danger" data-act="del" data-i="' + i + '">Eliminar</button>') + "</td>";
      return "<tr>" + cells + pub + acts + "</tr>";
    }).join("");
    var thead = en.listCols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "<th>Estado</th><th></th>";
    host.innerHTML = '<div class="ge-tablewrap"><table class="ge-table"><thead><tr>' + thead + "</tr></thead><tbody>" + rowsHtml + "</tbody></table></div>";
    Array.prototype.forEach.call(host.querySelectorAll("[data-act]"), function (b) {
      b.addEventListener("click", function () {
        var row = rows[parseInt(b.dataset.i, 10)], act = b.dataset.act;
        if (act === "del") return delRow(en, row);
        openEditor(en, row);
      });
    });
  }
  function cell(v) { if (Array.isArray(v)) return v.length + " ítem(s)"; if (v && typeof v === "object") return JSON.stringify(v).slice(0, 40); return v == null ? "" : String(v).slice(0, 60); }

  /* ---------- Widget de imágenes (guías visuales) ---------- */
  function imagesWidgetHtml() {
    return '<div class="gi-widget">' +
      '<div class="gi-list" id="giList"></div>' +
      '<div class="gi-add">' +
        '<label class="btn-ghost gi-addbtn">+ Agregar imágenes<input type="file" id="giFile" accept="image/*" multiple hidden></label>' +
        '<button type="button" class="btn-ghost" id="giPreview">👁 Previsualizar paquete</button>' +
        '<span id="giStatus" class="gi-status"></span>' +
      '</div>' +
      '<p class="gi-hint">Sube las piezas en orden. Puedes reordenarlas, editar la descripción de cada una y previsualizar cómo se verá el paquete antes de guardar.</p>' +
    '</div>';
  }
  function renderGiList() {
    var host = $("#giList"); if (!host) return;
    if (!guiaImagesState.length) { host.innerHTML = '<p class="gi-empty">Aún no hay imágenes. Usa “Agregar imágenes”.</p>'; return; }
    host.innerHTML = guiaImagesState.map(function (im, i) {
      return '<div class="gi-row" data-i="' + i + '">' +
        '<img src="' + esc(im.url) + '" alt="">' +
        '<input type="text" class="gi-cap" data-i="' + i + '" value="' + esc(im.caption || "") + '" placeholder="Descripción de la pieza">' +
        '<div class="gi-row-acts">' +
          '<button type="button" class="mini" data-giact="up" data-i="' + i + '"' + (i === 0 ? " disabled" : "") + '>↑</button>' +
          '<button type="button" class="mini" data-giact="down" data-i="' + i + '"' + (i === guiaImagesState.length - 1 ? " disabled" : "") + '>↓</button>' +
          '<button type="button" class="mini danger" data-giact="del" data-i="' + i + '">✕</button>' +
        '</div>' +
      '</div>';
    }).join("");
    Array.prototype.forEach.call(host.querySelectorAll(".gi-cap"), function (inp) {
      inp.addEventListener("input", function () { var it = guiaImagesState[+inp.dataset.i]; if (it) it.caption = inp.value; });
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-giact]"), function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.i, act = b.dataset.giact, t;
        if (act === "del") guiaImagesState.splice(i, 1);
        else if (act === "up" && i > 0) { t = guiaImagesState[i - 1]; guiaImagesState[i - 1] = guiaImagesState[i]; guiaImagesState[i] = t; }
        else if (act === "down" && i < guiaImagesState.length - 1) { t = guiaImagesState[i + 1]; guiaImagesState[i + 1] = guiaImagesState[i]; guiaImagesState[i] = t; }
        renderGiList();
      });
    });
  }
  function uploadGiFiles(files) {
    if (!files || !files.length) return;
    var status = $("#giStatus"), arr = Array.prototype.slice.call(files), total = arr.length, done = 0;
    status.textContent = "Subiendo 0/" + total + "…";
    function next() {
      if (!arr.length) { status.textContent = "Listo · " + done + "/" + total + " subida(s)."; renderGiList(); return; }
      var f = arr.shift();
      var path = "paquetes/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "-" + (slugG(f.name) || "img");
      sb.storage.from("guias").upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type || "image/jpeg" }).then(function (res) {
        if (res.error) { status.textContent = "Error con " + f.name + ": " + res.error.message; return; }
        var url = sb.storage.from("guias").getPublicUrl(path).data.publicUrl;
        var cap = f.name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
        guiaImagesState.push({ url: url, caption: cap });
        done++; status.textContent = "Subiendo " + done + "/" + total + "…";
        renderGiList(); next();
      });
    }
    next();
  }
  function openGiPreview() {
    if (!guiaImagesState.length) { window.alert("Agrega imágenes primero para previsualizar."); return; }
    var title = ($("#f_title") && $("#f_title").value) || "Vista previa";
    var desc = ($("#f_description") && $("#f_description").value) || "";
    var ov = document.createElement("div");
    ov.className = "gi-preview-modal";
    ov.innerHTML = '<div class="gi-preview-dialog"><header><div><h3>' + esc(title) + "</h3>" + (desc ? "<p>" + esc(desc) + "</p>" : "") +
      '</div><button type="button" class="preview-close" id="giPvClose" aria-label="Cerrar">✕</button></header>' +
      '<div class="gi-preview-scroll">' + guiaImagesState.map(function (im, i) {
        return '<figure><img src="' + esc(im.url) + '" alt=""><figcaption>' + esc(im.caption || ("Pieza " + (i + 1))) + "</figcaption></figure>";
      }).join("") + "</div></div>";
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    function close() { ov.remove(); document.body.style.overflow = ""; }
    ov.addEventListener("click", function (e) { if (e.target === ov || e.target.id === "giPvClose") close(); });
    document.addEventListener("keydown", function esc2(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
  }
  function bindGiWidget() {
    renderGiList();
    var file = $("#giFile"); if (file) file.addEventListener("change", function () { uploadGiFiles(file.files); file.value = ""; });
    var pv = $("#giPreview"); if (pv) pv.addEventListener("click", openGiPreview);
  }

  /* ---------- Editor ---------- */
  function openEditor(en, row) {
    var isNew = !row;
    var main = $("#geMain");
    if (en.special === "guias") {
      guiaImagesState = (row && Array.isArray(row.images) ? row.images : []).map(function (im) { return { url: im.url, caption: im.caption || "" }; });
    }
    var fieldsHtml = en.fields.map(function (f) {
      var val = row ? toForm(f, row[f.n]) : toForm(f, f.t === "bool" ? (f.n === "is_published") : "");
      var id = "f_" + f.n;
      var input;
      if (f.t === "images") input = imagesWidgetHtml();
      else if (f.t === "multiselect") {
        var selArr = Array.isArray(val) ? val : [];
        input = '<div class="ge-multi" id="' + id + '">' + f.o.map(function (op) {
          var ov = typeof op === "object" ? op.v : op, ol = typeof op === "object" ? op.l : op;
          return '<label class="ge-check"><input type="checkbox" value="' + esc(ov) + '"' + (selArr.indexOf(ov) !== -1 ? " checked" : "") + "> " + esc(ol) + "</label>";
        }).join("") + "</div>";
      }
      else if (f.t === "textarea") input = '<textarea id="' + id + '" rows="3">' + esc(val) + "</textarea>";
      else if (f.t === "lines" || f.t === "kv") input = '<textarea id="' + id + '" rows="4">' + esc(val) + "</textarea>";
      else if (f.t === "bool") input = '<input type="checkbox" id="' + id + '"' + (val ? " checked" : "") + ">";
      else if (f.t === "select") input = '<select id="' + id + '">' + f.o.map(function (o) { return '<option' + (o === val ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>";
      else if (f.t === "int" || f.t === "float") input = '<input type="number" id="' + id + '" step="' + (f.t === "float" ? "any" : "1") + '" value="' + esc(val) + '">';
      else if (f.t === "date") input = '<input type="date" id="' + id + '" value="' + esc(val) + '">';
      else input = '<input type="text" id="' + id + '" value="' + esc(val) + '"' + (f.pk && !isNew ? " readonly" : "") + ">";
      return '<div class="ge-field ' + (f.t === "bool" ? "inline" : "") + '"><label for="' + id + '">' + esc(f.l) + (f.pk ? " *" : "") + "</label>" + input + "</div>";
    }).join("");
    var contribExtra = "";
    if (en.special === "contrib" && row) {
      contribExtra = '<div class="ge-contrib-actions"><button class="btn-ghost" id="toResource" type="button">→ Crear recurso desde esta propuesta</button></div>';
    }
    main.innerHTML =
      '<div class="ge-head"><h2>' + (isNew ? "Nuevo" : "Editar") + " · " + esc(en.label) + '</h2><button class="al-link" id="backList">← Volver</button></div>' +
      '<form id="editForm" class="ge-form">' + fieldsHtml + contribExtra +
      '<div id="editMsg" class="al-msg" hidden></div>' +
      '<div class="ge-form-actions">' + (en.readonly ? "" : '<button class="btn-primary" type="submit">Guardar</button>') + '<button class="btn-ghost" type="button" id="cancelEdit">Cancelar</button></div>' +
      "</form>";
    $("#backList").addEventListener("click", loadList);
    $("#cancelEdit").addEventListener("click", loadList);
    if (en.special === "guias") bindGiWidget();
    if ($("#toResource")) $("#toResource").addEventListener("click", function () { contribToResource(row); });
    if (!en.readonly) $("#editForm").addEventListener("submit", function (e) { e.preventDefault(); saveRow(en, row, isNew); });
  }

  function collect(en) {
    var obj = {};
    en.fields.forEach(function (f) {
      if (f.t === "images") { obj[f.n] = guiaImagesState.map(function (im) { return { url: im.url, caption: im.caption || "" }; }); return; }
      if (f.t === "multiselect") {
        var box = $("#f_" + f.n), vals = [];
        if (box) Array.prototype.forEach.call(box.querySelectorAll("input[type=checkbox]"), function (cb) { if (cb.checked) vals.push(cb.value); });
        obj[f.n] = vals; return;
      }
      var node = $("#f_" + f.n); if (!node) return;
      var raw = f.t === "bool" ? node.checked : node.value;
      obj[f.n] = fromForm(f, raw);
    });
    return obj;
  }
  function saveRow(en, row, isNew) {
    var msg = $("#editMsg"); msg.hidden = false; msg.className = "al-msg"; msg.textContent = "Guardando…";
    var obj = collect(en);
    var q;
    if (isNew) q = sb.from(en.table).insert(obj);
    else {
      var pk = pkField(en);
      q = sb.from(en.table).update(obj).eq(pk, row[pk]);
    }
    q.then(function (r) {
      if (r.error) { msg.className = "al-msg err"; msg.textContent = r.error.message; return; }
      loadList();
    });
  }
  function delRow(en, row) {
    if (!window.confirm("¿Eliminar este registro? No se puede deshacer.")) return;
    var pk = pkField(en);
    sb.from(en.table).delete().eq(pk, row[pk]).then(function (r) {
      if (r.error) { window.alert("Error: " + r.error.message); return; }
      loadList();
    });
  }
  function pkField(en) { for (var i = 0; i < en.fields.length; i++) if (en.fields[i].pk) return en.fields[i].n; return "id"; }

  // Crear un recurso a partir de una propuesta y marcarla publicada
  function contribToResource(c) {
    state.current = "resources"; renderShell();
    var en = entity("resources");
    openEditor(en, null);
    var set = function (id, v) { var n = $("#f_" + id); if (n && v != null) n.value = v; };
    var reDia = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
    var slug = (c.organization || c.territory || "propuesta").toLowerCase().normalize("NFD").replace(reDia, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    set("id", slug || "nuevo-recurso");
    set("name", c.organization || "");
    set("org", c.organization || "");
    set("description", (c.description || "").replace(/^\[[^\]]*\]\s*/, ""));
    set("coverage", c.territory || "");
    set("url", c.source_url || "");
    var msg = $("#editMsg"); if (msg) { msg.hidden = false; msg.className = "al-msg"; msg.textContent = "Datos precargados desde la propuesta de " + (c.contact_email || "—") + ". Completa y guarda. Luego marca la propuesta como 'publicado'."; }
  }

  /* ---------- Arranque ---------- */
  function boot() {
    sb.auth.getUser().then(function (r) {
      var user = r.data && r.data.user;
      if (!user) { renderLogin(); return; }
      state.user = user;
      sb.rpc("is_admin").then(function (res) {
        if (res.error) { renderLogin("No se pudo verificar el acceso: " + res.error.message, true); return; }
        if (!res.data) {
          app.innerHTML = '<div class="admin-login"><div class="al-card"><h1>Sin acceso</h1><p class="al-sub">Tu correo (' + esc(user.email) + ") no está habilitado como administrador. Pide que te agreguen.</p><button class=\"btn-ghost\" id=\"so\">Cerrar sesión</button></div></div>";
          $("#so").addEventListener("click", signOut); return;
        }
        state.isAdmin = true; renderShell();
      });
    });
  }

  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) { boot(); return; }
    if (authError) { renderLogin("No pudimos validar el enlace: " + authError + " Pide uno nuevo o inicia sesión con tu contraseña.", true); return; }
    if (arrivedFromAuth) { renderLogin("Tu correo quedó confirmado. Ahora inicia sesión con tu correo y contraseña.", false); return; }
    renderLogin();
  });
})();
