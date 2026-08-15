/* "Entender qué pasó" — explicación del sismo, contexto histórico y cronología
   día a día. Redactado en lenguaje sencillo y tono neutral, con fuentes.
   Actualizado al 2026-08-15. Migrable a Supabase (tabla timeline / explainer). */

window.CRC_COMPRENDER = {
  actualizado: "2026-08-15",

  resumen: {
    magnitud: "7.4 Mw",
    fecha: "10 de agosto de 2026",
    hora: "7:34 a. m.",
    epicentro: "≈12 km de San José del Palmar, Chocó",
    profundidad: "≈103 km (sismo profundo)",
    nota: "El Servicio Geológico Colombiano lo describió como el mayor temblor registrado en el país en la última década. Por su profundidad se sintió en una amplia zona del centro y occidente.",
    fuente: { label: "Servicio Geológico Colombiano", url: "https://www.sgc.gov.co/sismos" },
  },

  // Explicación: por qué tembló, quién lo mide, qué esperar.
  explicacion: [
    {
      icon: "🧩", title: "¿Qué es una falla?",
      body: "Una falla es una grieta en las rocas del subsuelo donde dos bloques de tierra se mueven uno respecto al otro. La mayoría de los sismos ocurren cuando esos bloques, que estaban trabados, se sueltan de golpe.",
      mas: [
        "Imagina dos ladrillos apretados uno contra otro: la fricción los mantiene quietos mientras algo los empuja. La tensión crece durante años hasta que, de repente, se deslizan. Esa sacudida es el sismo, y las ondas viajan por la tierra hasta la superficie.",
        "Colombia tiene muchas fallas activas (como el sistema de Romeral) porque está donde chocan tres placas. Por eso no se puede predecir el día exacto de un sismo, pero sí se sabe qué zonas son más propensas, y ahí prepararse marca la diferencia.",
      ],
    },
    {
      icon: "🌎", title: "Por qué tembló: la placa de Nazca",
      body: "El occidente de Colombia está donde la placa de Nazca se hunde (subduce) lentamente bajo la placa Suramericana, frente al Pacífico. Ese choque acumula energía que se libera en sismos.",
      mas: [
        "Las placas son enormes piezas del rompecabezas de la corteza terrestre que se mueven muy despacio, unos centímetros al año. Al trabarse y soltarse liberan energía en forma de ondas.",
        "Este sismo ocurrió muy hondo, a unos 103 km, dentro de la placa de Nazca ya hundida (un evento 'intraplaca' profundo) y con movimiento de tipo lateral. Justamente por ser tan profundo se sintió en muchas ciudades al mismo tiempo, aunque causó menos riesgo de tsunami que un sismo superficial en el mar.",
      ],
    },
    {
      icon: "📡", title: "Quién lo mide y cómo seguirlo",
      body: "El Servicio Geológico Colombiano (SGC) es la fuente oficial: monitorea la sismicidad, ubica cada evento y publica magnitud, epicentro y profundidad en tiempo casi real. Es el lugar para confirmar cualquier rumor sobre nuevos sismos.",
      mas: [
        "La magnitud (por ejemplo, 7.4) mide la energía que libera el sismo: cada punto de la escala equivale a unas 30 veces más energía. No es lo mismo que la intensidad, que es qué tan fuerte se siente en cada lugar y depende de la distancia, la profundidad y el tipo de suelo.",
        "Por eso una misma magnitud puede sacudir muy distinto a dos ciudades: el suelo blando amplifica el movimiento.",
      ],
      link: { label: "SGC — Sismos", url: "https://www.sgc.gov.co/sismos" },
    },
    {
      icon: "📉", title: "Las réplicas: qué esperar",
      body: "Después de un sismo grande, las réplicas son normales y pueden seguir por días o semanas, disminuyendo poco a poco. Algunas se sienten fuerte. No anuncian necesariamente uno 'peor', pero sí pueden derribar estructuras ya debilitadas.",
      mas: [
        "Las réplicas ocurren mientras la zona 'se acomoda' tras el movimiento principal. Su número va bajando con el tiempo, aunque de forma irregular.",
        "Un consejo práctico: después de cada réplica fuerte, revisa tu vivienda y aléjate de muros agrietados. Mantente informado por el SGC y ten listos tu plan y tu kit.",
      ],
      link: { label: "Cómo prepararme para las réplicas", url: "#actuar" },
    },
  ],

  // Colombia, país sísmico: antecedentes.
  historiaIntro: "Colombia se asienta sobre el encuentro de tres placas (Nazca, Suramérica y Caribe) y un sistema de fallas activas. Los sismos son parte de su historia; conocerla ayuda a prepararse.",
  historia: [
    { year: "1979", place: "Tumaco, Nariño", mag: "≈7.9", note: "Sismo y tsunami en la costa Pacífica, con cientos de víctimas." },
    { year: "1983", place: "Popayán, Cauca", mag: "5.5", note: "Jueves Santo; graves daños al centro histórico y cerca de 250 fallecidos." },
    { year: "1994", place: "Páez, Cauca", mag: "6.8", note: "Detonó una avalancha del río Páez; más de mil víctimas." },
    { year: "1999", place: "Armenia y el Eje Cafetero", mag: "6.2", note: "El más recordado en décadas: cerca de 1.900 fallecidos y una enorme reconstrucción." },
  ],

  // Cronología día a día.
  cronologia: [
    {
      dia: "Día 1", fecha: "Lun 10 ago",
      titulo: "El sismo y la primera respuesta",
      items: [
        "7:34 a. m.: sismo de magnitud 7.4 con epicentro cerca de San José del Palmar (Chocó).",
        "Derrumbes y afectaciones en Cali, Manizales, Armenia, Pereira y Quibdó; cierre temporal de aeropuertos.",
        "Comienza la búsqueda y rescate; el país activa la respuesta de emergencia.",
      ],
      detalle: "Por su profundidad, el sismo se sintió en gran parte del país. Se reportaron cortes de energía, líneas telefónicas saturadas y evacuaciones preventivas en varias ciudades. Las primeras horas son críticas para el rescate de personas atrapadas.",
      fuentes: [{ label: "CNN", url: "https://cnnespanol.cnn.com/2026/08/10/colombia/terremoto-sismo-san-jose-choco-orix" }],
    },
    {
      dia: "Día 2", fecha: "Mar 11 ago",
      titulo: "Se declara el desastre nacional (Decreto 1171)",
      items: [
        "Continúan los rescates y el balance de víctimas y daños aumenta.",
        "En la noche, el Decreto 1171 declara la situación de desastre de carácter nacional.",
        "Se crea la subcuenta 'Sismo 2026' en el Fondo Nacional de Gestión del Riesgo; la declaratoria cubre más de 13 departamentos, con vigencia inicial de 12 meses.",
      ],
      detalle: "Declarar el desastre de carácter nacional le permite al Estado contratar de urgencia, girar recursos con mayor rapidez y coordinar la respuesta entre la Nación, los departamentos y los municipios. La subcuenta 'Sismo 2026' concentra y hace seguimiento a los dineros destinados a la emergencia.",
      fuentes: [{ label: "El Tiempo — subcuenta 'Sismo 2026'", url: "https://www.eltiempo.com/politica/gobierno/creacion-de-subcuenta-temporal-sismo-2026-y-otras-medidas-que-contempla-el-decreto-mediante-el-cual-se-declaro-el-desastre-nacional-por-el-terremoto-3577801" }],
    },
    {
      dia: "Día 3", fecha: "Mié 12 ago",
      titulo: "Emergencia económica y llegada de ayuda internacional",
      items: [
        "Rescates en edificios colapsados en Cali.",
        "El Gobierno anuncia la emergencia económica para financiar la atención.",
        "Se gestiona un crédito de hasta US$450 millones con el Banco Mundial y se aplazan vencimientos de renta de personas naturales, sin subir impuestos.",
        "Llegan rescatistas internacionales y surge una controversia por el manejo de la ayuda extranjera.",
      ],
      detalle: "La emergencia económica es una figura de la Constitución que permite al Gobierno expedir decretos con fuerza de ley, por un tiempo limitado, para atender la crisis. El Ejecutivo insistió en que no subiría impuestos y en que cada peso girado quedaría sujeto a control. El crédito con el Banco Mundial busca financiar la atención sin frenar otros gastos del Estado.",
      fuentes: [
        { label: "Infobae — emergencia económica", url: "https://www.infobae.com/colombia/2026/08/13/terremoto-en-colombia-que-es-la-emergencia-economica-que-declarara-abelardo-de-la-espriella-y-por-que-cada-peso-girado-quedara-expuesto/" },
        { label: "CNN — rescatistas internacionales", url: "https://cnnespanol.cnn.com/2026/08/12/colombia/terremoto-ayuda-internacional-rescatistas-orix" },
      ],
    },
    {
      dia: "Día 4", fecha: "Jue 13 ago",
      titulo: "Alivios y debate por la ayuda extranjera",
      items: [
        "Se formaliza la emergencia económica y se anuncian alivios para los afectados.",
        "La oposición cuestiona un presunto rechazo de ayudas por razones ideológicas; el Gobierno lo niega y afirma que coordina la asistencia según protocolos internacionales.",
        "El Salvador envía 100 toneladas de ayuda y México despacha otras 58,5 toneladas.",
      ],
      detalle: "El debate giró en torno a si se estaban demorando o descartando ofrecimientos de ayuda. La UNGRD explicó que solo recibiría equipos de búsqueda y rescate que cumplieran los protocolos internacionales, y la Cancillería negó cualquier criterio ideológico. En emergencias, coordinar la ayuda evita duplicar esfuerzos y que lleguen insumos que no se necesitan.",
      fuentes: [
        { label: "France 24 — ¿se limitó la ayuda?", url: "https://www.france24.com/es/am%C3%A9rica-latina/20260815-terremoto-en-colombia-limit%C3%B3-el-nuevo-gobierno-la-ayuda-internacional" },
        { label: "El Tiempo — Gobierno niega rechazo", url: "https://www.eltiempo.com/colombia/otras-ciudades/con-la-llegada-de-rescatistas-extranjeros-gobierno-niega-haber-rechazado-ayudas-por-ideologia-3577996" },
      ],
    },
    {
      dia: "Día 5", fecha: "Vie 14 ago",
      titulo: "Balance y censo de damnificados",
      items: [
        "La UNGRD reporta 288 fallecidos, 4.018 heridos, 202 desaparecidos y 354 rescatados.",
        "80.744 viviendas averiadas y 12.504 destruidas en 448 municipios.",
        "Avanza el censo de damnificados (RUD) y se habilitan más centros de acopio.",
      ],
      detalle: "El censo (RUD) es la puerta para acceder a subsidios y ayudas: se hace casa por casa, es gratuito y no necesita intermediarios. Las cifras siguen cambiando a medida que las brigadas llegan a zonas rurales y apartadas, donde la comunicación es más difícil.",
      fuentes: [{ label: "Infobae — balance UNGRD", url: "https://www.infobae.com/colombia/2026/08/14/temblor-de-74-en-colombia-el-10-de-agosto-se-actualizo-el-numero-de-fallecidos-en-todo-el-pais/" }],
    },
  ],
};
