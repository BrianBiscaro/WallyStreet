import { useMemo, useState } from "react";
import { useAssetContext } from "../../context/asset/useAssetContext";
import { useAuth } from "../../context/auth/useAuth";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";
import "./Panel.css";

const PanelAssetItem = ({ asset, user, buyAsset, fetchAssetHistory }) => {
  const [cantidad, setCantidad] = useState(0);
  const [cargandoCompra, setCargandoCompra] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [mostrandoHistorial, setMostrandoHistorial] = useState(false);

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

  const handleVerHistorial = async () => {
    if (!mostrandoHistorial) {
      const data = await fetchAssetHistory(asset.id, 5);
      const historyArray = Array.isArray(data) ? data : [];
      console.log("Historial de asset", asset.id, historyArray);
      setHistorial(historyArray);
    }
    setMostrandoHistorial((value) => !value);
  };

  const maxPrice = useMemo(
    () =>
      Math.max(
        ...historial.map((registro) => Number(registro.price_per_unit || 0)),
        1,
      ),
    [historial],
  );

  return (
    <div className="panel-card">
      <h4>{asset.name}</h4>
      <p>Precio Actual: ${asset.current_price}</p>
      <p>Tendencia: {asset.tendencia || "N/A"}</p>

      <div className="panel-actions">
        <input
          type="number"
          min="0"
          value={cantidad}
          onChange={(event) => setCantidad(event.target.value)}
        />
        <button
          onClick={handleComprar}
          disabled={cargandoCompra || user.balance === 0}
        >
          {cargandoCompra ? "Comprando..." : "Comprar"}
        </button>
        <button onClick={handleVerHistorial}>
          {mostrandoHistorial ? "Ocultar Historial" : "Ver Historial"}
        </button>
      </div>

      {mostrandoHistorial && (
        <div className="history-panel">
          <h5>Últimos 5 valores</h5>
          {historial.length > 0 ? (
            <div className="history-bars">
              {historial.map((registro, index) => (
                <div
                  key={`${registro.transaction_date}-${index}`}
                  className="history-bar-wrapper"
                >
                  <div className="history-price">
                    ${Number(registro.price_per_unit || 0).toFixed(2)}
                  </div>
                  <div
                    className="history-bar"
                    style={{
                      height: `${Math.max(18, (Number(registro.price_per_unit || 0) / maxPrice) * 100)}%`,
                      minHeight: "24px",
                    }}
                    title={`Precio: $${registro.price_per_unit}`}
                  />
                  <span className="history-bar-label">
                    {new Date(registro.transaction_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
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
        asset.name?.toLowerCase().includes(filtro.toLowerCase()),
      ) || [],
    [assets, filtro],
  );

  if (loading && (!assets || assets.length === 0)) {
    return <p>Cargando panel de mercado...</p>;
  }

  return (
    <div className="panel">
      <h2>Panel de Trading</h2>
      <p>
        Tu saldo disponible: <strong>${user?.balance || 0}</strong>
      </p>

      <div className="panel-search">
        <input
          type="text"
          placeholder="Buscar asset por nombre..."
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        />
      </div>

      <div className="assets-list">
        {assetsFiltrados.length === 0 ? (
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
