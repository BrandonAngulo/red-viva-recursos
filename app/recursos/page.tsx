import { SiteHeader } from "../components/SiteHeader";
import { resources } from "../../lib/data";

export default function RecursosPage() {
  return <main className="content-page"><SiteHeader active="recursos" /><div className="page-wrap">
    <header className="page-intro"><div><p className="eyebrow">Directorio integrado</p><h1>Recursos para actuar</h1><p>Una sola puerta de entrada a herramientas oficiales, institucionales y ciudadanas. Conservamos su procedencia y siempre enlazamos al recurso original.</p></div><span className="page-meta">8 recursos · revisión editorial 14 ago 2026</span></header>
    <section className="resource-grid">{resources.map((resource) => <article className="resource-card" key={resource.name}>
      <div className="tags"><span className="tag">{resource.type}</span><span className={`tag ${resource.verification === "Verificado" ? "verified" : ""}`}>{resource.verification}</span><span className="tag">{resource.status}</span></div>
      <h2>{resource.name}</h2><p>{resource.action}</p>
      <dl><div><dt>Cobertura</dt><dd>{resource.coverage}</dd></div><div><dt>Categoría</dt><dd>{resource.category}</dd></div></dl>
      <a className="text-link" href={resource.url} target="_blank" rel="noreferrer">Abrir recurso original ↗</a>
    </article>)}</section>
  </div></main>;
}
