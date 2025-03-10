// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Verifica se existe um token (ou usuário) no localStorage
  const token = localStorage.getItem("user");
  if (!token) {
    // Se não houver token, redireciona para a página de login ("/")
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
