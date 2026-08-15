"use client";

export type ResponseMode = "necesito" | "ayudar";

export function ModeSwitch({
  mode,
  onChange,
  compact = false,
}: {
  mode: ResponseMode;
  onChange: (mode: ResponseMode) => void;
  compact?: boolean;
}) {
  return (
    <div className={`mode-switch ${compact ? "compact" : ""}`} role="group" aria-label="Selecciona cómo quieres usar la plataforma">
      <button className={mode === "necesito" ? "active need" : ""} onClick={() => onChange("necesito")} type="button">
        <span aria-hidden="true">01</span>
        <div><b>Necesito ayuda</b>{!compact && <small>Encuentra atención, orientación y rutas disponibles</small>}</div>
      </button>
      <button className={mode === "ayudar" ? "active help" : ""} onClick={() => onChange("ayudar")} type="button">
        <span aria-hidden="true">02</span>
        <div><b>Quiero ayudar</b>{!compact && <small>Consulta necesidades, acopios y movimiento de donaciones</small>}</div>
      </button>
    </div>
  );
}
