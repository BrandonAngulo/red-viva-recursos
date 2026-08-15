"use client";

import { SiteHeader } from "../components/SiteHeader";

export default function AportarPage() {
  return <main className="content-page"><SiteHeader /><div className="page-wrap">
    <header className="page-intro"><div><p className="eyebrow">Participación responsable</p><h1>Aportar información</h1><p>Comparte una fuente, necesidad, punto de atención o actualización. Nada se publica automáticamente: cada aporte pasa por contraste y revisión.</p></div><span className="page-meta">No incluyas datos personales sensibles</span></header>
    <div className="form-layout"><form className="form-panel" onSubmit={(event) => event.preventDefault()}><div className="form-grid">
      <div className="form-field"><label htmlFor="kind">Tipo de aporte</label><select id="kind"><option>Recurso o herramienta</option><option>Necesidad territorial</option><option>Punto de acopio</option><option>Actualización logística</option><option>Corrección de un registro</option></select></div>
      <div className="form-field"><label htmlFor="territory">Municipio o cobertura</label><input id="territory" placeholder="Ej. Pereira, Risaralda" /></div>
      <div className="form-field full"><label htmlFor="description">¿Qué información quieres aportar?</label><textarea id="description" placeholder="Describe la información, su vigencia y quién la publicó." /></div>
      <div className="form-field full"><label htmlFor="source">Enlace de la fuente original</label><input id="source" type="url" placeholder="https://" /></div>
      <div className="form-field"><label htmlFor="organization">Organización responsable</label><input id="organization" placeholder="Entidad, medio o iniciativa" /></div>
      <div className="form-field"><label htmlFor="contact">Contacto para contraste</label><input id="contact" type="email" placeholder="correo@ejemplo.org" /></div>
    </div><p className="connection-note">La recepción permanecerá desactivada hasta que el nuevo proyecto de datos esté disponible. Puedes revisar desde ahora la estructura y los campos.</p><button className="primary-button" type="submit" disabled>Enviar a revisión</button></form>
    <aside className="review-panel"><h2>Qué ocurre después</h2><ol><li>Comprobamos que la fuente exista y corresponda al territorio.</li><li>Buscamos duplicados y contrastamos fecha, responsable y vigencia.</li><li>Clasificamos confianza y estado operativo por separado.</li><li>Publicamos sin copiar datos personales sensibles.</li></ol></aside></div>
  </div></main>;
}
