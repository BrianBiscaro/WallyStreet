import { useState } from "react";
import { useAuth } from "../../context/auth/useAuth";
import usePortfolioContext from "../../context/portfolio/usePortfolioContext";

const Asset = ({ asset }) => {
  const { user } = useAuth();
  const { buyAsset, sellAsset, deleteAsset } = usePortfolioContext();
  const [cantCompra, setCantCompra] = useState(0);
  const [cantVenta, setCantVenta] = useState(0);
  const [message, setMessage] = useState("");

  const maxCompra = Math.min(20, Math.max(0, Math.floor((user?.balance || 0) / (asset.current_price || 1))),
  );

  const comprar = async () => {
    const cantidadAComprar = Number(cantCompra);

    if (!cantidadAComprar || cantidadAComprar <= 0) {
      setMessage("Ingresá una cantidad válida para comprar.");
      return;
    }

    if (cantidadAComprar > maxCompra) {
      setMessage(
        "La cantidad supera el límite permitido o tu saldo disponible.",
      );
      return;
    }

    const data = await buyAsset(user.id, asset.asset_id, cantidadAComprar);
    if (data) {
      setMessage(
        `Compra registrada. Costo total: $${(cantidadAComprar * asset.current_price).toFixed(2)}`,
      );
      setCantCompra(0);
    } else {
      setMessage("No se pudo completar la compra.");
    }
  };

  const vender = async () => {
    const cantidadAVender = Number(cantVenta);

    if (!cantidadAVender || cantidadAVender <= 0) {
      setMessage("Ingresá una cantidad válida para vender.");
      return;
    }

    if (cantidadAVender > asset.quantity) {
      setMessage("No puedes vender más unidades de las que posees.");
      return;
    }

    const data = await sellAsset(user.id, asset.asset_id, cantidadAVender);
    if (data) {
      setMessage(
        `Venta registrada. Retorno estimado: $${(cantidadAVender * asset.current_price).toFixed(2)}`,
      );
      setCantVenta(0);
    } else {
      setMessage("No se pudo completar la venta.");
    }
  };

  const eliminar = async () => {
    const success = await deleteAsset(asset.asset_id);
    setMessage(
      success
        ? "Activo eliminado del portfolio."
        : "No se pudo eliminar el activo.",
    );
  };

  return (
    <div className="asset-card">
      <div className="asset-data">
        <h3>{asset.asset_name}</h3>
        <div className="asset-meta">
          <div>
            <span>Precio actual</span>
            <strong>${Number(asset.current_price || 0).toFixed(2)}</strong>
          </div>
          <div>
            <span>Cantidad</span>
            <strong>{Number(asset.quantity || 0).toFixed(2)}</strong>
          </div>
          <div>
            <span>Valor de tu tenencia</span>
            <strong>${Number(asset.value || 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="asset-controls">
        <div className="control-group">
          <button
            onClick={comprar}
            disabled={user?.balance === 0 || maxCompra <= 0 || cantCompra <= 0 || cantCompra > maxCompra}
          >
            Comprar
          </button>
          <input
            type="number"
            min="0"
            max={maxCompra}
            value={cantCompra}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= maxCompra) setCantCompra(val);
            }}
          />

          {cantCompra > 0 && (
            <span>
              Costo: ${(cantCompra * asset.current_price).toFixed(2)}
            </span>
          )}
        </div>

        <div className="control-group">
          <button
            onClick={vender}
            disabled={asset.quantity <= 0 || cantVenta <= 0 || cantVenta > asset.quantity}
          >
            Vender
          </button>
          <input
            type="number"
            min="0"
            max={asset.quantity}
            value={cantVenta}
            onChange={(event) => {
              const val = Number(event.target.value);
              if (val <= asset.quantity) setCantVenta(val);
            }}
          />
          {/* Mostramos el retorno en tiempo real */}
          {cantVenta > 0 && (
            <span>
              Obtienes: ${(cantVenta * asset.current_price).toFixed(2)}
            </span>
          )}
        </div>

        <button
          className="asset-delete-btn"
          onClick={eliminar}
          disabled={asset.quantity !== 0}
        >
          Eliminar
        </button>
      </div>

      {message && <p className="portfolio-message">{message}</p>}
    </div >
  );
};

export default Asset;
