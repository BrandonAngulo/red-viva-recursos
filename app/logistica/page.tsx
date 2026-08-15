"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

const operations = [
  { id: "ENV-0142", origin: "Cali · Antigua Licorera", destination: "El Cairo", receiver: "Alcaldía y red comunitaria", status: "En tránsito", departed: "14 ago · 08:10", eta: "14 ago · 15:30", weight: "8,4 t", cargo: ["4.200 L de agua", "2,1 t de alimentos", "380 kits de aseo"], verified: true },
  { id: "ENV-0136", origin: "Medellín · Centro Norte", destination: "Quibdó", receiver: "Cruz Roja Chocó", status: "En tránsito", departed: "14 ago · 05:40", eta: "14 ago · 17:00", weight: "11,2 t", cargo: ["6,5 t de alimentos", "1,2 t de insumos médicos"], verified: true },
  { id: "ENV-0129", origin: "Bogotá · Banco de ayudas", destination: "Pereira", receiver: "PMU Pereira", status: "Recibido", departed: "13 ago · 18:20", eta: "14 ago · 06:05", weight: "14,8 t", cargo: ["620 colchonetas", "85 carpas", "3.000 L de agua"], verified: true },
  { id: "ENV-0148", origin: "Cali · Red de fundaciones", destination: "San José del Palmar", receiver: "Enlace pendiente", status: "Preparación", departed: "Pendiente", eta: "15 ago · 08:00", weight: "5,7 t", cargo: ["3 plantas eléctricas", "2,8 t de alimentos", "24 radios"], verified: false },
];

const stages = ["Preparación", "Despachado", "En tránsito", "Recibido", "Entregado"];

export default function LogisticaPage() {
  const [selectedId, setSelectedId] = useState(operations[0].id);
  const selected = operations.find((item) => item.id === selectedId) ?? operations[0];
  const currentStage = stages.indexOf(selected.status);

  return <main className="content-page"><SiteHeader active="logistica" /><div className="page-wrap logistics-wrap">
    <header className="page-intro"><div><p className="eyebrow">Trazabilidad de donaciones</p><h1>Movimiento de ayudas</h1><p>Del punto de origen a la entidad receptora y la entrega final. Una carga sin receptor confirmado no debería despacharse.</p></div><Link className="primary-button" href="/aportar?modo=ayudar">Registrar movimiento</Link></header>
    <section className="logistics-kpis"><div><b>40,1 t</b><span>Carga demostrativa registrada</span></div><div><b>4</b><span>Operaciones visibles</span></div><div><b>3</b><span>Receptores confirmados</span></div><div><b>1</b><span>Operación por validar</span></div></section>
    <section className="logistics-layout"><aside className="operation-list"><div className="operation-list-head"><b>Operaciones</b><span>Actualización reciente</span></div>{operations.map((item) => <button className={item.id === selected.id ? "selected" : ""} key={item.id} onClick={() => setSelectedId(item.id)}><div><span>{item.id}</span><em>{item.status}</em></div><h2>{item.origin} <i>→</i> {item.destination}</h2><p>{item.weight} · {item.receiver}</p></button>)}</aside>
      <article className="operation-detail"><header><div><p className="eyebrow">{selected.id} · {selected.verified ? "Operación verificada" : "Requiere validación"}</p><h2>{selected.origin} <span>→</span> {selected.destination}</h2></div><em className={selected.verified ? "verified" : "warning"}>{selected.status}</em></header>
        <div className="route-summary"><div><span>Salida</span><b>{selected.departed}</b></div><div><span>Llegada estimada</span><b>{selected.eta}</b></div><div><span>Carga total</span><b>{selected.weight}</b></div></div>
        <section><h3>Contenido declarado</h3><ul className="cargo-list">{selected.cargo.map((item) => <li key={item}><span>{item}</span><b>{selected.status}</b></li>)}</ul></section>
        <section className="receiver-card"><span>Entidad receptora</span><b>{selected.receiver}</b>{!selected.verified && <p>Confirma una entidad o persona receptora antes del despacho.</p>}</section>
        <section><h3>Estado de la operación</h3><ol className="route-timeline">{stages.map((stage, index) => <li className={index <= currentStage ? "done" : ""} key={stage}><i>{index < currentStage ? "✓" : index === currentStage ? "●" : ""}</i><span>{stage}<small>{index === currentStage ? "Estado actual" : index < currentStage ? "Registrado" : "Pendiente"}</small></span></li>)}</ol></section>
      </article>
    </section>
    <p className="demo-disclaimer"><b>Vista demostrativa.</b> Los movimientos anteriores provienen del prototipo de Red Viva y no deben usarse todavía para despachar ayuda real.</p>
  </div></main>;
}
