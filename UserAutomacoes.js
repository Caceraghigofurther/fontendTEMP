import React, { useState, useEffect } from 'react';
import './sharepointOverride.css';
import LogoLogoutMenu from './LogoLogoutMenu';

function UserAutomacoes({ user }) {
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);
  const [githubAutomations, setGithubAutomations] = useState([]);
  const [editingAutomationId, setEditingAutomationId] = useState(null);
  const [loginExternal, setLoginExternal] = useState('');
  const [passwordExternal, setPasswordExternal] = useState('');

  // Busca as automações do GitHub (para saber quais requerem credenciais)
  useEffect(() => {
    if (user) {
      fetch("http://192.168.51.8/github-automations/")
        .then((res) => res.json())
        .then((data) => setGithubAutomations(data))
        .catch((err) => console.error("Erro ao carregar automações do GitHub", err));
    }
  }, [user]);

  const showPopupMessage = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  // Função para rodar a automação
  const rodarAutomacao = async (nomeAutomacao) => {
    if (automationRunning) return;
    setAutomationRunning(true);
    let execData = null;
    let automacaoId = null;
    try {
      showPopupMessage(`⏳ Buscando ID da automação ${nomeAutomacao}...`, 'info');
      const getResponse = await fetch(`http://192.168.51.8/github-automations/`);
      const automations = await getResponse.json();
      const automation = automations.find(
        (a) => a.nome.toLowerCase() === nomeAutomacao.trim().toLowerCase()
      );
      if (!automation) {
        showPopupMessage(`❌ Automação ${nomeAutomacao} não encontrada.`, 'error');
        setAutomationRunning(false);
        return;
      }
      function toIsoLocal(date) {
        const pad = (n) => n < 10 ? '0' + n : n;
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const tzOffset = -date.getTimezoneOffset(); // em minutos
        const sign = tzOffset >= 0 ? '+' : '-';
        const offsetHours = pad(Math.floor(Math.abs(tzOffset) / 60));
        const offsetMinutes = pad(Math.abs(tzOffset) % 60);
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
      }
      automacaoId = automation.id;
      showPopupMessage(`⏳ Registrando execução da automação...`, 'info');
      const execResponse = await fetch(`http://192.168.51.8/execucoes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_automacao: automacaoId,
          resultado: 'Execução iniciada',
          usuario: user.login,
          data_execucao: toIsoLocal(new Date()),
        }),
      });
      if (!execResponse.ok) {
        const errorData = await execResponse.json();
        throw new Error(`Erro ao registrar execução: ${JSON.stringify(errorData)}`);
      }
      execData = await execResponse.json();
      const response = await fetch(`http://${user.ip}:5000/run-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeAutomacao, id: execData.id, user: execData.usuario, id_aut: automacaoId}),
      });
      const data = await response.json();
      if (response.ok) {
        showPopupMessage(`✅ Automação ${nomeAutomacao} executada!`, 'success');
      } else {
        showPopupMessage(`❌ Erro ao rodar ${nomeAutomacao}: ${data.error || 'Erro desconhecido'}`, 'error');
        if (execData && execData.id) {
          await fetch(`http://192.168.51.8/execucoes/${execData.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resultado: `Erro: ${data.error || 'Erro desconhecido'}` }),
          });
        }
      }
    } catch (error) {
      showPopupMessage(`❌ Erro ao rodar ${nomeAutomacao}: ${error.message}`, 'error');
      if (execData && execData.id) {
        try {
          await fetch(`http://192.168.51.8/execucoes/${execData.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resultado: `Erro: ${error.message}` }),
          });
        } catch (updateError) {
          console.error('Erro ao atualizar o registro de execução:', updateError);
        }
      }
    } finally {
      setAutomationRunning(false);
    }
  };

  // Função para salvar as credenciais (criar ou atualizar)
  const salvarCredenciais = async (id_automacao) => {
    const payload = {
      login: user.login,
      login_external: loginExternal,
      password_external: passwordExternal,
      id_automacao,
    };
    try {
      // Tenta atualizar via PATCH
      const response = await fetch(`http://192.168.51.8/login-automations/${id_automacao}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Se o registro não existir (404), cria via POST
      if (response.status === 404) {
        const postResponse = await fetch(`http://192.168.51.8/login-automations/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!postResponse.ok) throw new Error('Erro ao criar credenciais.');
      } else if (!response.ok) {
        throw new Error('Erro ao atualizar credenciais.');
      }
      showPopupMessage("✅ Credenciais salvas com sucesso!", "success");
      setEditingAutomationId(null);
      setLoginExternal('');
      setPasswordExternal('');
    } catch (err) {
      showPopupMessage(`❌ ${err.message}`, "error");
    }
  };

  if (!user) {
    return (
      <h2 className="access-denied">
        ⛔ Acesso negado. Faça login primeiro.
      </h2>
    );
  }

  return (
    <div>
      <LogoLogoutMenu />
      <div className="container">
        <h2 className="title">Automações de {user.login}</h2>
        <div className="automation-box">
          <ul className="automation-list">
            {user.automations.map((automation, index) => {
              const automationObj = githubAutomations.find(
                (a) => a.nome.toLowerCase() === automation.trim().toLowerCase()
              );
              return (
                <li key={index} className="automation-item">
                  <span className="automation-name">{automation.trim()}</span>
                  <button
                    className="play-button"
                    onClick={() => rodarAutomacao(automation.trim())}
                    disabled={automationRunning}
                  >
                    Rodar
                  </button>
                  {automationObj && automationObj.login && (
                    <button
                      className="edit-credentials-button"
                      onClick={() => setEditingAutomationId(automationObj.id)}
                    >
                      {editingAutomationId === automationObj.id ? "Fechar" : "Editar Credenciais"}
                    </button>
                  )}
                  {editingAutomationId === (automationObj && automationObj.id) && (
                    <div className="credentials-modal">
                      <div className="modal-content">
                        <h3>Editar Credenciais</h3>
                        <input
                          type="text"
                          placeholder="Login Externo"
                          value={loginExternal}
                          onChange={(e) => setLoginExternal(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Senha Externa"
                          value={passwordExternal}
                          onChange={(e) => setPasswordExternal(e.target.value)}
                        />
                        <div className="button-group">
                          <button className="save-button" onClick={() => salvarCredenciais(automationObj.id)}>
                            Salvar Credenciais
                          </button>
                          <button className="close-button" onClick={() => setEditingAutomationId(null)}>
                            Fechar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {showPopup && (
          <div className={`popup ${popupType}`}>
            {popupMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserAutomacoes;
