"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "./components/ModeSwitch";
import { ResponseMap } from "./components/ResponseMap";
import { incidents } from "../lib/data";
import { getSupabaseClient } from "../lib/supabase";

type HomeResource = {
  id: string;
  name: string;
  org: string | null;
  action: string | null;
  description: string | null;
  intents: string[];
  type: "oficial" | "institucional" | "ciudadano";
  coverage: string | null;
  url: string;
  status: "activo" | "desactualizado" | "caido" | "cerrado";
  verification: "verificado" | "en-revision" | "por-verificar";
  declared_update: string | null;
};

type SituationUpdate = {
  id: string;
  title: string;
  metric: string | null;
  summary: string | null;
  region: string | null;
  severity: "critical" | "warning" | "info";
  source_name: string | null;
  url: string | null;
  as_of: string | null;
};

const intentOptions = [
  { id: "emergencia", mode: "necesito", mark: "123", label: "Emergencia inmediata", hint: "Líneas oficiales y atención urgente." },
  { id: "buscar-persona", mode: "ambos", mark: "PE", label: "Buscar o reportar una persona", hint: "Consulta siempre el recurso original." },
  { id: "buscar-mascota", mode: "ambos", mark: "MA", label: "Buscar o reportar una mascota", hint: "Directorios especializados activos." },
  { id: "ayuda-oficial", mode: "necesito", mark: "OF", label: "Solicitar ayuda oficial", hint: "Canales institucionales verificados." },
  { id: "albergue-salud", mode: "ambos", mark: "SA", label: "Albergue, salud o conectividad", hint: "Atención y servicios disponibles." },
  { id: "cifras", mode: "necesito", mark: "DA", label: "Cifras, réplicas y reportes", hint: "Fuentes oficiales y humanitarias." },
  { id: "donar", mode: "ayudar", mark: "DO", label: "Donar dinero o suministros", hint: "Canales revisados antes de aportar." },
  { id: "acopios", mode: "ambos", mark: "AC", label: "Encontrar centros de acopio", hint: "Verifica vigencia antes de desplazarte." },
  { id: "voluntariado", mode: "ayudar", mark: "VO", label: "Participar como voluntario", hint: "Iniciativas y organizaciones activas." },
] as const;

const modeContent = {
  necesito: {
    eyebrow: "Orientación para personas afectadas",
    title: <>Encuentra la ruta de ayuda <em>que necesitas ahora.</em></>,
    description: "Recursos reales y revisados para atención oficial, búsqueda de personas o mascotas, albergue, salud y seguimiento de la emergencia.",
    primary: ["Explorar recursos de ayuda", "/recursos?modo=necesito"],
    secondary: ["Reportar una necesidad", "/aportar?modo=necesito"],
    categories: ["Atención", "Vía"],
  },
  ayudar: {
    eyebrow: "Coordinación para personas y organizaciones",
    title: <>Conecta tu apoyo con una <em>necesidad comprobable.</em></>,
    description: "Consulta canales de donación, centros de acopio, voluntariado y movimientos logísticos antes de movilizar recursos.",
    primary: ["Explorar formas de ayudar", "/recursos?modo=ayudar"],
    secondary: ["Registrar una contribución", "/aportar?modo=ayudar"],
    categories: ["Necesidad", "Acopio"],
  },
} as const;

