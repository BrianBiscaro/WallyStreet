import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import { getUser, updateUser } from "../../services/userService";
import "./EditarUsuario.css";

const EditarUsuario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserProfile } = useAuth();
  const targetUserId = location.state?.userId || user?.id;
  const isEditingSelf = Number(targetUserId) === Number(user?.id);

  const [name, setName] = useState(isEditingSelf ? user?.name || "" : "");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(!isEditingSelf);

  useEffect(() => {
    if (isEditingSelf) return;

    let cancelado = false;
    const cargarUsuario = async () => {
      setLoadingUser(true);
      try {
        const data = await getUser(targetUserId);
        if (!cancelado) {
          setName(data?.name || "");
        }
      } catch (error) {
        if (!cancelado) {
          setMessage(
            error?.response?.data?.message ||
            error?.message ||
            "No se pudieron cargar los datos del usuario.",
          );
        }
      } finally {
        if (!cancelado) setLoadingUser(false);
      }
    };

    void cargarUsuario();
    return () => {
      cancelado = true;
    };
  }, [isEditingSelf, targetUserId]);

  const validateForm = () => {
    const nextErrors = {};

    if (!name.trim() || name.trim().length > 30) {
      nextErrors.name = "El nombre debe tener entre 1 y 30 caracteres.";
    }

    if (password) {
      const hasMinLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (
        !hasMinLength ||
        !hasUpper ||
        !hasLower ||
        !hasNumber ||
        !hasSpecial
      ) {
        nextErrors.password =
          "La contraseña debe tener 8 caracteres, mayúsculas, minúsculas, números y un caracter especial.";
      }

      if (password !== repeatPassword) {
        nextErrors.repeatPassword = "Las contraseñas no coinciden.";
      }
    } else if (repeatPassword) {
      nextErrors.repeatPassword = "Debe completar la contraseña y repetirla.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await updateUser(targetUserId, {
        name: name.trim(),
        ...(password ? { password } : {}),
      });

      if (Number(targetUserId) === Number(user?.id)) {
        updateUserProfile({ name: name.trim() });
      }

      setMessage("Usuario actualizado correctamente.");
      setPassword("");
      setRepeatPassword("");
      setTimeout(
        () =>
          navigate(
            user?.id === targetUserId ? "/portfolio" : "/manejo-usuarios",
          ),
        400,
      );
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo actualizar el usuario.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-usuario-page">
      <h2>Editar usuario</h2>
      {loadingUser ? (
        <p>Cargando datos del usuario...</p>
      ) : (
        <form className="editar-usuario-form" onSubmit={handleSubmit}>
          <label>
            Nombre de usuario
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </label>

          <label>
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </label>

          <label>
            Repetir contraseña
            <input
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
            />
            {errors.repeatPassword && (
              <span className="form-error">{errors.repeatPassword}</span>
            )}
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      )}
    </div>
  );
};

export default EditarUsuario;
