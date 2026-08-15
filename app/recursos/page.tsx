"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "../components/ModeSwitch";
import { getSupabaseClient } from "../../lib/supabase";

type Resource = {
  id: string; name: string; org: string | null; action: string | null;
  description: string | null; intents: string[];
  type: "oficial" | "institucional" | "ciudadano"; coverage: string | null;
  url: string; status: "activo" | "desactualizado" | "caido" | "cerrado";
  verification: "verificado" | "en-revision" | "por-verificar";
  declared_update: string | null; last_review: string | null;
  warn: string | null; note: string | null;
};

type Situation = {
  id: string; title: string; metric: string | null; summary: string | null;
  region: string | null; severity: "critical" | "warning" | "info";
  source_name: string | null; url: string | null; as_of: string | null;
};

const receiveIntents = new Set(["emergencia", "ayuda-oficial", "reportar-danos", "buscar-persona", "buscar-mascota", "albergue-salud", "cifras"]);
const helpIntents = new Set(["donar", "voluntariado", "acopios", "albergue-salud"]);
const intentLabels: Record<string, [string, string]> = {
  emergencia: ["!", "Emergencia inmediata"],
  "buscar-persona": ["P", "Buscar o reportar una persona"],
  "buscar-mascota": ["M", "Buscar o reportar una mascota"],
  "ayuda-oficial": ["A", "Solicitar ayuda oficial"],
  "reportar-danos": ["V", "Reportar daños en una vivienda"],
  "albergue-salud": ["+", "Albergue, salud o conectividad"],
  cifras: ["#", "Cifras, réplicas y reportes"],
  donar: ["♥", "Donar dinero o suministros"],
  acopios: ["□", "Encontrar centros de acopio"],
  voluntariado: ["↗", "Participar como voluntario"],
};

function readable(value: string) {
  return value.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default function RecursosPage() {
  return <Suspense fallback={<main className="content-page dark-directory"><SiteHeader /><div className="page-wrap"><p>Cargando directorio…</p></div></main>}><ResourceDirectory /></Suspense>;
}

function ResourceDirectory() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ResponseMode>(() => searchParams.get("modo") === "ayudar" ? "ayudar" : "necesito");
  const [resources, setResources] = useState<Resource[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [intent, setIntent] = useState(() => {
    const requested = searchParams.get("intent");
    return requested && intentLabels[requested] ? requested : "todos";
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const db = getSupabaseClient();
    Promise.all([
      db.from("digital_resources").select("id,name,org,action,description,intents,type,coverage,url,status,verification,declared_update,last_review,warn,note").eq("is_published", true).order("sort_order"),
      db.from("situation_updates").select("id,title,metric,summary,region,severity,source_name,url,as_of").eq("is_published", true).order("sort_order"),
    ]).then(([resourceResult, situationResult]) => {
      if (!active) return;
      setResources((resourceResult.data ?? []) as Resource[]);
      setSituations((situationResult.data ?? []) as Situation[]);
      setError(Boolean(resourceResult.error || situationResult.error));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const visibleIntents = mode === "necesito" ? [...receiveIntents] : [...helpIntents];
  const filtered = useMemo(() => resources.filter((resource) => {
    const modeSet = mode === "necesito" ? receiveIntents : helpIntents;
    const matchesMode = resource.intents.some((value) => modeSet.has(value));
    const matchesIntent = intent === "todos" || resource.intents.includes(intent);
    const haystack = `${resource.name} ${resource.org ?? ""} ${resource.action ?? ""} ${resource.coverage ?? ""}`.toLowerCase();
    return matchesMode && matchesIntent && haystack.includes(query.toLowerCase());
  }), [intent, mode, query, resources]);

  function changeMode(next: ResponseMode) { setMode(next); setIntent("todos"); }

  return <main className="content-page dark-directory"><SiteHeader active="recursos" />
    <section className="directory-hero">
      <div><p className="eyebrow">Una sola puerta de entrada</p><h1>¿Qué necesitas <em>hacer ahora?</em></h1><p>Recursos digitales revisados para buscar apoyo, donar de forma responsable, encontrar acopios o consultar información oficial. Siempre enlazamos a la fuente original.</p></div>
      <ModeSwitch mode={mode} onChange={changeMode} compact />
      <a className="hero-emergency" href="tel:123"><b>En una emergencia inmediata, llama al 123.</b><span>Este directorio orienta; no reemplaza a las autoridades.</span></a>
    </section>
    <div className="directory-wrap">
      <section className="intent-section"><div><h2>Elige una necesidad</h2><p>La confianza y la vigencia se muestran por separado.</p></div>
        <div className="intent-chips" role="group" aria-label="Filtrar por necesidad"><button className={intent === "todos" ? "active" : ""} onClick={() => setIntent("todos")}><i>✦</i>Todas</button>{visibleIntents.map((value) => <button className={intent === value ? "active" : ""} onClick={() => setIntent(value)} key={value}><i>{intentLabels[value]?.[0]}</i>{intentLabels[value]?.[1]}</button>)}</div>
      </section>
      <section className="resource-controls"><label><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, organización, ciudad…" /></label><div><span>Ruta activa</span><b>{mode === "necesito" ? "Necesito ayuda" : "Quiero ayudar"}</b></div><button onClick={() => { setQuery(""); setIntent("todos"); }}>Limpiar</button></section>
      <div className="directory-status"><b>{loading ? "Cargando recursos…" : `${filtered.length} recursos`}</b><span><i /> Datos en vivo · verificación y estado independientes</span></div>
      {error && <p className="error-banner">No pudimos consultar la base en este momento.</p>}
      <section className="resource-layout"><div className="resource-grid">{filtered.map((resource) => <article className="resource-card" key={resource.id}>
        <div className="tags"><span className="tag">{readable(resource.type)}</span><span className={`tag ${resource.verification === "verificado" ? "verified" : ""}`}>• {readable(resource.verification)}</span><span className={`tag status-${resource.status}`}>• {readable(resource.status)}</span></div>
        <h3>{resource.name}</h3><p className="resource-action">{resource.action}</p><p>{resource.description}</p>
        <dl><div><dt>Cobertura</dt><dd>{resource.coverage}</dd></div><div><dt>Responsable</dt><dd>{resource.org}</dd></div><div><dt>Actualización</dt><dd>{resource.declared_update ?? "Sin dato"}</dd></div><div><dt>Última revisión</dt><dd>{resource.last_review ?? "Sin dato"}</dd></div></dl>
        {resource.warn && <p className="resource-warning">{resource.warn}</p>}{resource.note && <p className="resource-note">{resource.note}</p>}
        <a className="resource-cta" href={resource.url} target={resource.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{resource.url.startsWith("tel:") ? "Llamar ahora" : "Abrir recurso"} <span>↗</span></a>
      </article>)}</div>
      <aside className="situation-rail"><div className="rail-head"><h2>Situación actual</h2><span>• En vivo</span></div>{situations.map((item) => <a href={item.url ?? "#"} target="_blank" rel="noreferrer" className={`situation-card ${item.severity}`} key={item.id}><small>{item.region}</small><h3>{item.title}</h3><b>{item.metric}</b><p>{item.summary}</p><footer><span>{item.source_name}</span><time>{item.as_of}</time></footer></a>)}</aside>
      </section>
    </div>
  </main>;
}