const fallbackResources: HomeResource[] = [
  { id: "lineas-emergencia", name: "Líneas nacionales de emergencia", org: "Sistema Nacional de Gestión del Riesgo", action: "Llamar a servicios de emergencia", description: "123 emergencias · 132 Cruz Roja · 144 Defensa Civil · 119 Bomberos.", intents: ["emergencia"], type: "oficial", coverage: "Colombia", url: "tel:123", status: "activo", verification: "verificado", declared_update: "Vigente" },
  { id: "ungrd", name: "UNGRD", org: "Unidad Nacional para la Gestión del Riesgo de Desastres", action: "Consultar comunicados y atención oficial", description: "Fuente prioritaria para cifras, decisiones y canales institucionales de la respuesta nacional.", intents: ["ayuda-oficial", "cifras", "reportar-danos"], type: "oficial", coverage: "Colombia", url: "https://portal.gestiondelriesgo.gov.co/", status: "activo", verification: "verificado", declared_update: "Consulta dinámica" },
  { id: "sgc-sismos", name: "Servicio Geológico Colombiano", org: "Servicio Geológico Colombiano", action: "Consultar sismos y réplicas", description: "Fuente primaria oficial de información sísmica en tiempo cercano al real.", intents: ["cifras"], type: "oficial", coverage: "Colombia", url: "https://www.sgc.gov.co/sismos", status: "activo", verification: "verificado", declared_update: "Consulta dinámica" },
  { id: "cruz-roja", name: "Cruz Roja Colombiana", org: "Cruz Roja Colombiana", action: "Conocer canales de atención y donación", description: "Atención humanitaria y donaciones desde los canales publicados en su dominio oficial.", intents: ["donar", "ayuda-oficial", "albergue-salud"], type: "institucional", coverage: "Colombia", url: "https://www.cruzrojacolombiana.org/", status: "activo", verification: "verificado", declared_update: "Según campaña vigente" },
];

const fallbackSituations: SituationUpdate[] = [
  { id: "terremoto-nacional", title: "Terremoto 7.4 — balance nacional", metric: "288 fallecidos · 4.018 heridos", summary: "202 desaparecidos, 354 rescatados y afectaciones reportadas en 448 municipios.", region: "Nacional", severity: "critical", source_name: "UNGRD", url: "https://portal.gestiondelriesgo.gov.co/", as_of: "2026-08-14" },
  { id: "replicas-choco", title: "Réplicas en curso", metric: "Chocó y occidente", summary: "El Servicio Geológico Colombiano advierte que las réplicas continuarán.", region: "Occidente", severity: "warning", source_name: "Servicio Geológico Colombiano", url: "https://www.sgc.gov.co/sismos", as_of: "2026-08-14" },
  { id: "incendios-narino", title: "Incendios forestales en Nariño", metric: "12 activos · ~2.000 ha", summary: "Calamidad pública declarada en 29 municipios; respuesta departamental activa.", region: "Nariño", severity: "warning", source_name: "Gobernación de Nariño", url: "https://narino.gov.co/", as_of: "2026-08-13" },
];

