import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import UserAutomacoes from './UserAutomacoes';
import AdminDashboard from './AdminDashboard';
import AdminAutomacoes from './AdminAutomacoes';
import AdminAutomacaoDetalhe from './AdminAutomacaoDetalhe';
import AdminUsers from './AdminUsers';
import AdminUserDetail from './AdminUserDetail';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/automacoes" element={<UserAutomacoes user={user} />} />
        {/* Rotas administrativas protegidas */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="automacoes" element={<AdminAutomacoes />} />
                <Route path="automacoes/:automacaoId" element={<AdminAutomacaoDetalhe />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="users/:userId" element={<AdminUserDetail />} />
              </Routes>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<h2>Página não encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
