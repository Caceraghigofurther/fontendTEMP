import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from './AdminMenu';

import './DeleteButton.css'


function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://192.168.51.8/users/')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Abre o modal e define qual usuário será excluído
  const openModal = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  // Fecha o modal e limpa o usuário selecionado
  const closeModal = () => {
    setUserToDelete(null);
    setShowModal(false);
  };

  // Executa a exclusão do usuário e atualiza a lista
  const confirmDelete = () => {
    if (userToDelete) {
      fetch(`http://192.168.51.8/admin-api/users/${userToDelete.id}/`, {
        method: "DELETE"
      })
        .then(response => {
          if (response.ok) {
            // Remove o usuário excluído da lista
            setUsers(users.filter(u => u.id !== userToDelete.id));
          } else {
            console.error("Falha ao excluir usuário");
          }
          closeModal();
        })
        .catch(error => {
          console.error("Erro ao excluir usuário: ", error);
          closeModal();
        });
    }
  };

  if (loading) return <p className="admin-loading">Carregando usuários...</p>;
  if (error) return <p className="admin-error">Erro: {error}</p>;

  return (
    <div>
      <AdminMenu />
      <div className="admin-container">
        <h2 className="admin-title">Gerenciamento de Pessoas</h2>
        <div className="admin-user-grid">
          {users.map((user) => (
            <div key={user.id} className="admin-user-card">
              <span className="admin-user-name">
                {user.login} - {user.is_admin ? 'Admin' : 'Usuário'}
              </span>
              <button
                className={`admin-btn-manage ${user.is_admin ? 'disabled' : ''}`}
                onClick={() => !user.is_admin && navigate(`/admin/users/${user.id}`)}
                disabled={user.is_admin}
              >
                Gerenciar
              </button>
              <button
  className={`admin-btn-delete ${user.is_admin ? 'disabled' : ''}`}
  onClick={() => !user.is_admin && openModal(user)}
  disabled={user.is_admin}
  title="Excluir Usuário"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#d9534f" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="feather feather-trash-2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
    <path d="M9 6V4a3 3 0 0 1 6 0v2" />
  </svg>
</button>


            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmação</h3>
            <p>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete.login}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="modal-btn confirm" onClick={confirmDelete}>
                Sim
              </button>
              <button className="modal-btn cancel" onClick={closeModal}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
