import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { Menu, ShoppingCart, User, X } from "lucide-react"

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Site Title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                  <span className="text-green-600 font-bold text-lg">G</span>
                </div>
                <span className="font-bold text-xl">GroceryScout</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "font-medium border-b-2 border-white" : "font-medium hover:text-green-200"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive ? "font-medium border-b-2 border-white" : "font-medium hover:text-green-200"
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive ? "font-medium border-b-2 border-white" : "font-medium hover:text-green-200"
                }
              >
                My Orders
              </NavLink>
            </nav>

            {/* Right Side - Auth and Cart */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="hover:text-green-200">
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <Link to="/account" className="hover:text-green-200">
                <User className="h-6 w-6" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-1 rounded-md hover:bg-green-700 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-green-600 shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-end mb-2">
                <button className="p-1 rounded-md hover:bg-green-700 focus:outline-none" onClick={toggleMobileMenu}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-3 pb-3">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "font-medium border-l-4 border-white pl-2" : "font-medium hover:text-green-200 pl-2"
                  }
                  onClick={toggleMobileMenu}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? "font-medium border-l-4 border-white pl-2" : "font-medium hover:text-green-200 pl-2"
                  }
                  onClick={toggleMobileMenu}
                >
                  Products
                </NavLink>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    isActive ? "font-medium border-l-4 border-white pl-2" : "font-medium hover:text-green-200 pl-2"
                  }
                  onClick={toggleMobileMenu}
                >
                  My Orders
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>© {currentYear} GroceryScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
