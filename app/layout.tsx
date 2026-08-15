import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-display", subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ variable: "--font-editorial", subsets: ["latin"], weight: "400" });

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3001";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  const description = "Mapa territorial, directorio de recursos y coordinación logística para la respuesta humanitaria.";

  return {
    title: "Central de Respuesta Colombia",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "Central de Respuesta Colombia", description, images: [{ url: imageUrl, width: 1536, height: 1024 }] },
    twitter: { card: "summary_large_image", title: "Central de Respuesta Colombia", description, images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${inter.variable} ${manrope.variable} ${dmSerif.variable}`}>{children}</body></html>;
}
