import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from './AdminMenu';
import './sharepointOverride.css';

function AdminAutomacoes() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://192.168.51.8/github-automations/')
      .then((res) => res.json())
      .then((data) => {
        setAutomations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="admin-loading">Carregando automações...</p>;
  if (error) return <p className="admin-error">Erro: {error}</p>;

  return (
    <div>
      <AdminMenu /> {/* 🔹 Inclui o menu no topo */}

      <div className="admin-container">
        <h2 className="admin-title">Automações Disponíveis</h2>
        <div className="admin-automation-grid">
          {automations.map((automation) => (
            <div key={automation.id} className="admin-automation-card">
              <h3>{automation.nome}</h3>
              <p><strong>Setor:</strong> {automation.setor}</p>
              <p><strong>Status:</strong> {automation.status}</p>
              <button
                className="admin-btn"
                onClick={() => navigate(`/admin/automacoes/${automation.id}`)}
              >
                Detalhar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminAutomacoes;
