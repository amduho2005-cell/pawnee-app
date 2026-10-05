/**
 * paginas/FormularioAvistamiento.tsx
 * ---------------------------------------
 * Crea un avistamiento nuevo. Si se llega desde el detalle de una
 * criatura (?criaturaId=...), ese campo se precarga.
 */

import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { crearAvistamiento } from "../api/avistamientosApi";
import { obtenerCriaturas } from "../api/criaturasApi";
import { AvistamientoFormulario, Criatura } from "../tipos";
import { AvisoError, Cargando, Vacio } from "../componentes/Estados";

const FORM_VACIO: AvistamientoFormulario = {
  criatura: "",
  testigo: "",
  ubicacion: "",
  descripcion: "",
  fecha: "",
};

type CampoObligatorio = "criatura" | "testigo" | "ubicacion" | "fecha";

export function FormularioAvistamiento() {
  const [parametros] = useSearchParams();
  const navigate = useNavigate();
  const criaturaPrecargada = parametros.get("criaturaId");

  const [criaturas, setCriaturas] = useState<Criatura[]>([]);
  const [form, setForm] = useState<AvistamientoFormulario>({
    ...FORM_VACIO,
    criatura: criaturaPrecargada ?? "",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidos, setInvalidos] = useState<CampoObligatorio[]>([]);

  useEffect(() => {
    obtenerCriaturas()
      .then((lista) => {
        setCriaturas(lista);
        if (!form.criatura && lista.length > 0) {
          setForm((actual) => ({ ...actual, criatura: lista[0]._id }));
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar las criaturas."))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cambiar<K extends keyof AvistamientoFormulario>(campo: K, valor: AvistamientoFormulario[K]) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setInvalidos((actual) => actual.filter((c) => c !== campo));
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const faltantes: CampoObligatorio[] = [];
    if (!form.criatura) faltantes.push("criatura");
    if (!form.testigo.trim()) faltantes.push("testigo");
    if (!form.ubicacion.trim()) faltantes.push("ubicacion");
    if (!form.fecha) faltantes.push("fecha");

    if (faltantes.length > 0) {
      setInvalidos(faltantes);
      setError("Criatura, testigo, ubicación y fecha son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      await crearAvistamiento(form);
      navigate("/avistamientos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el avistamiento.");
    } finally {
      setGuardando(false);
    }
  }

  const rutaVolver = criaturaPrecargada ? `/criaturas/${criaturaPrecargada}` : "/avistamientos";
  const hoy = new Date().toISOString().slice(0, 10);

  if (cargando) return <Cargando texto="Preparando el formulario…" />;

  if (!error && criaturas.length === 0) {
    return (
      <Vacio
        texto="Para reportar un avistamiento primero tiene que existir al menos una criatura registrada."
        accion={
          <Link to="/criaturas/nueva" className="btn btn-primary">
            Registrar criatura
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Link to={rutaVolver} className="volver">
        Volver
      </Link>

      <section className="encabezado-pagina">
        <div>
          <h1>Reportar avistamiento</h1>
          <p className="bajada">Cuéntanos qué viste, dónde y cuándo. Los detalles raros también cuentan.</p>
        </div>
      </section>

      <form className="panel-formulario" onSubmit={manejarEnvio} noValidate>
        {error && <AvisoError mensaje={error} />}

        <div className="campo">
          <label htmlFor="criatura" className="form-label">
            Criatura
          </label>
          <select
            id="criatura"
            className="form-select"
            aria-invalid={invalidos.includes("criatura")}
            value={form.criatura}
            onChange={(e) => cambiar("criatura", e.target.value)}
          >
            {criaturas.map((criatura) => (
              <option key={criatura._id} value={criatura._id}>
                {criatura.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="row g-4">
          <div className="col-md-6 campo">
            <label htmlFor="testigo" className="form-label">
              Testigo
            </label>
            <input
              id="testigo"
              type="text"
              className="form-control"
              placeholder="Quién lo vio"
              aria-invalid={invalidos.includes("testigo")}
              value={form.testigo}
              onChange={(e) => cambiar("testigo", e.target.value)}
            />
          </div>

          <div className="col-md-6 campo">
            <label htmlFor="fecha" className="form-label">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              className="form-control"
              max={hoy}
              aria-invalid={invalidos.includes("fecha")}
              value={form.fecha}
              onChange={(e) => cambiar("fecha", e.target.value)}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="ubicacion" className="form-label">
            Ubicación
          </label>
          <input
            id="ubicacion"
            type="text"
            className="form-control"
            placeholder="Ej.: Parque Ramsett, junto al lago"
            aria-invalid={invalidos.includes("ubicacion")}
            value={form.ubicacion}
            onChange={(e) => cambiar("ubicacion", e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="descripcion" className="form-label">
            Lo que pasó <span className="texto-tenue">(opcional)</span>
          </label>
          <textarea
            id="descripcion"
            className="form-control"
            rows={4}
            placeholder="Sonidos, olores, luces, cualquier cosa que el gobierno federal prefiera que no sepamos."
            value={form.descripcion}
            onChange={(e) => cambiar("descripcion", e.target.value)}
          />
        </div>

        <div className="panel-formulario__acciones">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? "Registrando…" : "Registrar avistamiento"}
          </button>
          <Link to={rutaVolver} className="btn btn-contorno">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}