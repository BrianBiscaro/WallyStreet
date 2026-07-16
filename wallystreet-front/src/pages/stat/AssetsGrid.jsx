import Asset from "./Asset.jsx";

const AssetsGrid = ({ assets }) => {
  return (
    <div className="assets-grid">
      {assets.map((asset) => {
        return <Asset asset={asset} key={asset.id} />;
      })}
    </div>
  );
};

export default AssetsGrid;
