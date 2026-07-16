import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import "./auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [ver, setVer] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label>Email: </label>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña: </label>
          <input
            type={ver ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setVer(!ver);
            }}
          >
            Ver
          </button>
        </div>

        {error && <p className="error-message">Credenciales Inválidas</p>}

        <button type="submit">{loading ? "Ingresando..." : "Login"}</button>
      </form>
    </div>
  );
};

export default LoginPage;
