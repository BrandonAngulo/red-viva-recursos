"use client";

import Link from "next/link";
import { useState } from "react";

type ModuleId = "mapa" | "municipios" | "recursos" | "logistica";

type NavigationModule = {
  id: ModuleId;
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  features: string[];
};

const modules: NavigationModule[] = [
  {
    id: "mapa",
    href: "/",
    label: "Mapa",
    eyebrow: "Panorama territorial",
    title: "Necesidades y puntos de respuesta",
    description: "Cruza reportes territoriales, centros de acopio y apoyos disponibles en una sola vista.",
    metric: "448",
    metricLabel: "municipios en consolidado",
    features: ["Necesito ayuda", "Quiero ayudar", "Filtros por territorio"],
  },
  {
    id: "municipios",
    href: "/municipios",
    label: "Municipios",
    eyebrow: "Lectura territorial",
    title: "Fichas para decidir dónde actuar",
    description: "Consulta prioridad, cobertura, necesidades y última actualización de cada municipio.",
    metric: "6",
    metricLabel: "fichas ampliadas",
    features: ["Nivel de prioridad", "Cobertura disponible", "Datos de contacto"],
  },
  {
    id: "recursos",
    href: "/recursos",
    label: "Recursos",
    eyebrow: "Directorio curado",
    title: "Rutas de ayuda verificables",
    description: "Encuentra servicios y herramientas según lo que necesitas o el apoyo que puedes ofrecer.",
    metric: "14",
    metricLabel: "recursos curados",
    features: ["Atención y orientación", "Donaciones y voluntariado", "Estado de cada servicio"],
  },
  {
    id: "logistica",
    href: "/logistica",
    label: "Logística",
    eyebrow: "Coordinación operativa",
    title: "Seguimiento de donaciones y entregas",
    description: "Revisa qué se prepara, qué está en tránsito y qué ya fue recibido antes de movilizar ayuda.",
    metric: "4",
    metricLabel: "operaciones demostrativas",
    features: ["Preparación", "Tránsito", "Recepción confirmada"],
  },
];

export function SiteHeader({ active = "mapa" }: { active?: string }) {
  const [openModule, setOpenModule] = useState<ModuleId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedModule = modules.find((module) => module.id === openModule);

  function togglePreview(id: ModuleId) {
    setOpenModule((current) => current === id ? null : id);
  }

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenModule(null);
          setMobileOpen(false);
        }
      }}
    >
      <Link className="brand" href="/" onClick={() => setMobileOpen(false)}>
        <span className="brand-mark" aria-hidden="true">●</span>
        <span><b>Central de Respuesta</b><small>Colombia · Red Viva</small></span>
      </Link>

      <nav className="desktop-nav" aria-label="Navegación principal">
        {modules.map((module) => (
          <div
            className={`nav-module ${openModule === module.id ? "expanded" : ""}`}
            key={module.id}
            onMouseEnter={() => setOpenModule(module.id)}
          >
            <Link
              className={active === module.id ? "active" : ""}
              href={module.href}
              onFocus={() => setOpenModule(module.id)}
            >
              {module.label}
            </Link>
            <button
              className="nav-preview-toggle"
              type="button"
              aria-label={`Ver vista previa de ${module.label}`}
              aria-expanded={openModule === module.id}
              onClick={() => togglePreview(module.id)}
            >
              <span aria-hidden="true">⌄</span>
            </button>
          </div>
        ))}
      </nav>

      <div className="header-actions">
        <Link className="management-link" href="/gestion">Gestión</Link>
        <a className="emergency-button" href="tel:123">Emergencia 123</a>
        <Link className="outline-button" href="/aportar">Aportar</Link>
      </div>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((current) => !current)}
      >
        <span>{mobileOpen ? "Cerrar" : "Menú"}</span>
        <i aria-hidden="true">{mobileOpen ? "×" : "☰"}</i>
      </button>

      {selectedModule && (
        <section className={`nav-preview-panel preview-${selectedModule.id}`} aria-label={`Vista previa de ${selectedModule.label}`}>
          <div className="preview-metric">
            <span>{selectedModule.eyebrow}</span>
            <strong>{selectedModule.metric}</strong>
            <small>{selectedModule.metricLabel}</small>
          </div>
          <div className="preview-content">
            <p>{selectedModule.eyebrow}</p>
            <h2>{selectedModule.title}</h2>
            <span>{selectedModule.description}</span>
            <ul>
              {selectedModule.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link href={selectedModule.href}>Entrar a {selectedModule.label.toLowerCase()} <b aria-hidden="true">→</b></Link>
          </div>
        </section>
      )}

      {mobileOpen && (
        <section className="mobile-menu-panel" aria-label="Módulos de la central">
          <div className="mobile-menu-heading">
            <p>Explora la central</p>
            <span>Cada módulo cumple una función distinta dentro de la respuesta.</span>
          </div>
          <div className="mobile-module-grid">
            {modules.map((module) => (
              <Link className={active === module.id ? "active" : ""} href={module.href} key={module.id} onClick={() => setMobileOpen(false)}>
                <small>{module.eyebrow}</small>
                <b>{module.label}</b>
                <span>{module.description}</span>
                <i aria-hidden="true">{module.metric}</i>
              </Link>
            ))}
          </div>
          <div className="mobile-menu-actions">
            <Link href="/aportar" onClick={() => setMobileOpen(false)}>Aportar información</Link>
            <Link href="/gestion" onClick={() => setMobileOpen(false)}>Ingresar a gestión</Link>
          </div>
        </section>
      )}
    </header>
  );
}
