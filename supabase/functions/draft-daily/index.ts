// Rutina diaria "borradores para revisar" — Central de Recursos Digitales (Colombia).
//
// Qué hace: capta leads recientes desde el feed RSS de Google News (tema:
// terremoto Colombia + ayuda/reconstrucción/UNGRD/...) y los deja, deduplicados
// por URL, en la tabla `review_queue` con estado 'nuevo'. NO publica nada: el
// equipo revisa cada lead en el panel (Bandeja de revisión), lo contrasta con la
// fuente oficial y decide si lo convierte en cronología / apoyo, o lo descarta.
//
// Despliegue: función Edge de Supabase (verify_jwt = false; solo inserta filas
// deduplicadas desde una fuente pública, sin exponer datos).
// Programación: pg_cron 'draft-daily-newsfeed' → 0 11 * * * (11:00 UTC, ~6 a. m.
// Colombia), que hace http_post a esta función.
//
// Para probar manualmente (SQL):
//   select extensions.http_post(
//     'https://<proj>.supabase.co/functions/v1/draft-daily','{}','application/json');

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TOPICS = "terremoto Colombia (ayuda OR reconstrucción OR damnificados OR UNGRD OR donación OR cooperación OR balance)";

function decode(s: string): string {
  return (s || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(TOPICS)}&hl=es-419&gl=CO&ceid=CO:es`;
    const res = await fetch(rss, { headers: { "User-Agent": "central-recursos-colombia/1.0 (+https://recursos.andanzascentrocultural.com)" } });
    const xml = await res.text();
    const parts = xml.split("<item>").slice(1);
    const rows: Array<Record<string, unknown>> = [];
    for (const raw of parts) {
      const block = raw.split("</item>")[0];
      const title = decode((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
      const link = decode((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "");
      const pub = decode((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "");
      const src = decode((block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "");
      if (!link || !title) continue;
      let published_at: string | null = null;
      const d = pub ? new Date(pub) : null;
      if (d && !isNaN(d.getTime())) published_at = d.toISOString();
      rows.push({ source: "google-news", title, org: src || null, url: link, published_at, status: "nuevo" });
    }
    let upserted = 0;
    if (rows.length) {
      const { error, count } = await supabase
        .from("review_queue")
        .upsert(rows, { onConflict: "url", ignoreDuplicates: true, count: "exact" });
      if (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message, seen: rows.length }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
      upserted = count ?? 0;
    }
    return new Response(JSON.stringify({ ok: true, feed: "google-news", seen: rows.length, upserted, at: new Date().toISOString() }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
