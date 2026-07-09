const Asset = ({ asset }) => {
  return (
    <div className="asset-element">
      <h3>ID: {asset.id}</h3>
      <h3>Nombre: {asset.name}</h3>
      <h5>Precio: ${asset.current_price}</h5>
      <h5>Tendencia: {asset.tendencia}</h5>
    </div>
  );
};

export default Asset;
