import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { supabasePublishableKey, supabaseUrl } from "../../lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Contribution = {
  id: string;
  intent: "necesito" | "ayudar" | "informar";
  kind: string;
  territory: string;
  description: string;
  organization: string | null;
  status: string;
  created_at: string;
};

async function getQueue(): Promise<Contribution[]> {
  const accessSecret = process.env.SUPABASE_MANAGEMENT_SECRET;
  if (!accessSecret) return [];
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/contributions?select=id,intent,kind,territory,description,organization,status,created_at&status=in.(pendiente,en_revision)&order=created_at.desc&limit=100`, {
      cache: "no-store",
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${supabasePublishableKey}`,
        "x-management-secret": accessSecret,
      },
    });
    if (!response.ok) return [];
    return await response.json() as Contribution[];
  } catch {
    return [];
  }
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function ManagementPage() {
  const user = await requireChatGPTUser("/gestion");
  const authorizedManagers = new Set(["gruesobrandon@gmail.com"]);
  if (!authorizedManagers.has(user.email.toLowerCase())) return <main className="access-denied"><section><span className="brand-mark">CR</span><p className="eyebrow">Acceso restringido</p><h1>Tu identidad fue confirmada, pero no tienes un rol de gestión.</h1><p>El mapa y los recursos siguen siendo públicos. Esta cola solo está disponible para integrantes autorizados.</p><Link className="primary-button" href="/">Volver a la central</Link><a className="quiet-link" href={chatGPTSignOutPath("/")}>Cerrar sesión</a></section></main>;

  const queue = await getQueue();
  const needCount = queue.filter((item) => item.intent === "necesito").length;
  const helpCount = queue.filter((item) => item.intent === "ayudar").length;

  return <main className="control-shell">
    <header className="control-topbar"><Link href="/" className="brand"><span className="brand-mark">CR</span><span><b>Central de Respuesta</b><small>Gestión y auditoría</small></span></Link><div className="control-user"><span><b>{user.displayName}</b><small>Sesión autorizada</small></span><a href={chatGPTSignOutPath("/")}>Cerrar sesión</a></div></header>
    <section className="control-heading"><div><p className="eyebrow">Espacio privado</p><h1>Cola de revisión</h1><p>Los aportes permanecen fuera de la consulta pública hasta completar contraste, control de duplicados y decisión editorial.</p></div><Link className="outline-button" href="/">← Volver a la central</Link></section>
    <section className="control-kpis"><div><b>{queue.length}</b><span>Pendientes</span><small>Sin publicación automática</small></div><div><b>{needCount}</b><span>Necesitan ayuda</span><small>Reportes territoriales</small></div><div><b>{helpCount}</b><span>Quieren ayudar</span><small>Recursos y logística</small></div><div><b>RLS</b><span>Base protegida</span><small>Lectura solo por servidor</small></div></section>
    <section className="audit-board"><div className="audit-toolbar"><div><p className="eyebrow">Entrada unificada</p><h2>Aportes recientes</h2></div><span>{queue.length} por revisar</span></div>
      <div className="audit-table"><div className="audit-row header"><span>Aporte</span><span>Ruta</span><span>Territorio</span><span>Descripción</span><span>Estado</span></div>
        {queue.map((item) => <article className="audit-row" key={item.id}><span><b>{item.id.slice(0, 8).toUpperCase()}</b><small>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</small></span><span><em className={item.intent === "necesito" ? "need" : "help"}>{item.intent === "necesito" ? "Necesita ayuda" : "Quiere ayudar"}</em><small>{label(item.kind)}</small></span><span><b>{item.territory}</b><small>{item.organization ?? "Aporte ciudadano"}</small></span><span><p>{item.description}</p></span><span><strong>{label(item.status)}</strong></span></article>)}
        {!queue.length && <div className="empty-queue"><b>No hay aportes pendientes.</b><span>La cola mostrará aquí los envíos realizados desde el formulario público.</span></div>}
      </div>
      <div className="audit-rule"><b>Regla activa</b><span>Ningún aporte se publica desde esta cola sin una decisión humana documentada.</span></div>
    </section>
  </main>;
}
