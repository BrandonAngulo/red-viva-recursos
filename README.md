# Central de Recursos Digitales — Colombia

**En vivo:** https://brandonangulo.github.io/red-viva-recursos/
**Repositorio:** https://github.com/BrandonAngulo/red-viva-recursos
**Base de datos:** Supabase — proyecto *Red Viva Respuesta Colombia* (`afnwhdoqdwopvcsdgswi`)

Directorio verificado que **centraliza los recursos digitales dispersos** tras el
terremoto (7.4, 10 de agosto de 2026). Su propósito: que cualquier persona sepa
**qué herramienta usar en cada situación**, sin rastrear enlaces sueltos.

Empieza por una pregunta práctica — **¿Qué necesitas hacer?** — y separa siempre
dos cosas que suelen confundirse:

- **Confianza** → *qué tipo de recurso es* (Oficial / Institucional / Ciudadano).
- **Vigencia** → *en qué estado está* (Activo / Desactualizado / Caído / Cerrado) y sus fechas.

> Un recurso puede ser legítimo y, aun así, estar desactualizado. Por eso ambas
> señales se muestran por separado.

---

## Cómo está montado

| Capa | Tecnología | Rol |
|------|------------|-----|
| Hosting | **GitHub Pages** (rama `master`) | Sirve el sitio estático. Cada `git push` lo actualiza. |
| Contenido | **Supabase** (tabla `digital_resources`) | Los recursos se leen **en vivo**: editar una fila se refleja al instante, sin re-desplegar. |
| Resiliencia | `data/resources.js` | Copia local incrustada: si Supabase falla, el sitio sigue mostrando los recursos. |

El sitio no tiene servidor propio: el frontend estático llama a la API REST de
Supabase con la clave *publishable* (pública por diseño; el acceso lo restringe
RLS, que solo permite **leer filas publicadas**).

El indicador **“Datos en vivo / Copia local”** (junto al conteo) muestra de dónde
salieron los datos en cada carga.

---

## Actualizar el contenido (lo que harás a diario)

**No necesitas tocar código ni re-desplegar.** Edita la tabla en Supabase:

1. Entra al proyecto *Red Viva Respuesta Colombia* → **Table Editor** → `digital_resources`.
2. Añade, edita o despublica filas (`is_published = false` la oculta sin borrarla).
3. Recarga el sitio: el cambio ya está.

Campos de cada recurso:

| Campo | Qué es |
|-------|--------|
| `id` | Identificador único (kebab-case). |
| `name`, `org` | Nombre visible y organización responsable. |
| `action` | Acción principal ("Buscar persona", "Donar", …). |
| `description` | Qué resuelve, en una frase. |
| `intents` | Necesidades que cubre (arreglo de texto; ver lista en `data/resources.js`). |
| `type` | `oficial` · `institucional` · `ciudadano` → **Confianza**. |
| `coverage` | Cobertura territorial. |
| `url` | Enlace al recurso original (o `tel:` para líneas). |
| `status` | `activo` · `desactualizado` · `caido` · `cerrado` → **Vigencia**. |
| `verification` | `verificado` · `en-revision` · `por-verificar`. |
| `declared_update` | Fecha/corte que declara el propio recurso. |
| `last_review` | Cuándo lo revisó por última vez este directorio. |
| `sensitive` | `true` si maneja datos personales (se enlaza al original). |
| `warn` / `note` | Advertencia visible / nota informativa. |
| `is_published` | `false` lo oculta del sitio. |
| `sort_order` | Orden de aparición (menor primero). |

> Los reportes ciudadanos se guardan en la tabla `resource_reports` (inserción
> anónima permitida; sin lectura pública).

---

## Actualizar el diseño o la lógica (código)

```bash
git add -A
git commit -m "descripción del cambio"
git push
```

GitHub Pages reconstruye el sitio en ~1 minuto.

### Ver en local

```bash
python -m http.server 4599
```

Abre `http://localhost:4599/`.

---

## Estructura

```
red-viva-recursos/
├─ index.html              Estructura y contenido
├─ assets/
│  ├─ css/styles.css       Estilos, tokens, claro/oscuro
│  └─ js/app.js            Render, filtros, búsqueda, tema, lectura en vivo
├─ data/resources.js       Config (intenciones, tipos…) + copia local de respaldo
├─ .nojekyll               Evita el procesamiento Jekyll en Pages
└─ README.md
```

---

## Dominio propio (subdominio de Andanzas Centro Cultural)

Para servirlo en, por ejemplo, `recursos.tudominio.com`:

1. En tu proveedor de DNS, crea un registro **CNAME**
   `recursos` → `brandonangulo.github.io`.
2. En GitHub → repo → **Settings › Pages › Custom domain**, escribe
   `recursos.tudominio.com` y guarda (crea un archivo `CNAME` en el repo).
3. Espera la verificación y activa **Enforce HTTPS**.

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

- **cuiDAMOS (Pereira / Eje Cafetero)** — mencionado, pero no se confirmó una
  plataforma con dominio propio. Hay canales oficiales de la Alcaldía de Pereira
  para acopios en Risaralda que podrían reemplazarlo.
- **OnePay, GoFundMe Colombia** y campañas — canales financieros: requieren
  comprobación adicional de titular, beneficiarios, trazabilidad y vigencia.

---

## Hoja de ruta

- **Fase 1 (hecha):** enlaces verificados, confianza y vigencia separadas,
  contenido en vivo desde Supabase, reportes por correo. ✔
- **Fase 2:** monitoreo automático de enlaces caídos y fechas vencidas; panel de
  administración sobre `digital_resources` / `resource_reports`; formulario de
  propuestas con bitácora en base de datos.
- **Integraciones / sincronización** solo con autorización, API o acuerdo de la
  plataforma responsable (evitar duplicar, p. ej., *Mapa del Terremoto*).

### Integración al Mapa Vivo

Pensado para incorporarse como el módulo **`/recursos`**. Como el contenido ya vive
en Supabase, migrarlo al Mapa Vivo es reapuntar el frontend a la misma tabla.

---

*Este directorio orienta hacia otros recursos; no reemplaza a las autoridades ni
verifica reportes individuales. En una emergencia inmediata, llama al 123.*
