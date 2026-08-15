# Central de Recursos Digitales — Colombia

Directorio verificado que **centraliza los recursos digitales dispersos** tras el
terremoto (7.4, 10 de agosto de 2026). Su propósito: que cualquier persona sepa
**qué herramienta usar en cada situación**, sin tener que rastrear enlaces sueltos.

Empieza por una pregunta práctica — **¿Qué necesitas hacer?** — y separa siempre
dos cosas que suelen confundirse:

- **Confianza** → *qué tipo de recurso es* (Oficial / Institucional / Ciudadano).
- **Vigencia** → *en qué estado está* (Activo / Desactualizado / Caído / Cerrado) y sus fechas.

> Un recurso puede ser legítimo y, aun así, estar desactualizado. Por eso ambas
> señales se muestran por separado.

---

## Cómo se ve y cómo se usa

- Dos entradas destacadas: **Necesito ayuda** y **Quiero ayudar** (+ "Ver todo").
- Chips de necesidad: personas, mascotas, ayuda oficial, daños en vivienda,
  albergue/salud/conectividad, cifras, donar, acopios, voluntariado, emergencia.
- Filtros por **tipo**, **territorio** y **verificación**, más búsqueda de texto.
- Cada tarjeta muestra: acción principal, descripción, cobertura, responsable,
  actualización declarada, última revisión, manejo de datos sensibles y botones
  **Abrir recurso** / **Reportar**.
- El estado de los filtros se guarda en la URL (`#modo=aportar&necesidad=donar`),
  así que cualquier vista es **compartible**.
- Tema claro/oscuro (respeta el sistema, con interruptor manual) y accesibilidad
  (navegación por teclado, foco visible, `aria-live`, movimiento reducido).

---

## Estructura del proyecto

```
central-recursos-colombia/
├─ index.html              Estructura y contenido estático
├─ assets/
│  ├─ css/styles.css       Estilos, tokens de diseño, claro/oscuro
│  └─ js/app.js            Render, filtros, búsqueda, tema, estado en URL
├─ data/
│  └─ resources.js         ← FUENTE ÚNICA DE DATOS (editar aquí)
└─ README.md
```

No hay backend ni dependencias externas. Funciona abriendo `index.html` con doble
clic o servido en cualquier hosting estático.

### Ver en local

```bash
python -m http.server 4599
```

Luego abre `http://localhost:4599/`. (También funciona con doble clic, porque los
datos se cargan como `<script>` y no por `fetch`.)

### Publicar

Sube la carpeta tal cual a **Vercel**, **Netlify** o **GitHub Pages**. Es estático.

---

## Editar los recursos

Todo vive en [`data/resources.js`](data/resources.js) dentro de `window.CRC_DATA`.
Para añadir un recurso, copia una tarjeta existente y ajusta los campos:

| Campo            | Qué es                                                              |
|------------------|--------------------------------------------------------------------|
| `id`             | Identificador único (kebab-case).                                  |
| `name`, `org`    | Nombre visible y organización responsable.                         |
| `action`         | Acción principal ("Buscar persona", "Donar", …).                   |
| `description`    | Qué resuelve, en una frase.                                        |
| `intents`        | Una o más necesidades (ver lista `intents`).                       |
| `type`           | `oficial` · `institucional` · `ciudadano`  → **Confianza**.        |
| `coverage`       | Cobertura territorial.                                              |
| `url`            | Enlace al recurso original (o `tel:` para líneas).                 |
| `status`         | `activo` · `desactualizado` · `caido` · `cerrado`  → **Vigencia**. |
| `verification`   | `verificado` · `en-revision` · `por-verificar`.                    |
| `declaredUpdate` | Fecha/corte que declara el propio recurso.                         |
| `lastReview`     | Cuándo lo revisó por última vez este directorio.                   |
| `sensitive`      | `true` si maneja datos personales (se enlaza al original).         |
| `warn` / `note`  | Advertencia visible / nota informativa.                            |

Antes de publicar, cambia `meta.contactEmail` por el canal real de reportes
(evita exponer correos personales) y actualiza `meta.lastReview`.

---

## Criterio de verificación (bitácora)

Ningún recurso propuesto por la comunidad se publica de forma automática. Pasa por:

1. Revisión del responsable y del dominio.
2. Comprobación de que el enlace funciona.
3. Verificación de cobertura y propósito.
4. Revisión de privacidad y datos sensibles.
5. Detección de duplicados.
6. Validación de cuentas o canales de donación.
7. Decisión humana y registro en bitácora.

Para **personas, menores, mascotas y contactos familiares** el directorio enlaza al
recurso original; **no replica sus bases de datos**.

---

## Inventario incluido (14 recursos, revisados el 2026-08-14)

**Oficiales / institucionales:** Líneas de emergencia (123), UNGRD, Servicio
Geológico Colombiano, Asocapitales (Terremoto en Colombia), Cruz Roja Colombiana,
Centros de acopio de Bogotá, ReliefWeb.

**Ciudadanos:** Colombia Te Busca, PataMap (Emergencia Cali), Ubícalo Colombia,
ConectaColombia 7.4, Colombia nos necesita, Ayuda Colombia (Colombia Hub),
Mapa del Terremoto.

### Pendientes de verificación (aún NO publicados)

Se mantienen fuera del directorio hasta comprobar responsable, dominio y trazabilidad:

- **cuiDAMOS (Pereira / Eje Cafetero)** — mencionado, pero no se confirmó una
  plataforma con dominio propio. Existen canales oficiales de la Alcaldía de
  Pereira y de *La Patria* para acopios en Risaralda que podrían reemplazarlo.
- **OnePay, GoFundMe Colombia** y otras campañas — canales financieros: requieren
  comprobación adicional de titular, beneficiarios, trazabilidad y vigencia antes
  de recibir la etiqueta de recomendados.

---

## Hoja de ruta

- **Fase 1 (esta versión):** enlaces verificados, confianza y vigencia separadas,
  reportes por correo. ✔
- **Fase 2:** monitoreo de enlaces caídos y de fechas vencidas; tablas de soporte
  `digital_resources`, `resource_checks`, `resource_reports`; formulario privado
  de propuestas con bitácora.
- **Integraciones / sincronización** solo cuando exista autorización, API o acuerdo
  con la plataforma responsable (evitar duplicar, p. ej., *Mapa del Terremoto*).

### Integración al Mapa Vivo

Pensado para incorporarse como el módulo **`/recursos`**: además de mostrar
afectaciones, necesidades y ayuda recibida, el Mapa Vivo gana la puerta de entrada
para saber qué herramienta usar en cada situación. Esta versión es portable, así
que puede vivir por separado o trasladarse a ese proyecto sin reescribir los datos.

---

*Este directorio orienta hacia otros recursos; no reemplaza a las autoridades ni
verifica reportes individuales. En una emergencia inmediata, llama al 123.*
