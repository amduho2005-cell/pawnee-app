/**
 * paginas/ListaCriaturas.tsx
 * ------------------------------
 * Lista todas las criaturas como expedientes en una rejilla, con filtro
 * por tipo. Maneja los 3 estados: loading, error y empty.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCriaturas } from "../api/criaturasApi";
import { Criatura, TipoCriatura, TIPOS_CRIATURA } from "../tipos";
import { ETIQUETA_TIPO } from "../etiquetas";
import { AvisoError, Cargando, EtiquetaEstado, MedidorPeligro, Vacio } from "../componentes/Estados";

const OPCIONES_FILTRO: { valor: TipoCriatura | ""; texto: string }[] = [
  { valor: "", texto: "Todas" },
  ...TIPOS_CRIATURA.map((tipo) => ({ valor: tipo, texto: ETIQUETA_TIPO[tipo] })),
];

export function ListaCriaturas() {
  const [criaturas, setCriaturas] = useState<Criatura[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoCriatura | "">("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    obtenerCriaturas(filtroTipo || undefined)
      .then(setCriaturas)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error al cargar las criaturas.");
      })
      .finally(() => setCargando(false));
  }, [filtroTipo]);

  return (
    <>
      <section className="encabezado-pagina">
        <div>
          <h1>Criaturas de Pawnee</h1>
          <p className="bajada">
            Todo lo que el departamento tiene registrado. Pasa la linterna por un expediente para revisarlo.
          </p>
        </div>
        <Link to="/criaturas/nueva" className="btn btn-primary">
          Registrar criatura
        </Link>
      </section>

      <div className="filtros" role="group" aria-label="Filtrar por tipo">
        {OPCIONES_FILTRO.map((opcion) => (
          <button
            key={opcion.valor || "todas"}
            type="button"
            className="chip"
            aria-pressed={filtroTipo === opcion.valor}
            onClick={() => setFiltroTipo(opcion.valor)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>

      {cargando && <Cargando texto="Revisando los archivos del departamento…" />}
      {!cargando && error && <AvisoError mensaje={error} />}
      {!cargando && !error && criaturas.length === 0 && (
        <Vacio
          texto={
            filtroTipo
              ? `No hay criaturas de tipo ${ETIQUETA_TIPO[filtroTipo].toLowerCase()} registradas.`
              : "Todavía no hay criaturas registradas. Si algo raro anda suelto por Pawnee, empieza por aquí."
          }
          accion={
            <Link to="/criaturas/nueva" className="btn btn-primary">
              Registrar la primera criatura
            </Link>
          }
        />
      )}

      {!cargando && !error && criaturas.length > 0 && (
        <>
          <p className="conteo">
            {criaturas.length} {criaturas.length === 1 ? "expediente" : "expedientes"}
          </p>
          <ul className="rejilla-criaturas">
            {criaturas.map((criatura) => (
              <li key={criatura._id}>
                <article className="tarjeta-criatura">
                  <p className="tarjeta-criatura__tipo">{ETIQUETA_TIPO[criatura.tipo]}</p>
                  <h2 className="tarjeta-criatura__nombre">
                    {/* stretched-link (Bootstrap) hace clicable toda la tarjeta */}
                    <Link to={`/criaturas/${criatura._id}`} className="stretched-link">
                      {criatura.nombre}
                    </Link>
                  </h2>
                  <MedidorPeligro nivel={criatura.nivelPeligro} />
                  <div className="tarjeta-criatura__pie">
                    <EtiquetaEstado estado={criatura.estado} />
                    <Link to={`/criaturas/${criatura._id}/editar`} className="enlace-sobre">
                      Editar
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}