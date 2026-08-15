"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { ResponseMap } from "./components/ResponseMap";
import { incidents } from "../lib/data";

export default function Home() {
  const [selectedId, setSelectedId] = useState(incidents[0].id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const filtered = useMemo(() => incidents.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const haystack = `${item.title} ${item.place} ${item.municipality} ${item.department}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [category, query]);
  const selected = incidents.find((item) => item.id === selectedId) ?? incidents[0];

  return (
    <main className="app-shell">
      <SiteHeader />
      <section className="status-bar" aria-label="Resumen de la plataforma">
        <div><span className="live-dot" /> <b>Centro de integración</b><small>Fuentes y recursos en una sola vista</small></div>
        <dl><div><dt>Municipios observados</dt><dd>432</dd></div><div><dt>Recursos enlazados</dt><dd>8</dd></div><div><dt>Envíos de muestra</dt><dd>3</dd></div></dl>
        <a href="tel:123" className="emergency-link">Emergencias 123</a>
      </section>

      <section className="map-workspace">
        <aside className="map-sidebar">
          <div className="sidebar-heading"><div><p className="eyebrow">Información territorial</p><h1>Mapa de respuesta</h1></div><button className="icon-button" aria-label="Opciones de filtros">···</button></div>
          <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Municipio, lugar o necesidad" /></label>
          <div className="filter-row" aria-label="Filtrar por categoría">
            {["Todos", "Necesidad", "Acopio", "Atención", "Vía"].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="results-heading"><span>{filtered.length} registros visibles</span><small>Ordenados por prioridad</small></div>
          <div className="incident-list">
            {filtered.map((incident) => (
              <button key={incident.id} className={`incident-card ${selectedId === incident.id ? "selected" : ""}`} onClick={() => handleSelect(incident.id)}>
                <div className="card-top"><span className={`severity severity-${incident.severity.toLowerCase().replace("í", "i")}`}>{incident.severity}</span><small>{incident.id}</small></div>
                <h2>{incident.title}</h2><p>{incident.place} · {incident.municipality}</p>
                <div className="card-meta"><span>{incident.status}</span><span>{incident.sources} fuentes</span><time>{incident.updated}</time></div>
              </button>
            ))}
          </div>
        </aside>

        <div className="map-panel">
          <ResponseMap incidents={incidents} selectedId={selectedId} onSelect={handleSelect} />
          <div className="map-label"><span>Prototipo territorial</span><strong>Datos ilustrativos, no operativos</strong></div>
          <article className="map-detail">
            <div className="detail-head"><span className={`severity severity-${selected.severity.toLowerCase().replace("í", "i")}`}>{selected.severity}</span><button aria-label="Cerrar detalle">×</button></div>
            <p className="eyebrow">{selected.id} · {selected.category}</p><h2>{selected.title}</h2><p className="detail-place">{selected.place}<br />{selected.municipality}, {selected.department}</p>
            <p>{selected.description}</p>
            <div className="detail-verification"><span>{selected.status}</span><span>{selected.sources} fuentes</span><span>{selected.updated}</span></div>
            <Link href="/aportar" className="primary-button">Aportar una actualización</Link>
          </article>
          <div className="map-legend"><span><i className="dot critical" />Crítica</span><span><i className="dot high" />Alta</span><span><i className="dot medium" />Media</span><span><i className="dot operative" />Respuesta operativa</span></div>
        </div>
      </section>
    </main>
  );
}
