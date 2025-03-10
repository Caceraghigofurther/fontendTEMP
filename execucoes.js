import React, { useEffect, useState } from 'react';
import './Execucoes.css';

function Execucoes() {
  const [execucoes, setExecucoes] = useState([]);
  const [ultimoId, setUltimoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [ordenacaoData, setOrdenacaoData] = useState('asc');
  const [ordenacaoStatus, setOrdenacaoStatus] = useState('asc');
  const [notificacao, setNotificacao] = useState(null);

  const fetchExecucoes = async () => {
    try {
      const response = await fetch('http://192.168.51.8/execucoes/');
      if (!response.ok) throw new Error('Erro ao buscar os dados');
      const data = await response.json();

      if (ultimoId !== null && data.length > execucoes.length) {
        const novoItem = data.find(item => item.id > ultimoId);
        if (novoItem) {
          setNotificacao(`Nova execução adicionada: ID ${novoItem.id}`);
          setTimeout(() => setNotificacao(null), 10000);
        }
      }

      setExecucoes(data);
      setUltimoId(data.length > 0 ? Math.max(...data.map(item => item.id)) : null);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecucoes();
    const interval = setInterval(fetchExecucoes, 5000);
    return () => clearInterval(interval);
  }, []);

  const excluirExecucao = async (id) => {
    try {
      const response = await fetch(`http://192.168.51.8/execucoes/${id}/`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir item');
      setExecucoes(execucoes.filter((exec) => exec.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const ordenarExecucoesPorData = () => {
    const sortedExecucoes = [...execucoes].sort((a, b) => 
      ordenacaoData === 'asc' ? new Date(a.data_execucao) - new Date(b.data_execucao) : new Date(b.data_execucao) - new Date(a.data_execucao)
    );
    setExecucoes(sortedExecucoes);
    setOrdenacaoData(ordenacaoData === 'asc' ? 'desc' : 'asc');
  };

  const ordenarExecucoesPorStatus = () => {
    const sortedExecucoes = [...execucoes].sort((a, b) => 
      ordenacaoStatus === 'asc' ? a.resultado.localeCompare(b.resultado) : b.resultado.localeCompare(a.resultado)
    );
    setExecucoes(sortedExecucoes);
    setOrdenacaoStatus(ordenacaoStatus === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="execucoes-container">
      {notificacao && <div className="notification">{notificacao}</div>}

      <div className="execucao-header">Execuções</div>

      <div className="filtro-container">
        <select onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os Status</option>
          <option value="Sucesso">Sucesso</option>
          <option value="Erro">Erro</option>
          <option value="Em Andamento">Em Andamento</option>
        </select>

        <button className="ordenar-button" onClick={ordenarExecucoesPorData}>
          Ordenar Data <span>{ordenacaoData === 'asc' ? '⬆️' : '⬇️'}</span>
        </button>

        <button className="ordenar-button" onClick={ordenarExecucoesPorStatus}>
          Ordenar Status <span>{ordenacaoStatus === 'asc' ? '⬆️' : '⬇️'}</span>
        </button>
      </div>

      <table className="execucao-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Automação</th>
            <th>Usuário</th>
            <th onClick={ordenarExecucoesPorData} style={{ cursor: 'pointer' }}>
              Data Execução {ordenacaoData === 'asc' ? '⬆️' : '⬇️'}
            </th>
            <th onClick={ordenarExecucoesPorStatus} style={{ cursor: 'pointer' }}>
              Status {ordenacaoStatus === 'asc' ? '⬆️' : '⬇️'}
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {execucoes
            .filter(exec => filtroStatus === '' || exec.resultado.toLowerCase() === filtroStatus.toLowerCase())
            .map((execucao) => (
            <tr key={execucao.id}>
              <td>{execucao.id}</td>
              <td>{execucao.id_automacao}</td>
              <td>{execucao.usuario}</td>
              <td>{new Date(execucao.data_execucao).toLocaleString()}</td>
              <td>
                <span className={`status ${execucao.resultado.toLowerCase().replace(' ', '-')}`}>
                  {execucao.resultado}
                </span>
              </td>
              <td>
                <button className="delete-button" onClick={() => excluirExecucao(execucao.id)}>
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

export default Execucoes;
