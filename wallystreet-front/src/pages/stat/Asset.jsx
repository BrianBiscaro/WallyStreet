const Asset = ({ asset }) => {
  const renderFlecha = () => {
    if (asset.tendencia === "Alta") return <span className="flecha-tendencia tendencia-alta" title="Al alza">▲</span>;
    if (asset.tendencia === "Baja") return <span className="flecha-tendencia tendencia-baja" title="A la baja">▼</span>;
    return <span className="flecha-tendencia tendencia-igual" title="Sin cambios">▬</span>;
  };

  return (
    <div className="asset-element">
      <h3>ID: {asset.id}</h3>
      <h3 style={{ display: "flex", alignItems: "center" }}>
        Nombre: {asset.name} {renderFlecha()}
      </h3>
      <h5>Precio: ${Number(asset.current_price || 0).toFixed(2)}</h5>
    </div>
  );
};

export default Asset;