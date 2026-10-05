/**
 * componentes/Estados.tsx
 * -----------------------
 * Piezas reutilizables para los 3 estados de cada página
 * (cargando, error, vacío) y los indicadores de peligro y estado.
 */

import type { ReactNode } from "react";
import { ETIQUETA_ESTADO } from "../etiquetas";
import { EstadoInvestigacion } from "../tipos";

export function Cargando({ texto }: { texto: string }) {
  return (
    <div className="cargando" role="status">
      <span className="cargando__haz" aria-hidden="true" />
      {texto}
    </div>
  );
}

export function AvisoError({ mensaje }: { mensaje: string }) {
  return (
    <div className="aviso" role="alert">
      <p className="aviso__titulo">No se pudo completar la acción</p>
      <p className="mb-0">{mensaje}</p>
    </div>
  );
}

export function Vacio({ texto, accion }: { texto: string; accion?: ReactNode }) {
  return (
    <div className="vacio">
      <p>{texto}</p>
      {accion}
    </div>
  );
}

export function MedidorPeligro({ nivel, grande = false }: { nivel: number; grande?: boolean }) {
  const clases = ["medidor", nivel >= 8 ? "medidor--alto" : "", grande ? "medidor--grande" : ""].join(" ");

  return (
    <div className={clases}>
      <span className="medidor__etiqueta" aria-hidden="true">
        Peligro
      </span>
      <div className="medidor__barras" role="img" aria-label={`Nivel de peligro ${nivel} de 10`}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < nivel ? "lleno" : ""} />
        ))}
      </div>
      <span className="medidor__valor" aria-hidden="true">
        {nivel}
      </span>
    </div>
  );
}

export function EtiquetaEstado({ estado }: { estado: EstadoInvestigacion }) {
  return <span className={`estado estado--${estado}`}>{ETIQUETA_ESTADO[estado]}</span>;
}