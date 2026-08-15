/* =============================================================================
 * Central de Recursos Digitales — Colombia (respuesta al terremoto 7.4)
 * -----------------------------------------------------------------------------
 * FUENTE ÚNICA DE DATOS. Editar aquí (no en la interfaz).
 *
 * Este archivo se carga como <script> normal para que el directorio funcione
 * tanto abierto con doble clic (file://) como desplegado en un servidor.
 * No requiere backend.
 *
 * Reglas del proyecto:
 *  - `confianza` (tipo: oficial / institucional / ciudadano) y `vigencia`
 *    (estado + fechas) se muestran POR SEPARADO. Un recurso puede ser legítimo
 *    y estar desactualizado.
 *  - Para personas, menores y mascotas NO se replican datos personales: se
 *    enlaza siempre al portal original.
 *  - Ningún recurso propuesto por la comunidad se publica automáticamente.
 *    Debe pasar por la bitácora de verificación (ver README).
 * ========================================================================== */

window.CRC_DATA = {
  meta: {
    // Fecha en que Mapa Vivo revisó por última vez TODO el directorio.
    lastReview: "2026-08-14",
    // Correo al que llegan reportes de problemas y propuestas de recursos.
    // CAMBIA esto por el canal real antes de publicar (evita exponer correos personales).
    contactEmail: "contacto@ejemplo.org",
    earthquake: {
      date: "2026-08-10",
      magnitude: "7.4",
      epicenter: "San José del Palmar, Chocó",
    },
    // Fuente de datos EN VIVO. Si está configurada, el sitio lee los recursos
    // desde la tabla `digital_resources` de Supabase (editar una fila = cambio
    // instantáneo). Si falla o está vacía, usa la copia local de abajo.
    // La anonKey es pública por diseño: el acceso lo restringe RLS (solo lectura
    // de filas publicadas).
    supabase: {
      url: "https://afnwhdoqdwopvcsdgswi.supabase.co",
      anonKey: "sb_publishable_1EcdaBYdh9GVIVTdqtWZoQ_anWOqq8a",
    },
  },

  // Líneas oficiales para emergencia inmediata.
  emergencyLines: [
    { label: "Emergencias", number: "123" },
    { label: "Cruz Roja", number: "132" },
    { label: "Defensa Civil", number: "144" },
    { label: "Bomberos", number: "119" },
  ],

  // "¿Qué necesitas hacer?" — cada recurso se etiqueta con una o más intenciones.
  // mode: "ayuda" (necesito ayuda) | "aportar" (quiero ayudar) | "ambos"
  intents: [
    { id: "emergencia",     mode: "ayuda",   icon: "🚨", label: "Emergencia inmediata",           hint: "Llama a las líneas oficiales." },
    { id: "buscar-persona", mode: "ambos",   icon: "🧍", label: "Buscar o reportar una persona",   hint: "Personas desaparecidas o localizadas." },
    { id: "buscar-mascota", mode: "ambos",   icon: "🐾", label: "Buscar o reportar una mascota",   hint: "Animales extraviados o encontrados." },
    { id: "ayuda-oficial",  mode: "ayuda",   icon: "🏛️", label: "Solicitar ayuda oficial",         hint: "Canales de las autoridades." },
    { id: "reportar-danos", mode: "ayuda",   icon: "🏚️", label: "Reportar daños en una vivienda",  hint: "Afectaciones estructurales." },
    { id: "albergue-salud", mode: "ayuda",   icon: "⛑️", label: "Albergue, salud o conectividad",  hint: "Refugio, atención médica, internet." },
    { id: "cifras",         mode: "ayuda",   icon: "📊", label: "Cifras, réplicas y reportes",     hint: "Información oficial y humanitaria." },
    { id: "donar",          mode: "aportar", icon: "💚", label: "Donar dinero o suministros",      hint: "Aportes responsables." },
    { id: "acopios",        mode: "ambos",   icon: "📦", label: "Encontrar centros de acopio",     hint: "Dónde llevar o recibir ayuda." },
    { id: "voluntariado",   mode: "aportar", icon: "🤝", label: "Participar como voluntario",      hint: "Sumarte a una iniciativa." },
  ],

  // Diccionarios para etiquetas legibles y estilos.
  types: {
    oficial:       { label: "Oficial",       help: "Entidad del Estado o cooperación internacional." },
    institucional: { label: "Institucional", help: "Organización formal reconocida (ej. Cruz Roja)." },
    ciudadano:     { label: "Ciudadano",     help: "Iniciativa comunitaria o de la sociedad civil." },
  },
  statuses: {
    activo:          { label: "Activo",          tone: "ok",    help: "El enlace funciona y muestra información." },
    desactualizado:  { label: "Desactualizado",  tone: "warn",  help: "Funciona, pero su corte de datos ya venció." },
    caido:           { label: "Caído",           tone: "bad",   help: "Temporalmente fuera de servicio." },
    cerrado:         { label: "Cerrado",         tone: "muted", help: "Ya no está operando." },
  },
  verifications: {
    "verificado":    { label: "Verificado",    tone: "ok",   help: "Responsable, dominio y propósito comprobados por Mapa Vivo." },
    "en-revision":   { label: "En revisión",   tone: "warn", help: "Legítimo a primera vista; verificación en curso." },
    "por-verificar": { label: "Por verificar", tone: "bad",  help: "Aún sin comprobar responsable ni privacidad." },
  },

  /* ---------------------------------------------------------------------------
   * RECURSOS. Solo enlaces con URL confirmada al 2026-08-14.
   * `sensitive: true`  -> maneja datos personales; se enlaza al original.
   * `warn`             -> advertencia visible (vigencia / cobertura / cautela).
   * ------------------------------------------------------------------------ */
  resources: [
    {
      id: "lineas-emergencia",
      name: "Líneas nacionales de emergencia",
      org: "Sistema Nacional de Gestión del Riesgo",
      action: "Llamar a servicios de emergencia",
      description: "Atención inmediata en todo el país. 123 emergencias · 132 Cruz Roja · 144 Defensa Civil · 119 Bomberos.",
      intents: ["emergencia"],
      type: "oficial",
      coverage: "Colombia",
      url: "tel:123",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Vigente",
      lastReview: "2026-08-14",
    },
    {
      id: "ungrd",
      name: "UNGRD",
      org: "Unidad Nacional para la Gestión del Riesgo de Desastres",
      action: "Consultar comunicados y atención oficial",
      description: "Fuente prioritaria para cifras, decisiones y canales institucionales de la respuesta nacional.",
      intents: ["ayuda-oficial", "cifras", "reportar-danos"],
      type: "oficial",
      coverage: "Colombia",
      url: "https://portal.gestiondelriesgo.gov.co/",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Consulta dinámica",
      lastReview: "2026-08-14",
    },
    {
      id: "sgc-sismos",
      name: "Servicio Geológico Colombiano",
      org: "Servicio Geológico Colombiano (SGC)",
      action: "Consultar sismos y réplicas",
      description: "Fuente primaria oficial de información sísmica: magnitud, epicentro y réplicas en tiempo cercano al real.",
      intents: ["cifras"],
      type: "oficial",
      coverage: "Colombia",
      url: "https://www.sgc.gov.co/sismos",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Consulta dinámica",
      lastReview: "2026-08-14",
    },
    {
      id: "asocapitales",
      name: "Terremoto en Colombia — Asocapitales",
      org: "Asociación Colombiana de Ciudades Capitales",
      action: "Reportar o buscar personas · ver reportes de capitales",
      description: "Herramienta ante el PMU para reportar y buscar personas desaparecidas, con mapa de necesidades y acopios por ciudad capital. Línea de apoyo: 300 761 6647.",
      intents: ["buscar-persona", "cifras", "acopios", "reportar-danos"],
      type: "institucional",
      coverage: "Ciudades capitales",
      url: "https://www.asocapitales.co/terremoto-colombia.html",
      status: "activo",
      verification: "verificado",
      sensitive: true,
      declaredUpdate: "Actualización institucional continua",
      lastReview: "2026-08-14",
      note: "Para personas desaparecidas se abre el portal original; no se replican fichas ni datos personales.",
    },
    {
      id: "cruz-roja",
      name: "Cruz Roja Colombiana",
      org: "Cruz Roja Colombiana",
      action: "Conocer canales de atención y donación",
      description: "Atención humanitaria y donaciones. Usa únicamente las cuentas y canales publicados dentro de su dominio oficial.",
      intents: ["donar", "ayuda-oficial", "albergue-salud"],
      type: "institucional",
      coverage: "Colombia",
      url: "https://www.cruzrojacolombiana.org/",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Según campaña vigente",
      lastReview: "2026-08-14",
      note: "Confirma el canal financiero dentro del dominio oficial antes de transferir.",
    },
    {
      id: "acopios-bogota",
      name: "Centros de acopio — Bogotá",
      org: "Alcaldía Mayor de Bogotá",
      action: "Ubicar puntos de acopio para donar",
      description: "Mapa interactivo oficial (Ideca / Catastro Bogotá) con los puntos donde se reciben donaciones para los damnificados.",
      intents: ["acopios", "donar"],
      type: "oficial",
      coverage: "Bogotá",
      url: "https://bogota.gov.co/mi-ciudad/hacienda/centros-de-acopio-para-donaciones-por-terremoto-en-bogota-2026",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Actualización permanente (Ideca)",
      lastReview: "2026-08-14",
    },
    {
      id: "reliefweb",
      name: "ReliefWeb — Colombia",
      org: "OCHA (Naciones Unidas)",
      action: "Consultar reportes humanitarios",
      description: "Repositorio internacional de informes, evaluaciones y documentos humanitarios sobre la emergencia.",
      intents: ["cifras"],
      type: "oficial",
      coverage: "Colombia e internacional",
      url: "https://reliefweb.int/country/col",
      status: "activo",
      verification: "verificado",
      declaredUpdate: "Según fecha de cada publicación",
      lastReview: "2026-08-14",
    },
    {
      id: "colombia-te-busca",
      name: "Colombia Te Busca",
      org: "Iniciativa ciudadana",
      action: "Buscar o reportar una persona",
      description: "Portal ciudadano para reportar y consultar personas desaparecidas o localizadas, con más de 5.000 registros publicados y un mapa de ayuda.",
      intents: ["buscar-persona"],
      type: "ciudadano",
      coverage: "Colombia",
      url: "https://colombiatebusca.com/",
      status: "activo",
      verification: "en-revision",
      sensitive: true,
      declaredUpdate: "Actualización ciudadana continua",
      lastReview: "2026-08-14",
      note: "No copies fichas ni datos personales: abre el portal original.",
    },
    {
      id: "patamap",
      name: "PataMap — Emergencia Cali",
      org: "Iniciativa ciudadana",
      action: "Buscar o reportar una mascota",
      description: "Directorio especializado en mascotas extraviadas, encontradas o reunidas tras el sismo. Se observaron cientos de registros activos.",
      intents: ["buscar-mascota"],
      type: "ciudadano",
      coverage: "Cali y municipios cercanos",
      url: "https://emergencia-cali.web.app/",
      status: "activo",
      verification: "en-revision",
      sensitive: true,
      declaredUpdate: "Registros recientes observados 14/08/2026",
      lastReview: "2026-08-14",
      note: "No copies teléfonos, direcciones ni fichas; abre el recurso original.",
    },
    {
      id: "ubicalo",
      name: "Ubícalo Colombia",
      org: "Iniciativa ciudadana",
      action: "Buscar o reportar una persona",
      description: "Reportes comunitarios de personas desaparecidas, encontradas o ubicadas en hospitales. Alternativa ciudadana aún sin validación oficial.",
      intents: ["buscar-persona", "albergue-salud"],
      type: "ciudadano",
      coverage: "Colombia",
      url: "https://ubicalo-colombia.web.app/",
      status: "activo",
      verification: "por-verificar",
      sensitive: true,
      declaredUpdate: "Enlace operativo 14/08/2026",
      lastReview: "2026-08-14",
      warn: "Sus registros no han sido verificados oficialmente. Contrasta la información antes de actuar.",
    },
    {
      id: "conecta-colombia",
      name: "ConectaColombia 7.4",
      org: "Iniciativa ciudadana",
      action: "Explorar o crear una iniciativa de ayuda",
      description: "Iniciativas ciudadanas sobre alimentación, salud, vivienda, animales, transporte, donaciones, limpieza y logística.",
      intents: ["donar", "voluntariado", "albergue-salud", "acopios"],
      type: "ciudadano",
      coverage: "Colombia",
      url: "https://www.conectacolombia.org/?view=mapa",
      status: "activo",
      verification: "en-revision",
      declaredUpdate: "Poca oferta activa observada 14/08/2026",
      lastReview: "2026-08-14",
      warn: "El sitio funciona, pero mostraba poca oferta activa al momento de la revisión.",
    },
    {
      id: "colombia-nos-necesita",
      name: "Colombia nos necesita",
      org: "Economía para la Pipol (con datos de Asocapitales)",
      action: "Encontrar acopios, sangre y necesidades",
      description: "Mapa de centros de acopio, donación de sangre y necesidades por ciudad, construido con información de Asocapitales.",
      intents: ["acopios", "donar"],
      type: "ciudadano",
      coverage: "Colombia",
      url: "https://www.economiaparalapipol.com/interactivos/mapa-ayuda-colombia/",
      status: "desactualizado",
      verification: "en-revision",
      declaredUpdate: "Corte declarado 12/08/2026",
      lastReview: "2026-08-14",
      warn: "Verifica la fecha de corte antes de desplazarte o donar: puede no reflejar la situación de hoy.",
    },
    {
      id: "colombia-hub",
      name: "Ayuda Colombia — Colombia Hub",
      org: "Colombia Hub",
      action: "Consultar organizaciones y formas de ayudar",
      description: "Organizaciones, donaciones y centros de acopio, incluidos puntos en el exterior. Útil para la diáspora y donaciones internacionales.",
      intents: ["donar", "voluntariado"],
      type: "ciudadano",
      coverage: "Colombia y exterior",
      url: "https://colombiahub.org/terremoto-colombia-2026-como-ayudar/",
      status: "activo",
      verification: "en-revision",
      declaredUpdate: "Enlace operativo 14/08/2026",
      lastReview: "2026-08-14",
      note: "Confirma cada canal financiero antes de realizar una transferencia.",
    },
    {
      id: "mapa-del-terremoto",
      name: "Mapa del Terremoto",
      org: "Iniciativa ciudadana",
      action: "Ver afectaciones, acopios y necesidades",
      description: "Mapa de afectaciones, puntos de respuesta, acopios y necesidades a partir de fuentes públicas, con cobertura nacional.",
      intents: ["acopios", "albergue-salud", "cifras"],
      type: "ciudadano",
      coverage: "Colombia",
      url: "https://www.mapadelterremoto.com/",
      status: "activo",
      verification: "en-revision",
      declaredUpdate: "Enlace operativo 14/08/2026",
      lastReview: "2026-08-14",
      note: "Se solapa con el Mapa Vivo; conviene articular en lugar de duplicar.",
    },
  ],
};
