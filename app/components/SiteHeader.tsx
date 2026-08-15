import Link from "next/link";

export function SiteHeader({ active = "mapa" }: { active?: string }) {
  const links = [
    ["mapa", "/", "Mapa"],
    ["municipios", "/municipios", "Municipios"],
    ["recursos", "/recursos", "Recursos"],
    ["logistica", "/logistica", "Logística"],
  ];

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">CR</span>
        <span><b>Central de Respuesta</b><small>Colombia</small></span>
      </Link>
      <nav aria-label="Navegación principal">
        {links.map(([id, href, label]) => <Link key={id} className={active === id ? "active" : ""} href={href}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className="management-link" href="/gestion">Gestión</Link>
        <Link className="outline-button" href="/aportar">Aportar información</Link>
      </div>
    </header>
  );
}
