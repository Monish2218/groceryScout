import {Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import ProtectedRoute from './components/ProtectedRoute';

// Sample data for demonstration
const sampleCartItems = [
  {
    id: "1",
    name: "Organic Spinach",
    imageUrl: "/placeholder.svg?height=200&width=200",
    pricePerUnit: 50,
    unit: "100g",
    quantity: 2,
  },
  {
    id: "2",
    name: "Fresh Avocado",
    imageUrl: "/placeholder.svg?height=200&width=200",
    pricePerUnit: 120,
    unit: "piece",
    quantity: 3,
  },
  {
    id: "3",
    name: "Whole Wheat Bread",
    imageUrl: "/placeholder.svg?height=200&width=200",
    pricePerUnit: 75,
    unit: "loaf",
    quantity: 1,
  },
]

function App() {
  return (
    <Routes>
      {/* Routes with Header/Footer Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} /> {/* Default route for "/" */}
        {/* <Route path="products" element={<ProductsPage />} /> */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage initialCartItems={sampleCartItems} onClearCart={() => console.log("Cart cleared")} />} />
            {/* <Route path="orders" element={<OrdersPage />} /> */}
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