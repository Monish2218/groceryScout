import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Router should wrap AuthProvider and App */}
    <Router>
      <AuthProvider>
        <CartProvider> {/* CartProvider inside AuthProvider */}
          <App />
        </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);