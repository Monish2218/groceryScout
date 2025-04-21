import {Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <Routes>
      {/* Routes with Header/Footer Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} /> {/* Default route for "/" */}
        {/* <Route path="products" element={<ProductsPage />} /> */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage/>} />
            <Route path="orders" element={<OrdersPage />} />
            {/* Add other protected routes here */}
          </Route>
        </Route>

      {/* Auth routes might not need the standard layout, or use a simpler one */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Catch-all 404 Route */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App