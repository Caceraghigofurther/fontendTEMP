import React from 'react';
import ReactDOM from 'react-dom/client'; // Novo método para React 18
import App from './App';
import './sharepointOverride.css'; // Usa os estilos comuns

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
