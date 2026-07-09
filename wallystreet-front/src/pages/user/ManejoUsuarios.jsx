/**
 * Un usuario admin tendrá acceso a un listado de todos los usuarios (no admin) con su nombre y su valor de portfolio.
 * El listado permite filtrar por nombre, ordenar por valor total del portfolio y está paginado.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers } from "../../services/userService";
import "./ManejoUsuarios.css";

const ManejoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const usuariosPorPagina = 5;

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        const response = await listUsers();
        setUsuarios(Array.isArray(response?.users) ? response.users : []);
        setError("");
      } catch (error) {
        setError(error?.message || "No se pudieron cargar los usuarios.");
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    void cargarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuarios.filter((usuario) =>
      usuario.name?.toLowerCase().includes(filtroNombre.toLowerCase()),
    );

    filtrados.sort((a, b) => {
      if (criterioOrden === "desc") {
        return (b.portfolio_total || 0) - (a.portfolio_total || 0);
      }
      return (a.portfolio_total || 0) - (b.portfolio_total || 0);
    });

    return filtrados;
  }, [usuarios, filtroNombre, criterioOrden]);

  const mejorUsuario = usuariosFiltrados[0] || null;
  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / usuariosPorPagina),
  );
  const usuariosActuales = usuariosFiltrados.slice(
    (paginaActual - 1) * usuariosPorPagina,
    paginaActual * usuariosPorPagina,
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroNombre, criterioOrden]);

  return (
    <div className="panel-gestion-usuarios">
      <div className="panel-header">
        <div>
          <h2>Gestión de usuarios</h2>
          <p>Administra los usuarios y revisa su portfolio.</p>
        </div>
      </div>
      <div className="filtros">
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filtroNombre}
          onChange={(event) => setFiltroNombre(event.target.value)}
        />
        <button
          type="button"
          onClick={() =>
            setCriterioOrden((value) => (value === "desc" ? "asc" : "desc"))
          }
        >
          Ordenar por portfolio:{" "}
          {criterioOrden === "desc" ? "Mayor a menor" : "Menor a mayor"}
        </button>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Portfolio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosActuales.length > 0 ? (
                usuariosActuales.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className={
                      mejorUsuario?.id === usuario.id ? "mejor-portfolio" : ""
                    }
                  >
                    <td>{usuario.name}</td>
                    <td>${(usuario.portfolio_total || 0).toFixed(2)}</td>
                    <td>
                      <Link to="/usuario/editar" state={{ userId: usuario.id }}>
                        Editar usuario
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="sin-resultados">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="paginacion">
            <button
              type="button"
              onClick={() => setPaginaActual((value) => value - 1)}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPaginaActual((value) => value + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManejoUsuarios;
