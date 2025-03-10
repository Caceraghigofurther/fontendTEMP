import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import AdminMenu from "./AdminMenu";
import "./adminDashboard.css";

function AdminDashboard() {
  // Estados para os dados
  const [users, setUsers] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [errors, setErrors] = useState([]);
  const [notification, setNotification] = useState(null);

  // Busca de usuários
  useEffect(() => {
    fetch("http://192.168.51.8/users/")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Erro ao carregar usuários", err));
  }, []);

  // Busca de automações
  useEffect(() => {
    fetch("http://192.168.51.8/github-automations/")
      .then((res) => res.json())
      .then((data) => setAutomations(data))
      .catch((err) => console.error("Erro ao carregar automações", err));
  }, []);

  // Busca de execuções (erros)
  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const res = await fetch("http://192.168.51.8/execucoes/");
        if (!res.ok) throw new Error("Erro ao carregar execuções");
        const data = await res.json();
        setErrors(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchErrors();
    const interval = setInterval(fetchErrors, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cálculo da assertividade: considera apenas itens com resultado "Sucesso" ou "Erro"
  const total = errors.filter(
    (err) => err.resultado === "Sucesso" || err.resultado === "Erro"
  ).length;
  const success = errors.filter((err) => err.resultado === "Sucesso").length;
  const assertividade =
    total > 0 ? ((success / total) * 100).toFixed(2) : "N/A";

  const pieData = [
    { name: "Sucesso", value: success },
    { name: "Erro", value: total - success },
  ];
  const COLORS = ["#28a745", "#dc3545"];

  // Filtra apenas as execuções cujo resultado seja diferente de "Sucesso",
  // ordena por data (mais recentes primeiro) e pega os 5 primeiros
  const sortedErrors = [...errors]
    .filter((err) => err.resultado === "Erro")
    .sort((a, b) => new Date(b.data_execucao) - new Date(a.data_execucao));
  const errorList = sortedErrors.slice(0, 5);

  return (
    <div>
      <AdminMenu />
      <div className="admin-container">
        <h2 className="admin-title">Painel Administrativo</h2>
        {notification && <div className="notification">{notification}</div>}
        <div className="columns-container">
          {/* Coluna Esquerda: Usuários e Automações empilhados */}
          <div className="left-column">
            <div className="card-wrapper">
              <div className="admin-card">
                <h3>👥 Quantidade de Usuários</h3>
                <h1 className="text-card">{users.length}</h1>

                <div className="card-button">
                <Link to="/admin/usuarios" className="admin-btn">
                  Pessoas
                </Link>
              </div>
              </div>
              
            </div>
            <div className="card-wrapper">
              <div className="admin-card">
                <h3>🤖 Quantidade de Automações</h3>
                <h1 className="text-card">{automations.length}</h1>
                <div className="card-button">
                <Link to="/admin/automacoes" className="admin-btn">
                  Automações
                </Link>
              </div>
              </div>
              
            </div>
          </div>
          {/* Coluna Direita: Assertividade e Erros lado a lado */}
          <div className="right-column">
            <div className="horizontal-wrapper">
              <div className="admin-carde half-carde">
                <h3>🎯 Assertividade Geral</h3>
                {assertividade !== "N/A" && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {assertividade !== "N/A" && (
                  <p className="assertividade-text">
                    {assertividade}% de assertividade
                  </p>
                )}
                <div className="carde-button">
                  <a
                    href="https://github.com/Caceraghigofurther?tab=repositories
                    // 
                    // "
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div className="admin-card half-card error-card">
                <h3>⚠️ Erros</h3>
                {errorList.length > 0 ? (
                  <div className="error-table-container">
                    <table className="admin-table error-table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>ID Execução</th>
                          <th>Usuário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorList.map((err) => (
                          <tr key={err.id}>
                            <td>{new Date(err.data_execucao).toLocaleString()}</td>
                            <td>{err.id}</td>
                            <td>{err.usuario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-info">
                    Nenhuma execução registrada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
