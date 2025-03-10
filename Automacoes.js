import React, { useEffect, useState } from 'react';
import './sharepointOverride.css'; // Usa os mesmos estilos



function Automacoes() {
  const [automacoes, setAutomacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroSetor, setFiltroSetor] = useState('');
  const [ordenacaoStatus, setOrdenacaoStatus] = useState('asc');
  const [notificacao, setNotificacao] = useState(null);

  const fetchAutomacoes = async () => {
    try {
      const response = await fetch('http://192.168.51.8/automations/');
      if (!response.ok) throw new Error('Erro ao buscar os dados');
      const data = await response.json();

      setAutomacoes(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomacoes();
    const interval = setInterval(fetchAutomacoes, 5000);
    return () => clearInterval(interval);
  }, []);

  const excluirAutomacao = async (id) => {
    try {
      const response = await fetch(`http://192.168.51.8/automations/${id}/`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir automação');
      setAutomacoes(automacoes.filter((auto) => auto.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const ordenarAutomacoesPorStatus = () => {
    const sortedAutomacoes = [...automacoes].sort((a, b) =>
      ordenacaoStatus === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
    );
    setAutomacoes(sortedAutomacoes);
    setOrdenacaoStatus(ordenacaoStatus === 'asc' ? 'desc' : 'asc');
  };

  return (
    
    <div className="execucoes-container">
      
      {notificacao && <div className="notification">{notificacao}</div>}

      <div className="execucao-header">Automações</div>

      <div className="filtro-container">
        <select onChange={(e) => setFiltroSetor(e.target.value)}>
          <option value="">Todos os Setores</option>
          {[...new Set(automacoes.map(a => a.setor))].map(setor => (
            <option key={setor} value={setor}>{setor}</option>
          ))}
        </select>

        <button className="ordenar-button" onClick={ordenarAutomacoesPorStatus}>
          Ordenar Status <span>{ordenacaoStatus === 'asc' ? '⬆️' : '⬇️'}</span>
        </button>
      </div>

      <table className="execucao-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Setor</th>
            <th>Tecnologias</th>
            <th>Versão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {automacoes
             
            .filter(auto => filtroSetor === '' || auto.setor === filtroSetor)
            .map((auto) => (
              
            <tr key={auto.id}>
              <td>{auto.id}</td>
              <td>{auto.nome}</td>
              <td>{auto.setor}</td>
              <td>{auto.tecnlogias}</td>
              <td>{auto.versao}</td>
              <td>
                <span className={`status ${auto.status.toLowerCase().replace(/\s/g, "-")}`}>
                  {auto.status}
                </span>
              </td>
              <td>
                <button className="delete-button" onClick={() => excluirAutomacao(auto.id)}>
                  <img src="https://cdn-icons-png.flaticon.com/512/3096/3096673.png" alt="Excluir" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Automacoes;
