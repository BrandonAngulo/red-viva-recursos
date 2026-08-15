import { SiteHeader } from "../components/SiteHeader";
import { shipments } from "../../lib/data";

export default function LogisticaPage() {
  return <main className="content-page"><SiteHeader active="logistica" /><div className="page-wrap">
    <header className="page-intro"><div><p className="eyebrow">Coordinación de entregas</p><h1>Logística de donaciones</h1><p>Seguimiento desde la preparación hasta la recepción, relacionado con necesidades verificadas y puntos autorizados. Los registros de esta vista son demostrativos.</p></div><span className="page-meta">3 movimientos de muestra</span></header>
    <section className="shipment-grid">{shipments.map((item) => <article className="shipment-card" key={item.id}><p className="eyebrow">{item.id}</p><h2>{item.route}</h2><p>{item.cargo}</p><span className="shipment-status">{item.status}</span><p>Actualizado {item.updated}</p></article>)}</section>
  </div></main>;
}
