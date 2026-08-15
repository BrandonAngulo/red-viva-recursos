"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "./components/ModeSwitch";
import { ResponseMap } from "./components/ResponseMap";
import { incidents } from "../lib/data";

const modeContent = {
  necesito: {
    eyebrow: "Orientación para personas afectadas",
    title: "Encuentra ayuda cerca de ti",
    description: "Consulta puntos de atención, vías disponibles y recursos verificados. Si no encuentras tu situación, repórtala para revisión.",
    primary: ["Ver recursos para recibir ayuda", "/recursos?modo=necesito"],
    secondary: ["Reportar una necesidad", "/aportar?modo=necesito"],
    categories: ["Atención", "Vía"],
  },
  ayudar: {
    eyebrow: "Coordinación para personas y organizaciones",
    title: "Conecta tu ayuda con una necesidad real",
    description: "Revisa necesidades territoriales, puntos de acopio y movimientos logísticos antes de donar, desplazarte o despachar una carga.",
    primary: ["Ver logística de donaciones", "/logistica"],
    secondary: ["Registrar una contribución", "/aportar?modo=ayudar"],
    categories: ["Necesidad", "Acopio"],
  },
} as const;

export default function Home() {
  const [mode, setMode] = useState<ResponseMode>("necesito");
  const [selectedId, setSelectedId] = useState(incidents[0].id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const content = modeContent[mode];
  const modeIncidents = useMemo(
    () => incidents.filter((item) => (content.categories as readonly string[]).includes(item.category)),
    [content.categories],
  );
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
    <main className={`app-shell mode-${mode}`}>
      <SiteHeader />
      <section className="mode-band">
        <div className="mode-copy">
          <p className="eyebrow">Sismo 7.4 · respuesta territorial · Colombia</p>
          <h1>{mode === "necesito" ? <>Encuentra <em>ayuda cerca de ti.</em></> : <>Conecta tu ayuda con una <em>necesidad real.</em></>}</h1>
          <p>{content.description}</p>
        </div>
        <ModeSwitch mode={mode} onChange={changeMode} compact />
        <div className="mode-actions">
          <Link className="primary-button" href={content.primary[1]}>{content.primary[0]} →</Link>
          <Link className="quiet-link" href={content.secondary[1]}>{content.secondary[0]}</Link>
        </div>
      </section>

      <section className="status-bar" aria-label="Resumen de la plataforma">
        <div><span className="live-dot" /> <b>Datos integrados</b><small>Red Viva alimenta esta central</small></div>
        <dl><div><dt>Municipios del consolidado</dt><dd>448</dd></div><div><dt>Recursos curados</dt><dd>14</dd></div><div><dt>Fichas demostrativas</dt><dd>6</dd></div></dl>
        <span className="status-source">Corte editorial · 14 ago 2026</span>
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
