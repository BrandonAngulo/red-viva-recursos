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
        <span className="brand-mark" aria-hidden="true">●</span>
        <span><b>Central de Respuesta</b><small>Colombia · red viva</small></span>
      </Link>
      <nav aria-label="Navegación principal">
        {links.map(([id, href, label]) => <Link key={id} className={active === id ? "active" : ""} href={href}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className="management-link" href="/gestion">Gestión</Link>
        <a className="emergency-button" href="tel:123">Emergencia 123</a>
        <Link className="outline-button" href="/aportar">Aportar</Link>
      </div>
    </header>
  );
}
