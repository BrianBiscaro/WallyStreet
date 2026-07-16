import { Link } from "react-router-dom";
import "./Layout.css";
import NavBarComponent from "./NavBarComponent";

const HeaderComponent = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img className="logo-img" src="logo.png" alt="Logo" />
          <h2 className="titulo">WallyStreet</h2>
        </Link>
      </div>
      <NavBarComponent />
    </header>
  );
};

export default HeaderComponent;
