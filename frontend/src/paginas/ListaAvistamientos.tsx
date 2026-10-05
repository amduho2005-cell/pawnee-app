/**
 * paginas/ListaAvistamientos.tsx
 * -----------------------------------
 * Lista TODOS los avistamientos como una bitácora. Como el backend usa
 * populate("criatura"), cada avistamiento.criatura ya es el objeto completo
 * (o null si la criatura fue eliminada después).
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eliminarAvistamiento, obtenerAvistamientos } from "../api/avistamientosApi";
import { Avistamiento } from "../tipos";
import { formatearFecha } from "../etiquetas";
import { AvisoError, Cargando, Vacio } from "../componentes/Estados";

export function ListaAvistamientos() {
  const [avistamientos, setAvistamientos] = useState<Avistamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    setError(null);
    obtenerAvistamientos()
      .then(setAvistamientos)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error al cargar los avistamientos."))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function manejarEliminar(id: string) {
    if (!window.confirm("¿Eliminar este avistamiento?")) return;
    try {
      await eliminarAvistamiento(id);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el avistamiento.");
    }
  }

  return (
    <>
      <section className="encabezado-pagina">
        <div>
          <h1>Bitácora de avistamientos</h1>
          <p className="bajada">Cada reporte que ha llegado al departamento, del más reciente al más antiguo.</p>
        </div>
        <Link to="/avistamientos/nuevo" className="btn btn-primary">
          Reportar avistamiento
        </Link>
      </section>

      {cargando && <Cargando texto="Revisando la bitácora…" />}
      {!cargando && error && <AvisoError mensaje={error} />}
      {!cargando && !error && avistamientos.length === 0 && (
        <Vacio
          texto="Todavía no hay avistamientos. Si viste algo que no puedes explicar, repórtalo."
          accion={
            <Link to="/avistamientos/nuevo" className="btn btn-primary">
              Reportar el primero
            </Link>
          }
        />
      )}

      {!cargando && !error && avistamientos.length > 0 && (
        <ol className="bitacora">
          {[...avistamientos]
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map((a) => {
              const fecha = formatearFecha(a.fecha);
              const nombre = a.criatura?.nombre ?? "Criatura eliminada";
              return (
                <li key={a._id} className="bitacora__entrada">
                  <time dateTime={a.fecha.slice(0, 10)} className="bitacora__fecha">
                    {fecha}
                  </time>
                  <div className="bitacora__cuerpo">
                    <h2 className="bitacora__criatura">
                      {a.criatura ? <Link to={`/criaturas/${a.criatura._id}`}>{nombre}</Link> : nombre}
                    </h2>
                    <p className="bitacora__datos">
                      Visto por <strong>{a.testigo}</strong> en <strong>{a.ubicacion}</strong>
                    </p>
                    {a.descripcion && <p className="bitacora__descripcion">{a.descripcion}</p>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-peligro btn-sm bitacora__accion"
                    aria-label={`Eliminar el avistamiento de ${nombre} del ${fecha}`}
                    onClick={() => manejarEliminar(a._id)}
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
        </ol>
      )}
    </>
  );
}