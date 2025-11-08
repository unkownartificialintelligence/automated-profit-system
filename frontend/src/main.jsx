import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AdminApp from './AdminApp.jsx';

// Check if we're in admin mode
const isAdminMode = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminMode ? <AdminApp /> : <App />}
  </StrictMode>
);
