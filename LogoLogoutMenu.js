import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.jpg'; // Ajuste o caminho conforme sua estrutura
import './LogoLogoutMenu.css'; // Arquivo de CSS exclusivo para este componente

function LogoLogoutMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove os dados do usuário e o token do localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Se necessário, você pode limpar outros itens ou usar localStorage.clear();

    // Redireciona para a página raiz
    navigate('/');
  };

  return (
    <nav className="logo-logout-menu">
      <div className="logo-containerr">
        <img src={logo} alt="Go Further Group Logo" className="logo" />
      </div>
      <button className="logout-btnn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default LogoLogoutMenu;