function readable(value: string) {
  return value.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default function Home() {
  const [mode, setMode] = useState<ResponseMode>("necesito");
  const [selectedId, setSelectedId] = useState(incidents[0].id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [resources, setResources] = useState<HomeResource[]>(fallbackResources);
  const [situations, setSituations] = useState<SituationUpdate[]>(fallbackSituations);
  const [liveState, setLiveState] = useState<"loading" | "live" | "fallback">("loading");
  const content = modeContent[mode];

  useEffect(() => {
    let active = true;
    const db = getSupabaseClient();
    Promise.all([
      db.from("digital_resources").select("id,name,org,action,description,intents,type,coverage,url,status,verification,declared_update").eq("is_published", true).order("sort_order"),
      db.from("situation_updates").select("id,title,metric,summary,region,severity,source_name,url,as_of").eq("is_published", true).order("sort_order"),
    ]).then(([resourceResult, situationResult]) => {
      if (!active) return;
      if (resourceResult.data?.length) setResources(resourceResult.data as HomeResource[]);
      if (situationResult.data?.length) setSituations(situationResult.data as SituationUpdate[]);
      setLiveState(resourceResult.error || situationResult.error ? "fallback" : "live");
    });
    return () => { active = false; };
  }, []);

  const modeIncidents = useMemo(
    () => incidents.filter((item) => (content.categories as readonly string[]).includes(item.category)),
    [content.categories],
  );
  const visibleIntents = useMemo(
    () => intentOptions.filter((intent) => intent.mode === mode || intent.mode === "ambos"),
    [mode],
  );
  const featuredResources = useMemo(() => {
    const allowed = new Set<string>(visibleIntents.map((intent) => intent.id));
    return resources.filter((resource) => resource.intents.some((intent) => allowed.has(intent))).slice(0, 4);
  }, [resources, visibleIntents]);
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const changeMode = useCallback((nextMode: ResponseMode) => {
    setMode(nextMode);
    setSelectedId(incidents.find((item) => (modeContent[nextMode].categories as readonly string[]).includes(item.category))?.id ?? incidents[0].id);
    setCategory("Todos");
  }, []);

  const filtered = useMemo(() => modeIncidents.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const haystack = `${item.title} ${item.place} ${item.municipality} ${item.department}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, modeIncidents, query]);
  const selected = incidents.find((item) => item.id === selectedId) ?? modeIncidents[0] ?? incidents[0];
  const categories = ["Todos", ...content.categories];

  return (
    <main className={`app-shell response-home mode-${mode}`}>
      <SiteHeader />

      <section className="response-hero">
        <div className="response-hero-copy">
          <p className="eyebrow">Sismo 7.4 · respuesta ciudadana e institucional</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <ModeSwitch mode={mode} onChange={changeMode} compact />
          <div className="response-hero-actions">
            <Link className="primary-button" href={content.primary[1]}>{content.primary[0]} →</Link>
            <Link className="quiet-link" href={content.secondary[1]}>{content.secondary[0]}</Link>
          </div>
        </div>
        <aside className="response-emergency-card">
          <span>Respuesta inmediata</span>
          <h2>¿Hay una emergencia?</h2>
          <p>Llama primero a los canales oficiales. Esta plataforma orienta y centraliza recursos; no reemplaza a las autoridades.</p>
          <a href="tel:123"><b>123</b><span>Emergencias</span></a>
          <div><a href="tel:132">132 · Cruz Roja</a><a href="tel:144">144 · Defensa Civil</a><a href="tel:119">119 · Bomberos</a></div>
        </aside>
      </section>

      <section className="home-status" aria-label="Estado de los datos">
        <div><i className={liveState} /><span><b>{liveState === "live" ? "Datos en vivo" : liveState === "loading" ? "Conectando datos" : "Información de respaldo"}</b><small>Supabase · Red Viva</small></span></div>
        <dl><div><dt>Recursos publicados</dt><dd>{resources.length || "14"}</dd></div><div><dt>Alertas actuales</dt><dd>{situations.length || "3"}</dd></div><div><dt>Municipios consolidados</dt><dd>448</dd></div></dl>
        <Link href="/recursos">Ver directorio completo →</Link>
      </section>

      <section className="decision-section">
        <header><div><p className="eyebrow">Empieza por una decisión concreta</p><h2>¿Qué necesitas hacer?</h2></div><p>Selecciona una ruta. La confianza del recurso y su vigencia se muestran por separado.</p></header>
        <div className="decision-grid">
          {visibleIntents.map((intent) => <Link href={`/recursos?modo=${mode}&intent=${intent.id}`} key={intent.id}>
            <span>{intent.mark}</span><div><b>{intent.label}</b><small>{intent.hint}</small></div><i aria-hidden="true">→</i>
          </Link>)}
        </div>
      </section>

      <section className="live-overview">
        <div className="situation-overview">
          <header><div><p className="eyebrow">Información prioritaria</p><h2>Situación actual</h2></div><span><i /> Actualización en vivo</span></header>
          <div className="home-situation-grid">
            {situations.slice(0, 3).map((item) => <a href={item.url ?? "#"} target="_blank" rel="noreferrer" className={item.severity} key={item.id}>
              <small>{item.region}</small><h3>{item.title}</h3><b>{item.metric}</b><p>{item.summary}</p><footer><span>{item.source_name}</span><time>{item.as_of}</time></footer>
            </a>)}
            {liveState === "loading" && [1, 2, 3].map((item) => <div className="situation-loading" key={item}>Cargando actualización…</div>)}
          </div>
        </div>
        <div className="resource-overview">
          <header><div><p className="eyebrow">Accesos verificados</p><h2>Recursos para actuar</h2></div><Link href={`/recursos?modo=${mode}`}>Ver todos →</Link></header>
          <div className="home-resource-grid">
            {featuredResources.map((resource) => <article key={resource.id}>
              <div><span>{readable(resource.type)}</span><span className={resource.verification === "verificado" ? "verified" : "review"}>● {readable(resource.verification)}</span><span>● {readable(resource.status)}</span></div>
              <h3>{resource.name}</h3><b>{resource.action}</b><p>{resource.description}</p>
              <small>{resource.org} · {resource.coverage}</small>
              <a href={resource.url} target={resource.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{resource.url.startsWith("tel:") ? "Llamar ahora" : "Abrir recurso"} →</a>
            </article>)}
          </div>
        </div>
      </section>

      <section className="territory-intro">
        <div><p className="eyebrow">Capa territorial en desarrollo</p><h2>Mapa de necesidades y respuesta</h2></div>
        <p>Esta vista demuestra el flujo de consulta territorial. Sus fichas todavía son ilustrativas y se mantienen separadas de los recursos y alertas publicados.</p>
      </section>

      <section className="map-workspace">
        <aside className="map-sidebar">
          <div className="sidebar-heading"><div><p className="eyebrow">{mode === "necesito" ? "Opciones disponibles" : "Oportunidades de apoyo"}</p><h2>{mode === "necesito" ? "Atención y acceso" : "Necesidades y acopios"}</h2></div><button className="icon-button" aria-label="Opciones de filtros">···</button></div>
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Municipio, lugar o necesidad" /></label>
          <div className="filter-row" aria-label="Filtrar por categoría">
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="results-heading"><span>{filtered.length} registros visibles</span><small>Datos demostrativos</small></div>
          <div className="incident-list">
            {filtered.map((incident) => (
              <button key={incident.id} className={`incident-card ${selectedId === incident.id ? "selected" : ""}`} onClick={() => handleSelect(incident.id)}>
                <div className="card-top"><span className={`severity severity-${incident.severity.toLowerCase().replace("í", "i")}`}>{incident.severity}</span><small>{incident.id}</small></div>
                <h3>{incident.title}</h3><p>{incident.place} · {incident.municipality}</p>
                <div className="card-meta"><span>{incident.status}</span><span>{incident.sources} fuentes</span><time>{incident.updated}</time></div>
              </button>
            ))}
          </div>
          <div className="coverage-note"><b>La ausencia de una ficha no significa ausencia de afectación.</b><span>El consolidado oficial y la información detallada se muestran por separado.</span></div>
        </aside>

        <div className="map-panel">
          <ResponseMap incidents={modeIncidents} selectedId={selectedId} onSelect={handleSelect} />
          <div className="map-label"><span>{mode === "necesito" ? "Capa de orientación" : "Capa de coordinación"}</span><strong>{mode === "necesito" ? "Dónde recibir apoyo" : "Dónde hace falta apoyo"}</strong></div>
          <article className="map-detail">
            <div className="detail-head"><span className={`severity severity-${selected.severity.toLowerCase().replace("í", "i")}`}>{selected.severity}</span><small>{selected.status}</small></div>
            <p className="eyebrow">{selected.id} · {selected.category}</p><h2>{selected.title}</h2><p className="detail-place">{selected.place}<br />{selected.municipality}, {selected.department}</p>
            <p>{selected.description}</p>
            <div className="detail-verification"><span>{selected.sources} fuentes</span><span>{selected.updated}</span></div>
            <Link href={`/aportar?modo=${mode}`} className="primary-button">{mode === "necesito" ? "Reportar una actualización" : "Coordinar este apoyo"}</Link>
          </article>
          <div className="map-legend"><span><i className="dot critical" />Crítica</span><span><i className="dot high" />Alta</span><span><i className="dot medium" />Media</span><span><i className="dot operative" />Respuesta operativa</span></div>
        </div>
      </section>
    </main>
  );
}
