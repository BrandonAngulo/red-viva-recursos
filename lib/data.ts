export type Incident = {
  id: string;
  title: string;
  place: string;
  municipality: string;
  department: string;
  category: "Necesidad" | "Acopio" | "Atención" | "Vía";
  severity: "Crítica" | "Alta" | "Media" | "Operativa";
  status: "Confirmado" | "Reportado" | "En revisión";
  sources: number;
  updated: string;
  description: string;
  coordinates: [number, number];
};

export const incidents: Incident[] = [
  {
    id: "CR-041",
    title: "Solicitud de agua y alimentos",
    place: "Zona rural del municipio",
    municipality: "San José del Palmar",
    department: "Chocó",
    category: "Necesidad",
    severity: "Crítica",
    status: "En revisión",
    sources: 2,
    updated: "hace 28 min",
    description: "Reporte consolidado para demostración del flujo de contraste y asignación logística.",
    coordinates: [-76.228, 4.896],
  },
  {
    id: "CR-118",
    title: "Centro de recepción de ayudas",
    place: "Coliseo municipal",
    municipality: "Pereira",
    department: "Risaralda",
    category: "Acopio",
    severity: "Operativa",
    status: "Confirmado",
    sources: 3,
    updated: "hace 42 min",
    description: "Punto de demostración con horario, responsable y categorías de insumos aceptados.",
    coordinates: [-75.696, 4.814],
  },
  {
    id: "CR-203",
    title: "Paso restringido por deslizamiento",
    place: "Corredor intermunicipal",
    municipality: "Manizales",
    department: "Caldas",
    category: "Vía",
    severity: "Alta",
    status: "Reportado",
    sources: 1,
    updated: "hace 1 h",
    description: "Registro de demostración para advertir restricciones que afectan rutas de entrega.",
    coordinates: [-75.513, 5.068],
  },
  {
    id: "CR-277",
    title: "Punto de atención comunitaria",
    place: "Unidad deportiva del barrio",
    municipality: "Cali",
    department: "Valle del Cauca",
    category: "Atención",
    severity: "Media",
    status: "Confirmado",
    sources: 4,
    updated: "hace 2 h",
    description: "Punto ilustrativo de orientación, primeros auxilios y referencia a servicios oficiales.",
    coordinates: [-76.532, 3.451],
  },
];

export const resources = [
  { name: "UNGRD", action: "Consultar comunicados y atención oficial", coverage: "Colombia", type: "Oficial", verification: "Verificado", status: "Activo", url: "https://portal.gestiondelriesgo.gov.co/", category: "Información oficial" },
  { name: "Servicio Geológico Colombiano", action: "Consultar sismos y réplicas", coverage: "Colombia", type: "Oficial", verification: "Verificado", status: "Activo", url: "https://www.sgc.gov.co/sismos", category: "Información oficial" },
  { name: "Cruz Roja Colombiana", action: "Conocer canales de atención y ayuda", coverage: "Colombia", type: "Institucional", verification: "Verificado", status: "Activo", url: "https://www.cruzrojacolombiana.org/", category: "Donaciones" },
  { name: "ReliefWeb Colombia", action: "Consultar reportes humanitarios", coverage: "Colombia", type: "Oficial", verification: "Verificado", status: "Activo", url: "https://reliefweb.int/country/col", category: "Reportes" },
  { name: "Colombia Te Busca", action: "Buscar o reportar una persona", coverage: "Colombia", type: "Ciudadano", verification: "En revisión", status: "Activo", url: "https://colombiatebusca.com/", category: "Personas" },
  { name: "PataMap", action: "Buscar o reportar una mascota", coverage: "Cali y alrededores", type: "Ciudadano", verification: "En revisión", status: "Activo", url: "https://emergencia-cali.web.app/", category: "Mascotas" },
  { name: "ConectaColombia 7.4", action: "Explorar iniciativas de ayuda", coverage: "Colombia", type: "Ciudadano", verification: "En revisión", status: "Activo", url: "https://www.conectacolombia.org/?view=mapa", category: "Iniciativas" },
  { name: "Colombia nos necesita", action: "Encontrar acopios, sangre y necesidades", coverage: "Colombia", type: "Ciudadano", verification: "En revisión", status: "Revisar vigencia", url: "https://www.economiaparalapipol.com/interactivos/mapa-ayuda-colombia/", category: "Donaciones" },
];

export const municipalities = [
  { name: "San José del Palmar", department: "Chocó", priority: "Crítica", records: 23, needs: 7, updated: "28 min" },
  { name: "Cali", department: "Valle del Cauca", priority: "Crítica", records: 375, needs: 18, updated: "35 min" },
  { name: "Pereira", department: "Risaralda", priority: "Muy alta", records: 201, needs: 11, updated: "42 min" },
  { name: "Manizales", department: "Caldas", priority: "Muy alta", records: 355, needs: 9, updated: "1 h" },
  { name: "Quibdó", department: "Chocó", priority: "Alta", records: 68, needs: 6, updated: "1 h" },
  { name: "Calima – El Darién", department: "Valle del Cauca", priority: "Alta", records: 12, needs: 4, updated: "2 h" },
];

export const shipments = [
  { id: "ENV-029", route: "Bogotá → Pereira", cargo: "Agua y kits de aseo", status: "En tránsito", updated: "22:14" },
  { id: "ENV-031", route: "Cali → San José del Palmar", cargo: "Alimentos no perecederos", status: "Preparando", updated: "21:48" },
  { id: "ENV-024", route: "Medellín → Manizales", cargo: "Colchonetas y frazadas", status: "Recibido", updated: "20:32" },
];
