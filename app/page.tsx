"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "./components/ModeSwitch";
import { ResponseMap } from "./components/ResponseMap";
import { incidents, municipalities } from "../lib/data";
import { getSupabaseClient } from "../lib/supabase";

type WorkspacePanel = "situacion" | "mapa" | "municipios" | "recursos" | "ayudar";

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

const panels: { id: WorkspacePanel; label: string; short: string }[] = [
  { id: "situacion", label: "Situación", short: "SI" },
  { id: "mapa", label: "Mapa", short: "MA" },
  { id: "municipios", label: "Municipios", short: "MU" },
  { id: "recursos", label: "Recursos", short: "RE" },
  { id: "ayudar", label: "Cómo actuar", short: "AC" },
];

const panelCopy: Record<WorkspacePanel, { eyebrow: string; title: string; description: string }> = {
  situacion: { eyebrow: "Panorama consolidado", title: "Situación actual", description: "Alertas publicadas con fuente y fecha de corte visibles." },
  mapa: { eyebrow: "Capa territorial", title: "Necesidades y respuesta", description: "Explora las fichas territoriales disponibles y su nivel de contraste." },
  municipios: { eyebrow: "Lectura territorial", title: "Municipios priorizados", description: "Compara cobertura, prioridad y necesidades registradas." },
  recursos: { eyebrow: "Directorio curado", title: "Recursos para actuar", description: "Canales reales, revisados y conectados a Red Viva." },
  ayudar: { eyebrow: "Rutas de acción", title: "Necesito ayuda / Quiero ayudar", description: "Empieza por la ruta correcta antes de desplazarte o donar." },
};

const modeCategories: Record<ResponseMode, string[]> = {
  necesito: ["Atención", "Vía"],
  ayudar: ["Necesidad", "Acopio"],
};

