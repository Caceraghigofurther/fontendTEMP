import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      navigate(user.is_admin ? "/admin" : "/automacoes");
    }
  }, [navigate, setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://192.168.51.8/api/authenticate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), password: password.trim() }),
      });

      if (!response.ok) throw new Error("Credenciais inválidas");

      const data = await response.json();
      if (!data.success || !data.user) throw new Error("Falha na autenticação");

      let automations = data.user.automations || [];

      //  **Correção para remover colchetes e aspas extras**
      if (typeof automations === "string") {
        try {
          automations = JSON.parse(automations.replace(/'/g, '"')); 
        } catch (error) {
          automations = [];
        }
      }

      // Garante que automations é sempre um array
      automations = Array.isArray(automations) ? automations.map(a => a.replace(/^"|"$/g, '')) : [];

      const userData = {
        login: data.user.login,
        automations: automations,
        ip: data.user.flask_server_ip || null,
        is_admin: data.user.is_admin || false,
      };

      // Armazena no localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      navigate(userData.is_admin ? "/admin" : "/automacoes");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
