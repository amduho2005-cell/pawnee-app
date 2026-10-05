/**
 * componentes/Layout.tsx
 * ----------------------
 * Estructura común: barra superior, contenido de cada ruta y pie.
 * También mueve la "linterna": un haz de luz que sigue al mouse y
 * revela la cuadrícula del fondo.
 */

import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

function useLinterna() {
  useEffect(() => {
    const raiz = document.documentElement;
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (menosMovimiento) return;

    let cuadro = 0;
    function mover(evento: PointerEvent) {
      if (evento.pointerType !== "mouse") return; // en táctil el haz queda fijo
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        raiz.style.setProperty("--linterna-x", `${evento.clientX}px`);
        raiz.style.setProperty("--linterna-y", `${evento.clientY}px`);
      });
    }

    window.addEventListener("pointermove", mover);
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(cuadro);
    };
  }, []);
}

export function Layout() {
  useLinterna();

  return (
    <>
      <a href="#contenido" className="saltar">
        Saltar al contenido
      </a>

      <header className="barra">
        <div className="container barra__interior">
          <Link to="/" className="barra__marca">
            <span className="barra__ciudad">Pawnee</span>
            <span className="barra__depto">Parques y Fenómenos Inexplicables</span>
          </Link>

          <nav aria-label="Secciones">
            <ul className="barra__nav">
              <li>
                <NavLink to="/" end>
                  Criaturas
                </NavLink>
              </li>
              <li>
                <NavLink to="/avistamientos" end>
                  Avistamientos
                </NavLink>
              </li>
            </ul>
          </nav>

          <Link to="/avistamientos/nuevo" className="btn btn-primary barra__reportar">
            Reportar avistamiento
          </Link>
        </div>
      </header>

      <main id="contenido" className="container contenido">
        <Outlet />
      </main>

      <footer className="pie">
        <div className="container">
          Ciudad de Pawnee, Indiana. Si lo viste, repórtalo. Si no lo viste, también.
        </div>
      </footer>
    </>
  );
}