const needIntents = new Set(["emergencia", "buscar-persona", "buscar-mascota", "ayuda-oficial", "albergue-salud", "cifras", "acopios"]);
const helpIntents = new Set(["donar", "acopios", "voluntariado", "buscar-persona", "buscar-mascota"]);

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
  const [activePanel, setActivePanel] = useState<WorkspacePanel>("mapa");
  const [mode, setMode] = useState<ResponseMode>("necesito");
  const [selectedId, setSelectedId] = useState(incidents[2].id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [resources, setResources] = useState<HomeResource[]>(fallbackResources);
  const [situations, setSituations] = useState<SituationUpdate[]>(fallbackSituations);
  const [liveState, setLiveState] = useState<"loading" | "live" | "fallback">("loading");
  const [detailOpen, setDetailOpen] = useState(true);
  const [methodOpen, setMethodOpen] = useState(false);

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
    () => incidents.filter((item) => modeCategories[mode].includes(item.category)),
    [mode],
  );

  const filteredIncidents = useMemo(() => modeIncidents.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const haystack = `${item.title} ${item.place} ${item.municipality} ${item.department}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, modeIncidents, query]);

  const filteredMunicipalities = useMemo(() => municipalities.filter((item) =>
    `${item.name} ${item.department} ${item.priority}`.toLowerCase().includes(query.toLowerCase()),
  ), [query]);

  const filteredSituations = useMemo(() => situations.filter((item) =>
    `${item.title} ${item.metric} ${item.region} ${item.source_name}`.toLowerCase().includes(query.toLowerCase()),
  ), [query, situations]);

  const filteredResources = useMemo(() => {
    const intents = mode === "necesito" ? needIntents : helpIntents;
    return resources.filter((item) => {
      const matchesMode = item.intents.some((intent) => intents.has(intent));
      const matchesQuery = `${item.name} ${item.org} ${item.action} ${item.coverage}`.toLowerCase().includes(query.toLowerCase());
      return matchesMode && matchesQuery;
    });
  }, [mode, query, resources]);

  const selected = incidents.find((item) => item.id === selectedId) ?? modeIncidents[0] ?? incidents[0];
  const currentCopy = panelCopy[activePanel];

  const selectIncident = useCallback((id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  }, []);

  const changeMode = useCallback((nextMode: ResponseMode) => {
    setMode(nextMode);
    setCategory("Todos");
    setSelectedId(incidents.find((item) => modeCategories[nextMode].includes(item.category))?.id ?? incidents[0].id);
    setDetailOpen(true);
  }, []);

  function openPanel(panel: WorkspacePanel) {
    setActivePanel(panel);
    setQuery("");
    setCategory("Todos");
  }

  return (
    <main className={`response-console mode-${mode}`}>
      <SiteHeader />

      <section className="console-bar" aria-label="Navegación operativa">
        <div className="event-identity">
          <span className={`connection-light ${liveState}`} />
          <div><b>Respuesta Colombia</b><small>Datos curados por Red Viva</small></div>
        </div>
        <nav aria-label="Vistas del puesto de operación">
          {panels.map((panel) => (
            <button key={panel.id} type="button" className={activePanel === panel.id ? "active" : ""} aria-pressed={activePanel === panel.id} onClick={() => openPanel(panel.id)}>
              <span aria-hidden="true">{panel.short}</span>{panel.label}
            </button>
          ))}
        </nav>
        <button className="method-button" type="button" onClick={() => setMethodOpen(true)}>Datos y método</button>
      </section>

      <section className="console-metrics" aria-label="Resumen de la plataforma">
        <div><span>Estado de la conexión</span><b>{liveState === "live" ? "En vivo" : liveState === "loading" ? "Conectando" : "Respaldo local"}</b><small>Supabase · fuentes originales</small></div>
        <dl>
          <div><dt>Alertas publicadas</dt><dd>{situations.length}</dd></div>
          <div><dt>Recursos curados</dt><dd>{resources.length}</dd></div>
          <div><dt>Fichas ampliadas</dt><dd>{municipalities.length}</dd></div>
          <div className="demo-metric"><dt>Puntos demostrativos</dt><dd>{incidents.length}</dd></div>
        </dl>
        <a href="tel:123"><span>Emergencia</span><b>123</b></a>
      </section>

      <section className="console-workspace">
        <aside className="console-sidebar">
          <header className="console-sidebar-head">
            <div><p>{currentCopy.eyebrow}</p><h1>{currentCopy.title}</h1><span>{currentCopy.description}</span></div>
          </header>

          <label className="console-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activePanel === "mapa" ? "Municipio, lugar o necesidad" : `Buscar en ${currentCopy.title.toLowerCase()}`} />
            {query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>×</button>}
          </label>

          {(activePanel === "mapa" || activePanel === "recursos" || activePanel === "ayudar") && (
            <ModeSwitch mode={mode} onChange={changeMode} compact />
          )}

          {activePanel === "mapa" && (
            <>
              <div className="console-filter-row" aria-label="Filtrar fichas">
                {["Todos", ...modeCategories[mode]].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
              <div className="console-list-meta"><b>{filteredIncidents.length} fichas visibles</b><span>Capa demostrativa</span></div>
              <div className="console-scroll-list">
                {filteredIncidents.map((incident) => (
                  <button type="button" key={incident.id} className={`console-incident ${selected.id === incident.id ? "selected" : ""}`} onClick={() => selectIncident(incident.id)}>
                    <div><small>{incident.id}</small><span className={`severity severity-${incident.severity.toLowerCase().replace("í", "i")}`}>{incident.severity}</span></div>
                    <b>{incident.title}</b><p>{incident.place} · {incident.municipality}</p>
                    <footer><span>{incident.status}</span><span>{incident.sources} fuentes</span><time>{incident.updated}</time></footer>
                  </button>
                ))}
              </div>
            </>
          )}

          {activePanel === "situacion" && (
            <div className="console-scroll-list situation-list">
              {filteredSituations.map((item) => (
                <a href={item.url ?? "#"} target="_blank" rel="noreferrer" key={item.id} className={item.severity}>
                  <header><span>{item.region}</span><time>{item.as_of}</time></header>
                  <h2>{item.title}</h2><b>{item.metric}</b><p>{item.summary}</p>
                  <footer><span>{item.source_name}</span><i>Fuente original ↗</i></footer>
                </a>
              ))}
            </div>
          )}

          {activePanel === "municipios" && (
            <>
              <div className="console-list-meta"><b>{filteredMunicipalities.length} fichas ampliadas</b><Link href="/municipios">Ver módulo completo →</Link></div>
              <div className="console-scroll-list municipality-list">
                {filteredMunicipalities.map((item) => (
                  <Link href="/municipios" key={item.name}>
                    <header><b>{item.name}</b><span>{item.priority}</span></header><p>{item.department}</p>
                    <dl><div><dt>Registros</dt><dd>{item.records}</dd></div><div><dt>Necesidades</dt><dd>{item.needs}</dd></div><div><dt>Actualización</dt><dd>{item.updated}</dd></div></dl>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activePanel === "recursos" && (
            <>
              <div className="console-list-meta"><b>{filteredResources.length} recursos para esta ruta</b><Link href={`/recursos?modo=${mode}`}>Ver directorio →</Link></div>
              <div className="console-scroll-list resource-list">
                {filteredResources.map((resource) => (
                  <a href={resource.url} target={resource.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" key={resource.id}>
                    <header><span>{readable(resource.type)}</span><i className={resource.verification}>{readable(resource.verification)}</i></header>
                    <h2>{resource.name}</h2><b>{resource.action}</b><p>{resource.description}</p>
                    <footer><span>{resource.coverage}</span><span>{readable(resource.status)} ↗</span></footer>
                  </a>
                ))}
              </div>
            </>
          )}

          {activePanel === "ayudar" && (
            <div className="action-panel">
              <a className="emergency-action" href="tel:123"><span>Emergencia inmediata</span><b>123</b><small>Policía, bomberos y atención urgente</small></a>
              <div className="action-routes">
                <Link href={`/recursos?modo=${mode}`}><span>01</span><b>{mode === "necesito" ? "Encontrar atención y orientación" : "Revisar canales para donar"}</b><i>→</i></Link>
                <Link href={`/aportar?modo=${mode}`}><span>02</span><b>{mode === "necesito" ? "Reportar una necesidad" : "Registrar una contribución"}</b><i>→</i></Link>
                <Link href="/logistica"><span>03</span><b>Consultar logística y entregas</b><i>→</i></Link>
              </div>
              <p><b>Antes de movilizar ayuda:</b> confirma vigencia, responsable de recepción, horario y categorías aceptadas en el canal original.</p>
            </div>
          )}
        </aside>

        <div className="console-map-panel">
          <ResponseMap incidents={modeIncidents} selectedId={selected.id} onSelect={selectIncident} />
          <div className="map-operational-label"><span>Territorio en desarrollo</span><b>4 fichas demostrativas · recursos reales separados</b></div>

          {activePanel === "mapa" && detailOpen && (
            <article className="console-detail">
              <header><span>Ficha territorial</span><button type="button" aria-label="Cerrar ficha" onClick={() => setDetailOpen(false)}>×</button></header>
              <div className="detail-status"><small>{selected.id}</small><span className={`severity severity-${selected.severity.toLowerCase().replace("í", "i")}`}>{selected.severity}</span><i>{selected.status}</i></div>
              <h2>{selected.title}</h2><p className="detail-location">{selected.place}<br />{selected.municipality}, {selected.department}</p>
              <p>{selected.description}</p>
              <dl><div><dt>Fuentes asociadas</dt><dd>{selected.sources}</dd></div><div><dt>Última actualización</dt><dd>{selected.updated}</dd></div></dl>
              <div className="demo-warning"><b>Registro ilustrativo</b><span>No usar para tomar una decisión en terreno sin verificar una fuente original.</span></div>
              <Link href={`/aportar?modo=${mode}`}>{mode === "necesito" ? "Aportar una actualización" : "Coordinar este apoyo"} →</Link>
            </article>
          )}

          {activePanel === "mapa" && !detailOpen && <button className="reopen-detail" type="button" onClick={() => setDetailOpen(true)}>Abrir ficha seleccionada</button>}

          <div className="console-legend"><span><i className="dot critical" />Crítica</span><span><i className="dot high" />Alta</span><span><i className="dot medium" />Media</span><span><i className="dot operative" />Respuesta</span><b>Datos territoriales demostrativos</b></div>
        </div>
      </section>

      {methodOpen && (
        <div className="method-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMethodOpen(false); }}>
          <section className="method-modal" role="dialog" aria-modal="true" aria-labelledby="method-title">
            <header><div><p>Red Viva · criterios públicos</p><h2 id="method-title">Información útil sin ocultar su grado de confianza.</h2></div><button type="button" aria-label="Cerrar datos y método" onClick={() => setMethodOpen(false)}>×</button></header>
            <div className="method-grid">
              <article><span>01</span><h3>Qué está conectado</h3><p>El directorio de recursos y las alertas se leen desde Supabase y conservan un respaldo local si la conexión falla.</p></article>
              <article><span>02</span><h3>Qué sigue en demostración</h3><p>Las cuatro fichas del mapa y las fichas municipales ampliadas ilustran el flujo; no constituyen un censo territorial.</p></article>
              <article><span>03</span><h3>Cómo se presenta la confianza</h3><p>Verificación, vigencia, fuente y fecha de corte aparecen por separado. Una organización confiable no garantiza que un dato siga vigente.</p></article>
              <article><span>04</span><h3>Cómo contribuir</h3><p>Los aportes entran a una cola privada de revisión antes de publicarse. La información sensible no se muestra en el frontend público.</p></article>
            </div>
            <footer><Link href="/aportar">Aportar información →</Link><Link href="/gestion">Ir a gestión privada</Link></footer>
          </section>
        </div>
      )}
    </main>
  );
}
