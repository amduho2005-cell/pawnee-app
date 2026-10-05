/**
 * paginas/DetalleCriatura.tsx
 * -------------------------------
 * Muestra una criatura completa y la lista de sus avistamientos, usando
 * la ruta anidada del backend. También permite eliminar la criatura.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { eliminarCriatura, obtenerCriaturaPorId } from "../api/criaturasApi";
import { obtenerAvistamientosDeCriatura } from "../api/avistamientosApi";
import { Criatura } from "../tipos";
import { ETIQUETA_TIPO, formatearFecha } from "../etiquetas";
import { AvisoError, Cargando, EtiquetaEstado, MedidorPeligro, Vacio } from "../componentes/Estados";

// El backend anida los avistamientos bajo /criaturas/:id/avistamientos
// SIN populate (ver criaturas.controller.ts de la Semana 6) — por eso aquí
// el campo `criatura` es un string, no un objeto.
interface AvistamientoSinPopular {
  _id: string;
  testigo: string;
  ubicacion: string;
  descripcion?: string;
  fecha: string;
}

export function DetalleCriatura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [criatura, setCriatura] = useState<Criatura | null>(null);
  const [avistamientos, setAvistamientos] = useState<AvistamientoSinPopular[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([obtenerCriaturaPorId(id), obtenerAvistamientosDeCriatura(id)])
      .then(([criaturaCargada, avistamientosCargados]) => {
        setCriatura(criaturaCargada);
        setAvistamientos(avistamientosCargados as unknown as AvistamientoSinPopular[]);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error al cargar la criatura."))
      .finally(() => setCargando(false));
  }, [id]);

  async function manejarEliminar() {
    if (!id) return;
    if (!window.confirm("¿Seguro que quieres eliminar esta criatura?")) return;

    try {
      await eliminarCriatura(id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la criatura.");
    }
  }

  const volver = (
    <Link to="/" className="volver">
      Volver a criaturas
    </Link>
  );

  if (cargando) return <Cargando texto="Abriendo el expediente…" />;
  if (error)
    return (
      <>
        {volver}
        <AvisoError mensaje={error} />
      </>
    );
  if (!criatura)
    return (
      <>
        {volver}
        <Vacio texto="No se encontró la criatura. Puede que la hayan eliminado." />
      </>
    );

  return (
    <>
      {volver}

      <section className="ficha">
        <div className="ficha__cabecera">
          <p className="ficha__tipo">{ETIQUETA_TIPO[criatura.tipo]}</p>
          <h1 className="ficha__nombre">{criatura.nombre}</h1>
          <p className="ficha__apertura">Expediente abierto el {formatearFecha(criatura.createdAt)}</p>
        </div>

        <dl className="ficha__datos">
          <div className="ficha__dato ficha__dato--peligro">
            <dt>Nivel de peligro</dt>
            <dd>
              <MedidorPeligro nivel={criatura.nivelPeligro} grande />
            </dd>
          </div>
          <div className="ficha__dato">
            <dt>Estado</dt>
            <dd>
              <EtiquetaEstado estado={criatura.estado} />
            </dd>
          </div>
          <div className="ficha__dato ficha__dato--ancho">
            <dt>Habilidades</dt>
            <dd>
              {criatura.habilidades.length > 0 ? (
                <ul className="habilidades">
                  {criatura.habilidades.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : (
                <span className="texto-tenue">Ninguna registrada todavía.</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="ficha__acciones">
          <Link to={`/criaturas/${criatura._id}/editar`} className="btn btn-contorno">
            Editar criatura
          </Link>
          <button type="button" className="btn btn-peligro" onClick={manejarEliminar}>
            Eliminar criatura
          </button>
        </div>
      </section>

      <section>
        <div className="encabezado-seccion">
          <h2>Avistamientos</h2>
          <Link to={`/avistamientos/nuevo?criaturaId=${criatura._id}`} className="btn btn-primary">
            Reportar un avistamiento
          </Link>
        </div>

        {avistamientos.length === 0 ? (
          <Vacio texto={`Nadie ha reportado haber visto a ${criatura.nombre} todavía.`} />
        ) : (
          <ol className="bitacora">
            {avistamientos.map((a) => (
              <li key={a._id} className="bitacora__entrada">
                <time dateTime={a.fecha.slice(0, 10)} className="bitacora__fecha">
                  {formatearFecha(a.fecha)}
                </time>
                <div className="bitacora__cuerpo">
                  <p className="bitacora__datos">
                    Visto por <strong>{a.testigo}</strong> en <strong>{a.ubicacion}</strong>
                  </p>
                  {a.descripcion && <p className="bitacora__descripcion">{a.descripcion}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}