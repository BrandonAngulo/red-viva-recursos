"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "../components/ModeSwitch";
import { getSupabaseClient } from "../../lib/supabase";

type Resource = {
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
  last_review: string | null;
  warn: string | null;
  note: string | null;
};

const receiveIntents = new Set(["emergencia", "ayuda-oficial", "reportar-danos", "buscar-persona", "buscar-mascota", "albergue-salud", "cifras"]);
const helpIntents = new Set(["donar", "voluntariado", "acopios", "albergue-salud"]);

function readable(value: string) {
  return value.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default function RecursosPage() {
  return <Suspense fallback={<main className="content-page"><SiteHeader active="recursos" /><div className="page-wrap"><p className="directory-status">Cargando directorio…</p></div></main>}><ResourceDirectory /></Suspense>;
}

function ResourceDirectory() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ResponseMode>(() => searchParams.get("modo") === "ayudar" ? "ayudar" : "necesito");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getSupabaseClient().from("digital_resources")
      .select("id,name,org,action,description,intents,type,coverage,url,status,verification,last_review,warn,note")
      .order("sort_order")
      .then(({ data, error: loadError }) => {
        if (!active) return;
        setResources((data ?? []) as Resource[]);
        setError(Boolean(loadError));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => resources.filter((resource) => {
    const set = mode === "necesito" ? receiveIntents : helpIntents;
    return resource.intents.some((intent) => set.has(intent));
  }), [mode, resources]);

  return <main className="content-page"><SiteHeader active="recursos" /><div className="page-wrap">
    <header className="page-intro resource-intro"><div><p className="eyebrow">Directorio integrado y actualizado</p><h1>{mode === "necesito" ? "Encuentra el canal de ayuda adecuado" : "Ayuda por un canal confiable"}</h1><p>{mode === "necesito" ? "Prioriza atención oficial, búsqueda de personas o mascotas, albergue, salud e información verificada." : "Consulta puntos de acopio, voluntariado y canales de donación. Verifica siempre vigencia, receptor y fuente original."}</p></div><span className="page-meta">Datos en vivo · Red Viva / Supabase</span></header>
    <ModeSwitch mode={mode} onChange={setMode} />
    <div className="directory-status"><b>{loading ? "Cargando recursos…" : `${filtered.length} recursos para esta ruta`}</b><span>Tipo de fuente, verificación y vigencia se evalúan por separado.</span></div>
    {error && <p className="error-banner">No pudimos consultar la base en este momento. Intenta de nuevo en unos minutos.</p>}
    <section className="resource-grid">{filtered.map((resource) => <article className="resource-card" key={resource.id}>
      <div className="tags"><span className="tag">{readable(resource.type)}</span><span className={`tag ${resource.verification === "verificado" ? "verified" : ""}`}>{readable(resource.verification)}</span><span className={`tag status-${resource.status}`}>{readable(resource.status)}</span></div>
      <h2>{resource.name}</h2><p className="resource-org">{resource.org}</p><p>{resource.action}</p>
      <dl><div><dt>Cobertura</dt><dd>{resource.coverage}</dd></div><div><dt>Última revisión</dt><dd>{resource.last_review ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(`${resource.last_review}T12:00:00`)) : "Sin dato"}</dd></div></dl>
      {resource.warn && <p className="resource-warning">{resource.warn}</p>}
      {resource.note && <p className="resource-note">{resource.note}</p>}
      <a className="text-link" href={resource.url} target={resource.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">Abrir recurso original ↗</a>
    </article>)}</section>
  </div></main>;
}
