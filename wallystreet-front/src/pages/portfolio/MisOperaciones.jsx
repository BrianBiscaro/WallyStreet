/**
 * Se mostrará un historial de las operaciones realizadas por el usuario. Dicho historial se podrá filtrar por asset y tipo de operación. La información debe presentarse de manera que sea sencilla y autoexplicativa para el usuario.
 */

import { useMemo, useState } from "react";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";
import "./MisOperaciones.css";

const MisOperaciones = () => {
  const { transactions } = usePortfolioContext();
  const [filtro, setFiltro] = useState("");
  const [tipoOperacion, setTipoOperacion] = useState("all");

  const historialFiltrado = useMemo(() => {
    const filtradas =
      transactions?.filter((act) =>
        act.asset_name?.toLowerCase().includes(filtro.toLowerCase()),
      ) || [];

    if (tipoOperacion === "all") {
      return filtradas;
    }

    return filtradas.filter((act) => act.type === tipoOperacion);
  }, [filtro, tipoOperacion, transactions]);

  return (
    <div className="operaciones-page">
      <div className="operaciones-header">
        <div>
          <h2>Mis operaciones</h2>
          <p>Consulta el historial de tus compras y ventas.</p>
        </div>
        <div className="operaciones-summary">
          {historialFiltrado.length} registro
          {historialFiltrado.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="filtros">
        <label className="filtro-campo">
          <span>Buscar por activo</span>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Ej. Bitcoin"
          />
        </label>

        <label className="filtro-campo">
          <span>Tipo de operación</span>
          <select
            value={tipoOperacion}
            onChange={(e) => setTipoOperacion(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="buy">Compras</option>
            <option value="sell">Ventas</option>
          </select>
        </label>
      </div>

      <div className="historial">
        {historialFiltrado.length === 0 ? (
          <div className="empty-state">
            No hay operaciones que coincidan con los filtros seleccionados.
          </div>
        ) : (
          historialFiltrado.map((act) => (
            <div
              key={act.id}
              className={`transaccion ${
                act.type === "buy" ? "transaccion-buy" : "transaccion-sell"
              }`}
            >
              <div className="transaccion-header">
                <h3>{act.asset_name}</h3>
                <span
                  className={`badge ${act.type === "buy" ? "badge-buy" : "badge-sell"}`}
                >
                  {act.type === "buy" ? "Compra" : "Venta"}
                </span>
              </div>

              <div className="transaccion-grid">
                <div>
                  <span>Cantidad</span>
                  <strong>{Number(act.quantity).toFixed(2)}</strong>
                </div>
                <div>
                  <span>Precio/u</span>
                  <strong>${Number(act.price_per_unit).toFixed(2)}</strong>
                </div>
                <div>
                  <span>Monto total</span>
                  <strong>${Number(act.total_amount).toFixed(2)}</strong>
                </div>
              </div>

              <p className="transaccion-fecha">
                Fecha: {new Date(act.transaction_date).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisOperaciones;
