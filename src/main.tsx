import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.scss';

// React 18+ mounting API. createRoot gives us concurrent features.
// StrictMode helps catch common bugs in dev — it intentionally double-invokes
// some hooks/effects so we notice missing cleanup. It does NOT run in production.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
