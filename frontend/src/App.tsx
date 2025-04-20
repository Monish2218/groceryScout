import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';

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
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage initialCartItems={sampleCartItems} onClearCart={() => console.log("Cart cleared")} />} />
        </Route>
        <Route path="/login" element={<LoginPage onSubmit={(email, password) => {
            console.log("Login:", email, password)
            alert(`Logging in with ${email}`)
          }} />} />
        <Route path="/register" element={<RegisterPage onSubmit={(name, email, password) => {
            console.log("Register:", name, email, password)
            alert(`Registering ${name} with ${email}`)
          }} />} />
      </Routes>
    </Router>
  );
}

export default App;