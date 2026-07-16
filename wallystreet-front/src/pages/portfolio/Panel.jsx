import { useEffect, useMemo, useState } from "react";
import { useAssetContext } from "../../context/asset/useAssetContext";
import { useAuth } from "../../context/auth/useAuth";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";
import "./Panel.css";

const PanelAssetItem = ({ asset, user, buyAsset, fetchAssetHistory }) => {
  const [cantidad, setCantidad] = useState(0);
  const [cargandoCompra, setCargandoCompra] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);


  const [historialInicializado, setHistorialInicializado] = useState(false);


  const handleVerHistorial = async () => {
    if (!mostrandoHistorial && !historialInicializado) {
      setCargandoHistorial(true);
      const data = await fetchAssetHistory(asset.id, 5);

      const dbHistory = Array.isArray(data)
        ? [...data].sort((a, b) => {
          const dateA = new Date(a.transaction_date.replace(' ', 'T') + 'Z').getTime();
          const dateB = new Date(b.transaction_date.replace(' ', 'T') + 'Z').getTime();
          return dateB - dateA;
        })
        : [];

      const registroInicial = {
        price_per_unit: asset.current_price,
        transaction_date: new Date(),
      };

      setHistorial([registroInicial, ...dbHistory].slice(0, 5));
      setHistorialInicializado(true);
      setCargandoHistorial(false);
    }
    setMostrandoHistorial(!mostrandoHistorial);
  };

  useEffect(() => {
    if (historialInicializado) {
      setHistorial((prevPila) => {
        if (prevPila.length === 0) return prevPila;

        const ultimoPrecioEnPila = Number(prevPila[0].price_per_unit);
        const precioActualContexto = Number(asset.current_price);

        if (precioActualContexto !== ultimoPrecioEnPila) {
          const nuevoRegistroEvent = {
            price_per_unit: asset.current_price,
            transaction_date: new Date(),
          };

          return [nuevoRegistroEvent, ...prevPila].slice(0, 5);
        }

        return prevPila;
      });
    }
  }, [asset.current_price, historialInicializado]);

  const handleComprar = async () => {
    const cant = Number(cantidad);
    const costoTotal = cant * asset.current_price;

    if (cant <= 0) {
      alert("Ingrese una cantidad válida mayor a 0.");
      return;
    }
    if (costoTotal > user.balance) {
      alert("Fondos insuficientes para esta operación.");
      return;
    }

    setCargandoCompra(true);
    const exito = await buyAsset(user.id, asset.id, cant);
    if (exito) {
      alert(`Compraste ${cant} de ${asset.name} exitosamente.`);
      setCantidad(0);
    } else {
      alert("Hubo un error al procesar la compra.");
    }
    setCargandoCompra(false);
  };



  const renderFlecha = () => {
    if (asset.tendencia === "Alta") return <span className="flecha-tendencia tendencia-alta" title="Al alza">▲</span>;
    if (asset.tendencia === "Baja") return <span className="flecha-tendencia tendencia-baja" title="A la baja">▼</span>;
    return <span className="flecha-tendencia tendencia-igual" title="Sin cambios">▬</span>;
  };

  const maxPrice = useMemo(
    () => Math.max(...historial.map((registro) => Number(registro.price_per_unit || 0)), 1),
    [historial]
  );

  const maxCompra = Math.min(
    20,
    Math.max(0, Math.floor((user?.balance || 0) / (asset.current_price || 1)))
  );

  return (
    <div className="panel-card">
      <h4 style={{ display: "flex", alignItems: "center" }}>
        {asset.name} {renderFlecha()}
      </h4>
      <p>Precio Actual: ${Number(asset.current_price || 0).toFixed(2)}</p>

      <div className="panel-actions">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <input
            type="number"
            min="0"
            max={maxCompra}
            value={cantidad}
            onChange={(event) => {
              const val = Number(event.target.value);
              if (val <= maxCompra) setCantidad(val);
            }}
          />
          {cantidad > 0 && (
            <span style={{ fontSize: "0.8rem", color: "#166534" }}>
              Costo: ${(cantidad * asset.current_price).toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleComprar}
          disabled={cargandoCompra || user?.balance === 0 || cantidad <= 0 || cantidad > maxCompra}
        >
          {cargandoCompra ? "Comprando..." : "Comprar"}
        </button>
        <button onClick={handleVerHistorial} disabled={cargandoHistorial}>
          {cargandoHistorial ? "Cargando..." : mostrandoHistorial ? "Ocultar Historial" : "Ver Historial"}
        </button>
      </div>

      {mostrandoHistorial && (
        <div className="history-panel">
          <h5>Últimos 5 valores</h5>
          {historial.length > 0 ? (
            <div className="history-bars">

              {historial.map((registro, index) => {
                const isDateObject = registro.transaction_date instanceof Date;
                const fecha = isDateObject
                  ? registro.transaction_date
                  : new Date(registro.transaction_date.replace(' ', 'T') + 'Z');

                const hoverText = `Fecha: ${fecha.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}\nPrecio: $${Number(registro.price_per_unit || 0).toFixed(2)}`;

                return (
                  <div
                    key={`${registro.transaction_date}-${index}`}
                    className="history-bar-wrapper"
                    title={hoverText}
                  >
                    <div className="history-price">
                      ${Number(registro.price_per_unit || 0).toFixed(2)}
                    </div>
                    <div
                      className="history-bar"
                      style={{
                        height: `${Math.max(18, (Number(registro.price_per_unit || 0) / maxPrice) * 75)}%`,
                        minHeight: "24px",
                      }}
                    />
                    <span className="history-bar-label">
                      {fecha.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No hay historial disponible todavía.</p>
          )}
        </div>
      )}
    </div>
  );
};

const Panel = () => {
  const { assets, loading, fetchAssetHistory } = useAssetContext();
  const { buyAsset } = usePortfolioContext();
  const { user } = useAuth();
  const [filtro, setFiltro] = useState("");

  const assetsFiltrados = useMemo(
    () =>
      assets?.filter((asset) =>
        asset.name?.toLowerCase().includes(filtro.toLowerCase())
      ) || [],
    [assets, filtro]
  );

  return (
    <div className="panel">
      <h2>Panel de Trading</h2>
      <p>Tu saldo disponible: <strong>${user?.balance || 0}</strong></p>
      {loading && (
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", textAlign: "center" }}>
          <strong>Actualizando datos del mercado...</strong>
        </div>
      )}

      <div className="panel-search">
        <input
          type="text"
          placeholder="Buscar asset por nombre..."
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        />
      </div>


      <div className="assets-list" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {assetsFiltrados.length === 0 && !loading ? (
          <p>No se encontraron activos.</p>
        ) : (
          assetsFiltrados.map((asset) => (
            <PanelAssetItem
              key={asset.id}
              asset={asset}
              user={user}
              buyAsset={buyAsset}
              fetchAssetHistory={fetchAssetHistory}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Panel;