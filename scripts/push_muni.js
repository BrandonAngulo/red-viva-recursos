/* Carga puntual de municipios afectados a Supabase (tabla municipalities).
   Conserva los ya existentes (curados) e inserta solo los nuevos.
   Requiere una política temporal de INSERT anónimo (se agrega y se quita alrededor). */
const fs = require("fs");
const URL = "https://afnwhdoqdwopvcsdgswi.supabase.co";
const KEY = "sb_publishable_1EcdaBYdh9GVIVTdqtWZoQ_anWOqq8a";
const reDia = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(reDia, "");
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const RANK = { "epicentro": 0, "critica": 1, "muy alta": 2, "alta": 3, "emergencia paralela": 4, "media": 5 };

(async () => {
  const t = fs.readFileSync("data/territory.js", "utf8");
  const w = {}; new Function("window", t)(w);
  const muni = w.CRC_TERRITORY.municipalities || [];

  const ex = await fetch(`${URL}/rest/v1/municipalities?select=id,name,department`, { headers: { apikey: KEY } }).then((r) => r.json());
  const exKeys = new Set(ex.map((m) => norm(m.name) + "|" + norm(m.department)));

  const seen = new Set(), rows = [];
  for (const m of muni) {
    const key = norm(m.name) + "|" + norm(m.department);
    if (exKeys.has(key)) continue;                 // ya existe (curado) -> no tocar
    const id = slug(m.name + "-" + m.department);
    if (!id || seen.has(id)) continue; seen.add(id);
    rows.push({ id, name: m.name, department: m.department, priority: m.priority || null,
      note: m.note || null, url: m.url || null, is_published: true,
      sort_order: ((RANK[norm(m.priority)] ?? 7) * 1000) });
  }
  console.log("Existentes:", ex.length, "| Nuevos a insertar:", rows.length);
  if (!rows.length) { console.log("Nada que insertar."); return; }

  const res = await fetch(`${URL}/rest/v1/municipalities?on_conflict=id`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  console.log("HTTP", res.status, (await res.text()).slice(0, 300));
})();
