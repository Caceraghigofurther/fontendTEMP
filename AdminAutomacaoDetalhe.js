import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaUsers, FaHistory, FaEdit } from "react-icons/fa";
import "./sharepointOverride.css";
import AdminMenu from "./AdminMenu";

function AdminAutomacaoDetalhes() {
  const { automacaoId } = useParams();
  const [detalhes, setDetalhes] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const [editSetor, setEditSetor] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [editLogin, setEditLogin] = useState(false);

  const [newSetor, setNewSetor] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newLogin, setNewLogin] = useState(false);

  // Busca os detalhes da automação
  useEffect(() => {
    fetch(`http://192.168.51.8/admin-api/automacoes/${automacaoId}/detalhes/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao carregar os detalhes da automação");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Dados Recebidos:", data);
        if (data.execucoes) {
          data.execucoes.sort(
            (a, b) => new Date(b.data_execucao) - new Date(a.data_execucao)
          );
        }
        setDetalhes(data);
        setNewSetor(data.setor || "");
        setNewStatus(data.status);
        setNewLogin(data.login); // Inicializa com o valor recebido
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [automacaoId]);

  // Busca os usuários
  useEffect(() => {
    fetch("http://192.168.51.8/users/")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Erro ao carregar usuários", err));
  }, []);

  // Função para atualizar setor, status ou login no backend
  const updateAutomacao = (campo, valor) => {
    fetch(`http://192.168.51.8/github-automations/${automacaoId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Atualizado:", data);
        setDetalhes((prev) => ({ ...prev, [campo]: valor }));
      })
      .catch((err) => console.error("❌ Erro ao atualizar:", err));
  };

  if (loading) return <p className="admin-loading">Carregando detalhes...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  // Paginação para histórico de execuções
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = detalhes.execucoes.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(detalhes.execucoes.length / logsPerPage);

  const parseUserAutomations = (user) => {
    const raw = user.automations;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return raw.trim() ? [raw.trim()] : [];
    }
  };

  const usuariosComAcesso = usuarios.filter((user) => {
    const userAutos = parseUserAutomations(user);
    return userAutos.includes(detalhes.nome);
  });

  return (
    <div>
      <AdminMenu />
      <div className="admin-container">
        <h2 className="admin-title">
          🚀 Detalhes da Automação: {detalhes.nome}
        </h2>

        <div className="admin-info-container">
          <p>
            📁 <strong>Setor:</strong>{" "}
            {editSetor ? (
              <input
                type="text"
                value={newSetor}
                onChange={(e) => setNewSetor(e.target.value)}
                onBlur={() => {
                  setEditSetor(false);
                  updateAutomacao("setor", newSetor);
                }}
                autoFocus
                className="edit-input"
              />
            ) : (
              <span onClick={() => setEditSetor(true)}>
                {detalhes.setor || "Não informado"}{" "}
                <FaEdit className="edit-icon" />
              </span>
            )}
          </p>

          <p>
            🔧 <strong>Status:</strong>{" "}
            {editStatus ? (
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                onBlur={() => {
                  setEditStatus(false);
                  updateAutomacao("status", newStatus);
                }}
                autoFocus
                className="edit-select"
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            ) : (
              <span onClick={() => setEditStatus(true)}>
                {detalhes.status} <FaEdit className="edit-icon" />
              </span>
            )}
          </p>

          {/* Lógica para edição do campo booleano "login" */}
          <p>
            🔑 <strong>Login:</strong>{" "}
            {editLogin ? (
              <input
                type="checkbox"
                checked={newLogin}
                onChange={(e) => {
                  const value = e.target.checked;
                  setNewLogin(value);
                  updateAutomacao("login", value);
                  setDetalhes((prev) => ({ ...prev, login: value }));
                  setEditLogin(false);
                }}
                autoFocus
              />
            ) : (
              <span
                onClick={() => {
                  setEditLogin(true);
                  setNewLogin(detalhes.login);
                }}
              >
                {detalhes.login ? "True" : "False"}{" "}
                <FaEdit className="edit-icon" />
              </span>
            )}
          </p>

          <p>
            🎯 <strong>Assertividade:</strong>{" "}
            {detalhes.assertividade
              ? `${detalhes.assertividade}%`
              : "Não calculado"}
          </p>
        </div>

        <h3 className="admin-subtitle">
          <FaUsers /> Usuários com acesso:
        </h3>
        <div className="admin-user-container">
          {usuariosComAcesso.length > 0 ? (
            usuariosComAcesso.map((user) => (
              <span key={user.id} className="user-badge">
                {user.login}
              </span>
            ))
          ) : (
            <p className="admin-info">Nenhum usuário atribuído.</p>
          )}
        </div>

        <h3 className="admin-subtitle">
          <FaHistory /> Histórico de Execuções:
        </h3>
        <div className="execucao-container small-card">
          {currentLogs.length > 0 ? (
            <table className="execucao-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Resultado</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((exec) => (
                  <tr key={exec.id}>
                    <td>{exec.id}</td>
                    <td>{exec.usuario}</td>
                    <td className={`status ${exec.resultado.toLowerCase()}`}>
                      {exec.resultado}
                    </td>
                    <td>{new Date(exec.data_execucao).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-info">Nenhuma execução registrada.</p>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAutomacaoDetalhes;
