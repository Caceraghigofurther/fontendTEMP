import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaTrash, FaUsers, FaHistory, FaEdit } from 'react-icons/fa';
import './sharepointOverride.css';
import AdminMenu  from './AdminMenu';

function AdminUserDetail() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [availableAutomations, setAvailableAutomations] = useState([]);
  const [selectedAutomationAdd, setSelectedAutomationAdd] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [automationToRemove, setAutomationToRemove] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados do usuário
  useEffect(() => {
    fetch(`http://192.168.51.8/admin-api/users/${userId}/automations/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Dados Recebidos:", data);
        setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  // Carregar automações disponíveis
  useEffect(() => {
    fetch(`http://192.168.51.8/github-automations/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erro ao buscar automações disponíveis');
        }
        return res.json();
      })
      .then((data) => setAvailableAutomations(data))
      .catch((err) => console.error("Erro na requisição:", err));
  }, []);

  // Função para atribuir automação
  const assignAutomation = () => {
    if (!selectedAutomationAdd) return;

    fetch(`http://192.168.51.8/admin-api/users/${userId}/assign_automation/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automation: selectedAutomationAdd }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatusMessage(data.message);
        setUserData((prev) => ({ ...prev, automations: data.automations }));
        setSelectedAutomationAdd('');
      })
      .catch((err) => console.error(err));
  };

  // Exibir popup antes de remover automação
  const confirmRemoveAutomation = (automation) => {
    setAutomationToRemove(automation);
    setShowPopup(true);
  };

  // Função para remover automação
  const removeAutomation = () => {
    if (!automationToRemove) return;

    fetch(`http://192.168.51.8/admin-api/users/${userId}/remove_automation/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automation: automationToRemove }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatusMessage(data.message);
        setUserData((prev) => ({ ...prev, automations: data.automations }));
        setShowPopup(false);
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p className="admin-loading">Carregando dados do usuário...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <AdminMenu />
      <div className="admin-container">
      <h2 className="admin-title">Gerenciamento do Usuário: {userData.login}</h2>
      <h3 className="admin-subtitle">Automações Atribuídas:</h3>

      {userData.automations && userData.automations.length > 0 ? (
        <ul className="admin-automation-list">
          {userData.automations.map((a, index) => (
            <li key={index} className="admin-automation-item">
              {a}
              <FaTrash className="trash-icon" onClick={() => confirmRemoveAutomation(a)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-info">Nenhuma automação atribuída.</p>
      )}

      {/* Dropdown para adicionar automações */}
      <div className="admin-form-group">
        <select
          className="admin-select"
          value={selectedAutomationAdd}
          onChange={(e) => setSelectedAutomationAdd(e.target.value)}
        >
          <option value="">Selecione uma automação para adicionar</option>
          {availableAutomations.map((automation) => (
            <option key={automation.id} value={automation.nome}>
              {automation.nome}
            </option>
          ))}
        </select>
        <button onClick={assignAutomation} className="admin-btn">
          Atribuir
        </button>
      </div>

      {/* Popup de Confirmação */}
      {showPopup && (
        <div className="confirmation-popup">
          <p>Tem certeza que deseja remover "{automationToRemove}"?</p>
          <div className="confirmation-buttons">
            <button onClick={removeAutomation} className="confirm-btn">Sim</button>
            <button onClick={() => setShowPopup(false)} className="cancel-btn">Cancelar</button>
          </div>
        </div>
      )}

      {/* Popup de Status */}
      {statusMessage && <div className="status-popup">{statusMessage}</div>}
    </div>
    </div>
  );
}

export default AdminUserDetail;
