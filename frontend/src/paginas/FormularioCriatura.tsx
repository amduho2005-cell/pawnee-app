/**
 * paginas/FormularioCriatura.tsx
 * ----------------------------------
 * Un solo componente para CREAR y EDITAR, según la ruta.
 */

import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { crearCriatura, actualizarCriatura, obtenerCriaturaPorId } from "../api/criaturasApi";
import { CriaturaFormulario, TIPOS_CRIATURA, ESTADOS_INVESTIGACION } from "../tipos";
import { ETIQUETA_ESTADO, ETIQUETA_TIPO } from "../etiquetas";
import { AvisoError, Cargando, MedidorPeligro } from "../componentes/Estados";

const FORM_VACIO: CriaturaFormulario = {
  nombre: "",
  tipo: "mitica",
  habilidades: [],
  nivelPeligro: 5,
  estado: "activa",
};

export function FormularioCriatura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState<CriaturaFormulario>(FORM_VACIO);
  const [habilidadesTexto, setHabilidadesTexto] = useState("");
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombreInvalido, setNombreInvalido] = useState(false);

  useEffect(() => {
    if (!id) return;

    obtenerCriaturaPorId(id)
      .then((criatura) => {
        setForm({
          nombre: criatura.nombre,
          tipo: criatura.tipo,
          habilidades: criatura.habilidades,
          nivelPeligro: criatura.nivelPeligro,
          estado: criatura.estado,
        });
        setHabilidadesTexto(criatura.habilidades.join(", "));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo cargar la criatura."))
      .finally(() => setCargando(false));
  }, [id]);

  const habilidadesVista = habilidadesTexto
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setNombreInvalido(true);
      setError("El nombre es obligatorio.");
      return;
    }

    const datosAEnviar: CriaturaFormulario = { ...form, habilidades: habilidadesVista };

    try {
      setGuardando(true);
      if (esEdicion && id) {
        await actualizarCriatura(id, datosAEnviar);
      } else {
        await crearCriatura(datosAEnviar);
      }
      navigate(esEdicion && id ? `/criaturas/${id}` : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la criatura.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando texto="Cargando el expediente…" />;

  const rutaCancelar = esEdicion && id ? `/criaturas/${id}` : "/";

  return (
    <>
      <Link to={rutaCancelar} className="volver">
        {esEdicion ? "Volver a la criatura" : "Volver a criaturas"}
      </Link>

      <section className="encabezado-pagina">
        <div>
          <h1>{esEdicion ? "Editar criatura" : "Registrar criatura nueva"}</h1>
          <p className="bajada">
            {esEdicion
              ? "Actualiza lo que el departamento sabe de esta criatura."
              : "Abre un expediente nuevo. Solo el nombre es obligatorio."}
          </p>
        </div>
      </section>

      <form className="panel-formulario" onSubmit={manejarEnvio} noValidate>
        {error && <AvisoError mensaje={error} />}

        <div className="campo">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className="form-control"
            placeholder="Ej.: El mapache gigante del lote 48"
            aria-invalid={nombreInvalido}
            value={form.nombre}
            onChange={(e) => {
              setNombreInvalido(false);
              setForm({ ...form, nombre: e.target.value });
            }}
          />
        </div>

        <fieldset className="campo">
          <legend className="form-label">Tipo</legend>
          <div className="opciones">
            {TIPOS_CRIATURA.map((tipo) => (
              <label key={tipo} className="opcion">
                <input
                  type="radio"
                  name="tipo"
                  value={tipo}
                  checked={form.tipo === tipo}
                  onChange={() => setForm({ ...form, tipo })}
                />
                <span>{ETIQUETA_TIPO[tipo]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="campo">
          <label htmlFor="nivelPeligro" className="form-label">
            Nivel de peligro
          </label>
          <div className="control-peligro">
            <input
              id="nivelPeligro"
              type="range"
              className="form-range"
              min={1}
              max={10}
              value={form.nivelPeligro}
              onChange={(e) => setForm({ ...form, nivelPeligro: Number(e.target.value) })}
            />
            <MedidorPeligro nivel={form.nivelPeligro} />
          </div>
        </div>

        <fieldset className="campo">
          <legend className="form-label">Estado de la investigación</legend>
          <div className="opciones">
            {ESTADOS_INVESTIGACION.map((estado) => (
              <label key={estado} className="opcion">
                <input
                  type="radio"
                  name="estado"
                  value={estado}
                  checked={form.estado === estado}
                  onChange={() => setForm({ ...form, estado })}
                />
                <span>{ETIQUETA_ESTADO[estado]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="campo">
          <label htmlFor="habilidades" className="form-label">
            Habilidades
          </label>
          <input
            id="habilidades"
            type="text"
            className="form-control"
            placeholder="Invisibilidad, telepatía, roba waffles"
            aria-describedby="ayuda-habilidades"
            value={habilidadesTexto}
            onChange={(e) => setHabilidadesTexto(e.target.value)}
          />
          <p id="ayuda-habilidades" className="form-text">
            Sepáralas con comas.
          </p>
          {habilidadesVista.length > 0 && (
            <ul className="habilidades" aria-label="Vista previa de habilidades">
              {habilidadesVista.map((h, i) => (
                <li key={`${h}-${i}`}>{h}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel-formulario__acciones">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear criatura"}
          </button>
          <Link to={rutaCancelar} className="btn btn-contorno">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}