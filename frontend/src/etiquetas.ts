/**
 * etiquetas.ts
 * ------------
 * Textos legibles para los valores internos del backend, y formato de fechas.
 */

import { EstadoInvestigacion, TipoCriatura } from "./tipos";

export const ETIQUETA_TIPO: Record<TipoCriatura, string> = {
  mitica: "Mítica",
  elemental: "Elemental",
  mecanica: "Mecánica",
  espectral: "Espectral",
};

export const ETIQUETA_ESTADO: Record<EstadoInvestigacion, string> = {
  activa: "Activa",
  en_investigacion: "En investigación",
  descartada: "Descartada",
};

/**
 * Usa solo la parte AAAA-MM-DD para que la fecha no se corra un día
 * por la zona horaria (Mongo guarda en UTC).
 */
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}