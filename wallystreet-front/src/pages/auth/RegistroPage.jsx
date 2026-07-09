/**
 * Crear un archivo dentro de la carpeta pages/registro llamado RegistroPage. Dicha página debe contener un formulario con:
 * ● Email (formato email y único)
 * ● Nombre del usuario (será público)
 * ● Password (type password)
 * El usuario podrá registrarse para luego iniciar la sesión en el sitio web. Tenga en cuenta que deberá validar que:
 * ● El email debe tener un formato válido y, se debe verificar que no esté en uso.
 * ● El nombre de usuario no puede ser vacío y debe tener como máximo 30 caracteres.
 * ● La password tenga por lo menos 8 caracteres y que tenga mayúsculas, minúsculas, números y caracteres especiales.
 * Estas validaciones son independientes de las que realice el backend. En caso de error se debe informar cual o cuales validaciones fallaron para que el usuario pueda solucionarlo (si está dentro de sus posibilidades, por ejemplo, formato de la contraseña, el email ya existe, etc).
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import "./auth.css";

const RegistroPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [message, setMessage] = useState("");

  const [errorName, setErrorName] = useState(null);
  const [errorEmail, setErrorEmail] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);

  const { error, register, loading } = useAuth();
  const navigate = useNavigate();

  function validatePassword() {
    const ochoCaracteres = password.length >= 8;
    if (!ochoCaracteres) {
      setErrorPassword("La contraseña debe tener 8 caracteres como mínimo");
      return false;
    }
    const mayus = /(?:[A-Z])/.test(password);
    if (!mayus) {
      setErrorPassword("La contraseña debe contener mayúsculas");
      return false;
    }
    const minus = /(?:[a-z])/.test(password);
    if (!minus) {
      setErrorPassword("La contraseña debe contener minúsculas");
      return false;
    }
    const numeros = /(?:\d)/.test(password);
    if (!numeros) {
      setErrorPassword("La contraseña debe contener números");
      return false;
    }
    const especial = /[^A-Za-z0-9]/.test(password);
    if (!especial) {
      setErrorPassword("La contraseña debe contener un caracter especial");
      return false;
    }
    setErrorPassword(null);
    return true;
  }

  function validateEmail() {
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!formatoValido) {
      setErrorEmail("El email no tiene un formato válido");
      return false;
    }
    setErrorEmail(null);
    return true;
  }

  function validateName() {
    const noVacio = name.length > 0;
    const menos30Char = name.length <= 30;
    if (!noVacio || !menos30Char) {
      setErrorName("El nombre debe tener entre 1 y 30 caracteres");
      return false;
    } else {
      setErrorName(null);
      return true;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (validateEmail() && validatePassword() && validateName()) {
      const exito = await register({ email, name, password });
      if (exito) {
        setMessage("Registro correcto. Ahora podés iniciar sesión.");
        navigate("/login");
      }
    }
  };
  return (
    <div className="registro-page">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} className="registro-form">
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          {errorEmail && <p>{errorEmail}</p>}
        </label>

        <label>
          Nombre de Usuario:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
          />
          {errorName && <p>{errorName}</p>}
        </label>

        <label>
          Password:
          <input
            type={ver ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
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
          {errorPassword && <p>{errorPassword}</p>}
        </label>

        <button type="submit">Enviar</button>
        {loading && <p>Cargando...</p>}
        {error && <p className="error-message">{error.message}</p>}
        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
};

export default RegistroPage;
