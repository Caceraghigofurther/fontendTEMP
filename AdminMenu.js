import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaFolderOpen, FaUsers, FaGithub } from 'react-icons/fa';
import logo from './assets/logo.jpg'; // Ajuste o caminho conforme sua estrutura
import './AdminMenu.css';

function AdminMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove os dados do usuário e token do localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Se houver outros itens a limpar, adicione aqui, por exemplo:
    // localStorage.clear();

    // Redireciona para a rota raiz "/"
    navigate('/');
  };

  return (
    <nav className="admin-menu">
      <div className="logo-container">
        <a className='agua' href="https://gofurthergroup.com.br/">
         <img src={logo} alt="Go Further Group Logo" className="logo" />
        </a>
      </div>
      <Link to="/admin" className="menu-item">
        <FaHome className="menu-icon" />
        <span>Painel</span>
      </Link>
      <Link to="/admin/automacoes" className="menu-item">
        <FaFolderOpen className="menu-icon" />
        <span>Automações</span>
      </Link>
      <Link to="/admin/usuarios" className="menu-item">
        <FaUsers className="menu-icon" />
        <span>Pessoas</span>
      </Link>
      <a
        href="https://github.com/Caceraghigofurther?tab=repositories"
        target="_blank"
        rel="noopener noreferrer"
        className="menu-item"
      >
        <FaGithub className="menu-icon" />
        <span>GitHub</span>
      </a>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default AdminMenu;
