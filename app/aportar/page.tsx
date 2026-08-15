"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { ModeSwitch, type ResponseMode } from "../components/ModeSwitch";
import { getSupabaseClient } from "../../lib/supabase";

const options = {
  necesito: [
    ["necesidad", "Necesidad territorial"],
    ["correccion", "Corrección o actualización"],
  ],
  ayudar: [
    ["punto_receptor", "Punto receptor o de acopio"],
    ["recurso", "Recurso o herramienta"],
    ["movimiento", "Movimiento de una donación"],
    ["recepcion", "Confirmación de recepción"],
  ],
} as const;

export default function AportarPage() {
  return <Suspense fallback={<main className="content-page"><SiteHeader /><div className="page-wrap"><p className="directory-status">Preparando formulario…</p></div></main>}><ContributionForm /></Suspense>;
}

function ContributionForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ResponseMode>(() => searchParams.get("modo") === "ayudar" ? "ayudar" : "necesito");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const { error } = await getSupabaseClient().from("contributions").insert({
      intent: mode,
      kind: form.get("kind"),
      territory: form.get("territory"),
      description: form.get("description"),
      source_url: form.get("source") || null,
      organization: form.get("organization") || null,
      contact_email: form.get("contact") || null,
    });
    if (error) {
      setState("error");
      return;
    }
    event.currentTarget.reset();
    setState("success");
  }

  return <main className="content-page"><SiteHeader /><div className="page-wrap">
    <header className="page-intro"><div><p className="eyebrow">Participación responsable</p><h1>{mode === "necesito" ? "Reporta una necesidad" : "Registra una forma de ayudar"}</h1><p>Tu información entra a una cola privada. Nada aparece automáticamente en el mapa: primero se revisan fuente, territorio, vigencia y posibles duplicados.</p></div><span className="page-meta">No publiques datos personales sensibles</span></header>
    <ModeSwitch mode={mode} onChange={(next) => { setMode(next); setState("idle"); }} />
    <div className="form-layout"><form className="form-panel" onSubmit={submit}><div className="form-grid">
      <div className="form-field"><label htmlFor="kind">Tipo de aporte</label><select id="kind" name="kind" key={mode}>{options[mode].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div className="form-field"><label htmlFor="territory">Municipio o cobertura</label><input id="territory" name="territory" required minLength={2} maxLength={140} placeholder="Ej. Pereira, Risaralda" /></div>
      <div className="form-field full"><label htmlFor="description">{mode === "necesito" ? "¿Qué ayuda hace falta?" : "¿Qué ayuda, recurso o movimiento quieres registrar?"}</label><textarea id="description" name="description" required minLength={20} maxLength={2400} placeholder="Describe qué ocurre, desde cuándo, la cantidad o capacidad y quién publicó la información." /></div>
      <div className="form-field full"><label htmlFor="source">Enlace de la fuente original <span>opcional</span></label><input id="source" name="source" type="url" placeholder="https://" /></div>
      <div className="form-field"><label htmlFor="organization">Organización responsable <span>opcional</span></label><input id="organization" name="organization" maxLength={160} placeholder="Entidad, colectivo o iniciativa" /></div>
      <div className="form-field"><label htmlFor="contact">Correo para contraste <span>opcional y privado</span></label><input id="contact" name="contact" type="email" maxLength={180} placeholder="correo@ejemplo.org" /></div>
    </div>
      <p className="connection-note"><b>Revisión antes de publicación.</b> El contacto solo se usa para contrastar el aporte y no se muestra en la consulta pública.</p>
      {state === "success" && <p className="success-banner">Aporte recibido. Ya está en la cola privada de revisión.</p>}
      {state === "error" && <p className="error-banner">No pudimos recibir el aporte. Revisa la conexión e inténtalo nuevamente.</p>}
      <button className="primary-button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Enviando…" : "Enviar a revisión"}</button>
    </form>
    <aside className="review-panel"><p className="eyebrow">Flujo de confianza</p><h2>Qué ocurre después</h2><ol><li><b>Territorio.</b> Ubicamos el aporte en el catálogo municipal.</li><li><b>Duplicados.</b> Comparamos con registros existentes.</li><li><b>Contraste.</b> Revisamos fuente, fecha y responsable.</li><li><b>Decisión.</b> Publicamos, fusionamos o descartamos.</li></ol><div className="privacy-card"><b>Información sensible</b><p>Para personas o mascotas desaparecidas enlazamos al portal especializado; no replicamos fichas, teléfonos ni direcciones.</p></div></aside></div>
  </div></main>;
}
