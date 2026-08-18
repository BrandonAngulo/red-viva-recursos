/* Orientaciones para actuar — contenido en lenguaje sencillo, enfoque diferencial
   (zona rural/sin señal, comunidades indígenas y afro, personas mayores y con
   discapacidad), verificado con fuentes oficiales al 2026-08-15.
   Migrable a Supabase. Cada orientación puede compartirse/imprimirse. */

window.CRC_ORIENTA = {
  // Clasificación por audiencia para que cada persona vea lo que necesita.
  fases: [
    { id: "ayuda", icon: "🆘", label: "Soy damnificado / Necesito ayuda", intro: "Guías prácticas para proteger tu vida, tu vivienda y acceder a las ayudas del Estado." },
    { id: "aportar", icon: "🤝", label: "Quiero ayudar / Donar", intro: "Información para canalizar tu ayuda de forma segura y efectiva, sin estorbar las labores de rescate." },
  ],
  fasesPorId: {
    "heridos": ["ayuda"],
    "buscar-persona": ["ayuda", "aportar"],
    "vivienda": ["ayuda"],
    "rud": ["ayuda"],
    "fallecimiento": ["ayuda"],
    "apoyo-emocional": ["ayuda", "aportar"],
    "prepararme": ["ayuda", "aportar"],
    "donar": ["aportar"],
    "acopios": ["aportar", "ayuda"],
    "voluntariado": ["aportar"],
  },

  orientaciones: [
    {
      id: "heridos", icon: "🩺", title: "Si hay personas heridas",
      quePasa: "Los servicios médicos pueden colapsar. La atención rápida y segura en los primeros minutos es clave.",
      pasos: [
        "Si alguien está atrapado o gravemente herido, no lo muevas a menos que haya peligro inminente (fuego o derrumbe).",
        "Controla hemorragias presionando la herida con un paño limpio.",
        "Abre paso a los equipos de rescate y no satures las líneas de emergencia con casos menores.",
        "Si la persona no respira, inicia maniobras de RCP solo si sabes cómo hacerlo."
      ],
      acudir: [
        { who: "Emergencia Médica", channel: "123" },
        { who: "Cruz Roja Colombiana", channel: "132" },
        { who: "Defensa Civil", channel: "144" }
      ],
      estafa: "El rescate y los primeros auxilios por organismos de socorro son gratuitos. Denuncia cobros abusivos.",
      linea: "123 – 132 – 144",
      diferencial: {
        rural: "Pide ayuda a promotores de salud locales o busca transporte improvisado seguro.",
        etnico: "Apóyate en los sabedores tradicionales de salud si la evacuación médica tarda.",
        mayores: "Si la persona usa medicamentos vitales, asegúrate de rescatarlos si es seguro hacerlo."
      },
      fuentes: [
        { label: "Primeros Auxilios - Cruz Roja", url: "https://www.cruzrojacolombiana.org/" }
      ]
    },
    {
      id: "buscar-persona", icon: "🧍", title: "Buscar o reportar a una persona",
      quePasa: "Muchas familias quedaron separadas. Hay portales oficiales y ciudadanos para reportar y buscar. No publiques datos personales en redes abiertas.",
      pasos: [
        "Si hay riesgo para la vida, llama al 123.",
        "Reporta y consulta en Colombia Te Busca y en la herramienta de Asocapitales ante el PMU.",
        "Para reunir familias separadas, pide apoyo a la Cruz Roja (Restablecimiento del Contacto Familiar).",
        "Ten a mano una foto reciente y datos básicos: nombre completo, documento y última ubicación conocida.",
      ],
      acudir: [
        { who: "Emergencia", channel: "123" },
        { who: "Asocapitales (PMU)", channel: "300 761 6647" },
        { who: "Niñez — ICBF", channel: "141" },
      ],
      estafa: "Nadie oficial cobra por buscar o 'liberar' a una persona. Desconfía de quien pida dinero o datos bancarios.",
      linea: "Cruz Roja 132 · ICBF 141",
      diferencial: {
        rural: "Sin señal: deja el reporte con el líder comunal, la Junta de Acción Comunal o la emisora local para que lo suban por ti.",
        etnico: "Comunidades indígenas y afro: acude a tu autoridad o guardia; pueden canalizar el reporte y apoyar con la lengua.",
        mayores: "Personas mayores o con discapacidad: designa un familiar de contacto y lleva su documento y medicación.",
      },
      fuentes: [
        { label: "Colombia Te Busca", url: "https://colombiatebusca.com/" },
        { label: "Asocapitales — PMU", url: "https://www.asocapitales.co/terremoto-colombia.html" },
      ],
    },
    {
      id: "vivienda", icon: "🏚️", title: "Mi vivienda quedó afectada",
      quePasa: "Hasta que la revisen, la casa debe considerarse insegura. Las réplicas pueden derribar estructuras ya debilitadas.",
      pasos: [
        "No entres si ves grietas grandes, muros inclinados, techos caídos o hueles a gas.",
        "Si puedes hacerlo con seguridad, corta la energía y el gas.",
        "Reporta el daño a tu Alcaldía y pide la inspección técnica de Bomberos o Cruz Roja.",
        "Toma fotos de los daños y guarda recibos: te servirán para el registro y los trámites.",
      ],
      acudir: [
        { who: "Bomberos", channel: "119" },
        { who: "Reporte de daños (WhatsApp informado por autoridades)", channel: "310 229 9708" },
        { who: "Tu Alcaldía", channel: "Punto de atención municipal" },
      ],
      estafa: "La inspección y el registro son gratis. No pagues a 'gestores' que prometen acelerar subsidios.",
      linea: "Bomberos 119 · Defensa Civil 144",
      diferencial: {
        rural: "Zona rural: si la inspección tarda, documenta con fotos, fechas y testigos de la comunidad.",
        etnico: "Coordina con tu autoridad territorial para un censo colectivo del resguardo o consejo comunitario.",
        mayores: "Pide acompañamiento. No cargues escombros ni subas a los techos.",
      },
      fuentes: [
        { label: "Guía para damnificados — Infobae", url: "https://www.infobae.com/colombia/2026/08/13/guia-para-damnificados-donde-y-como-solicitar-las-ayudas-del-gobierno-tras-el-terremoto/" },
      ],
    },
    {
      id: "rud", icon: "📝", title: "Registrarme como damnificado y pedir ayudas (RUD)",
      quePasa: "El Registro Único de Damnificados (RUD) es el censo con el que las autoridades identifican a las familias afectadas. Estar en el RUD es requisito para acceder a ayudas y subsidios.",
      pasos: [
        "Reporta primero tu vivienda afectada (ver la orientación anterior).",
        "Pide la inspección técnica de Bomberos o Cruz Roja.",
        "Acude al punto de registro de tu Alcaldía o centro cívico con tu documento y el detalle de las pérdidas.",
        "El censo es presencial, casa por casa y con formatos físicos: conserva copia o número de radicado.",
      ],
      acudir: [
        { who: "Alcaldía / Gobernación / UNGRD", channel: "Puntos de registro municipales" },
      ],
      estafa: "El registro es 100% gratis y sin intermediarios. Ningún funcionario real pide dinero, tu clave ni tu tarjeta.",
      linea: "UNGRD y tu Alcaldía",
      diferencial: {
        rural: "Zonas apartadas: los módulos se instalan también en corregimientos; pregunta por la fecha de la brigada.",
        etnico: "Solicita el registro con enfoque diferencial a través de tu autoridad indígena o consejo comunitario.",
        mayores: "Si no puedes desplazarte, pide que la brigada visite tu vivienda.",
      },
      fuentes: [
        { label: "Cómo registrarse — Infobae", url: "https://www.infobae.com/colombia/2026/08/13/guia-para-damnificados-donde-y-como-solicitar-las-ayudas-del-gobierno-tras-el-terremoto/" },
        { label: "Censo en Cali — Alcaldía", url: "https://www.infobae.com/colombia/2026/08/14/alcaldia-de-cali-aclaro-como-se-realizara-el-censo-de-las-familias-afectadas-por-el-terremoto-sera-presencial-casa-por-casa-y-con-formatos-fisicos/" },
      ],
    },
    {
      id: "fallecimiento", icon: "🕯️", title: "Si hubo un fallecimiento",
      quePasa: "La identificación y entrega de personas fallecidas la coordina Medicina Legal. Actúa con calma y por los canales oficiales.",
      pasos: [
        "Reporta el caso en el sitio (123) y no muevas el cuerpo salvo indicación oficial.",
        "Para búsqueda e identificación, acude a Medicina Legal (INMLCF) con documentos y datos de la persona.",
        "Solicita el registro de defunción para los trámites (Registraduría o notaría).",
        "Apóyate en la Cruz Roja para el restablecimiento del contacto familiar.",
      ],
      acudir: [
        { who: "Emergencia", channel: "123" },
        { who: "Medicina Legal (INMLCF)", channel: "Sede regional" },
      ],
      estafa: "No pagues a intermediarios por 'agilizar' entregas o certificados: son trámites oficiales y gratuitos o de costo regulado.",
      linea: "Cruz Roja 132",
      diferencial: {
        rural: "Sin señal, deja aviso con el líder comunal para que escale el caso a las autoridades.",
        etnico: "Respeto a los ritos: consulta con tu autoridad y solicita acompañamiento cultural.",
        mayores: "Pide apoyo emocional y logístico; también existe orientación en duelo (ver la siguiente orientación).",
      },
      fuentes: [
        { label: "Medicina Legal", url: "https://www.medicinalegal.gov.co/" },
      ],
    },
    {
      id: "apoyo-emocional", icon: "🫂", title: "Apoyo emocional y duelo",
      quePasa: "Después de un desastre es normal sentir miedo, insomnio, tristeza o ansiedad. Pedir apoyo es un acto de cuidado, no de debilidad.",
      pasos: [
        "Habla de lo que sientes con alguien de confianza; no te aísles.",
        "Mantén rutinas básicas: agua, comida, descanso, y limita la sobreexposición a noticias e imágenes.",
        "Si hay angustia intensa, pensamientos de hacerte daño o una crisis, busca ayuda de inmediato.",
        "Acompaña a niñas, niños y personas mayores con calma y lenguaje sencillo.",
      ],
      acudir: [
        { who: "Salud mental — MinSalud (24/7)", channel: "106" },
        { who: "Tu EPS o secretaría de salud", channel: "Línea territorial" },
        { who: "En crisis o riesgo vital", channel: "123" },
      ],
      estafa: "Importante: no uses chatbots de inteligencia artificial para una crisis emocional; pueden dar respuestas peligrosas. Busca siempre contacto humano.",
      linea: "Línea 106 (24/7) · en crisis, 123",
      diferencial: {
        rural: "Si no hay señal, apóyate en promotores de salud, la parroquia u organización local.",
        etnico: "Pide apoyo con enfoque cultural y en tu lengua cuando sea posible.",
        mayores: "Ofrece compañía y ayuda práctica; valida sus emociones sin minimizarlas.",
      },
      fuentes: [
        { label: "Salud mental — MinSalud", url: "https://www.minsalud.gov.co/salud/publica/SMental/Paginas/salud-mental.aspx" },
      ],
    },
    {
      id: "prepararme", icon: "🎒", title: "Prepararte para réplicas",
      quePasa: "Saber actuar reduce el riesgo para ti y tu comunidad en eventos adversos.",
      pasos: [
        "Identifica zonas seguras (junto a estructuras firmes, lejos de ventanas) y dos rutas de salida.",
        "Ten listo un kit: agua, linterna, radio a pilas, documentos, medicinas, silbato y efectivo.",
        "Acuerda un punto de encuentro y un contacto fuera de la ciudad.",
        "Durante un sismo: agáchate, cúbrete y agárrate; no uses ascensores.",
      ],
      acudir: [
        { who: "Defensa Civil", channel: "144" },
        { who: "UNGRD — gestión del riesgo", channel: "Portal oficial" },
      ],
      estafa: "Consejo: descarga guías y apps solo de fuentes oficiales (UNGRD, Cruz Roja, Defensa Civil).",
      linea: "Defensa Civil 144 · Bomberos 119",
      diferencial: {
        rural: "Acuerda una señal comunitaria (campana, silbato) y un punto de reunión conocido por todos.",
        etnico: "Integra el plan con tu guardia o autoridad y con la señalización propia del territorio.",
        mayores: "Plan de evacuación accesible, medicación de reserva y una persona asignada de apoyo.",
      },
    },
    {
      id: "donar", icon: "💚", title: "Donar bien (qué sí y qué no)",
      quePasa: "La buena voluntad sin orden puede colapsar la logística. Dona lo que realmente se necesita y por los canales correctos.",
      pasos: [
        "SÍ: agua embotellada, alimentos no perecederos, elementos de aseo, cobijas, colchonetas y toldillos.",
        "NO: perecederos, ropa usada en mal estado, medicamentos vencidos o sin fórmula.",
        "Dinero: únicamente por los canales oficiales publicados en el dominio de cada organización (p. ej. Cruz Roja).",
        "Verifica titular y campaña antes de transferir.",
      ],
      acudir: [
        { who: "Cruz Roja Colombiana", channel: "Portal oficial" },
      ],
      estafa: "Nunca dones a cuentas personales de desconocidos en redes sociales que dicen representar a una familia.",
      fuentes: [
        { label: "Qué donar y qué no — Bogotá", url: "https://bogota.gov.co/mi-ciudad/ambiente/que-donar-y-no-donar-en-bogota-para-damnificados-terremoto-colombia" },
        { label: "Cruz Roja Colombiana", url: "https://www.cruzrojacolombiana.org/" },
      ]
    },
    {
      id: "acopios", icon: "📦", title: "Llevar o recibir ayuda (acopios)",
      quePasa: "Los centros de acopio son los puntos logísticos donde se recibe, clasifica y distribuye la ayuda material.",
      pasos: [
        "Consulta el mapa oficial de acopios de tu ciudad antes de desplazarte.",
        "En Bogotá, la Alcaldía mantiene un mapa interactivo actualizado por Ideca.",
        "Confirma el horario de atención y el tipo exacto de insumos que está recibiendo cada punto.",
      ],
      fuentes: [
        { label: "Acopios de Bogotá", url: "https://bogota.gov.co/mi-ciudad/hacienda/centros-de-acopio-para-donaciones-por-terremoto-en-bogota-2026" },
        { label: "Colombia nos necesita", url: "https://www.economiaparalapipol.com/interactivos/mapa-ayuda-colombia/" },
      ]
    },
    {
      id: "voluntariado", icon: "🤝", title: "Ser voluntario",
      quePasa: "El trabajo en terreno requiere capacitación. Un voluntario sin preparación puede convertirse en una víctima más.",
      pasos: [
        "Los cupos se llenan rápido: confirma disponibilidad antes de ir (varios centros en Bogotá ya alcanzaron su capacidad).",
        "Súmate a iniciativas verificadas y sigue estrictamente las indicaciones de los organismos de socorro.",
        "Si no tienes entrenamiento en rescate, tu mejor aporte es en la clasificación de ayudas en centros de acopio seguros.",
      ],
      fuentes: [
        { label: "ConectaColombia 7.4", url: "https://www.conectacolombia.org/?view=mapa" },
        { label: "Colombia Hub", url: "https://colombiahub.org/terremoto-colombia-2026-como-ayudar/" },
      ]
    },
  ],

  preparacion: {
    kit: [
      "Agua para 3 días (y purificadora o pastillas si es posible)",
      "Alimentos no perecederos y abrelatas",
      "Linterna y pilas de repuesto",
      "Radio a pilas (para oír avisos sin internet)",
      "Botiquín y medicinas personales",
      "Documentos en bolsa sellada (copias y una foto familiar)",
      "Silbato para pedir ayuda",
      "Efectivo en billetes pequeños",
      "Abrigo, cobija y artículos de aseo",
      "Cargador o batería externa",
    ],
    plan: [
      "Definan dos puntos de encuentro: uno cerca y uno fuera del barrio.",
      "Elijan un contacto fuera de la ciudad al que todos llamen o escriban.",
      "Asignen roles: quién ayuda a niñas, niños, personas mayores y mascotas.",
      "Practiquen la ruta de evacuación y la señal de reunión al menos una vez.",
    ],
    formacion: [
      { label: "Cruz Roja Colombiana — formación", url: "https://www.cruzrojacolombiana.org/", desc: "Primeros auxilios y preparación comunitaria." },
      { label: "Defensa Civil Colombiana", url: "https://www.defensacivil.gov.co/", desc: "Voluntariado y capacitación en gestión del riesgo." },
      { label: "UNGRD", url: "https://portal.gestiondelriesgo.gov.co/", desc: "Guías del Sistema Nacional de Gestión del Riesgo." },
      { label: "SENA", url: "https://www.sena.edu.co/", desc: "Cursos gratuitos, algunos en primeros auxilios y atención de emergencias." },
    ],
  },

  // Directorio rápido de líneas (24/7 salvo indicación).
  lineas: [
    { num: "123", label: "Emergencias", note: "Riesgo para la vida" },
    { num: "119", label: "Bomberos", note: "Rescate, incendios, gas" },
    { num: "144", label: "Defensa Civil", note: "Búsqueda y rescate" },
    { num: "132", label: "Cruz Roja", note: "Atención y contacto familiar" },
    { num: "141", label: "ICBF", note: "Niñas, niños y adolescentes" },
    { num: "155", label: "Orientación a mujeres", note: "Violencias y orientación" },
    { num: "106", label: "Salud mental (MinSalud)", note: "Apoyo emocional 24/7" },
    { num: "300 761 6647", label: "Asocapitales (PMU)", note: "Personas desaparecidas" },
    { num: "310 229 9708", label: "Reporte de daños", note: "Vivienda (informado por autoridades)" },
  ],
};
