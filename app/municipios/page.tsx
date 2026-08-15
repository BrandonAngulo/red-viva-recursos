import { SiteHeader } from "../components/SiteHeader";
import { municipalities } from "../../lib/data";

export default function MunicipiosPage() {
  return <main className="content-page"><SiteHeader active="municipios" /><div className="page-wrap">
    <header className="page-intro"><div><p className="eyebrow">Lectura territorial</p><h1>Municipios priorizados</h1><p>La afectación y la cobertura de información se muestran por separado. Un municipio sin registros suficientes es una zona por levantar, no una zona sin necesidades.</p></div><span className="page-meta">Vista de demostración</span></header>
    <section className="municipality-grid">{municipalities.map((item) => <article className="municipality-card" key={item.name}><div className="tags"><span className="tag">{item.priority}</span><span className="tag">{item.department}</span></div><h2>{item.name}</h2><p>{item.records} registros territoriales · {item.needs} necesidades abiertas</p><p>Última actualización: {item.updated}</p><a className="text-link" href={`/?municipio=${encodeURIComponent(item.name)}`}>Ver en el mapa →</a></article>)}</section>
  </div></main>;
}
