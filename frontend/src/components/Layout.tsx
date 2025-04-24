import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { Menu, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/AuthContext"
import { useFetchCart } from '@/queries/useCartQueries';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth();
  const { data: cart, isLoading: isLoadingCart } = useFetchCart();
  const currentYear = new Date().getFullYear()
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-emerald-600 to-green-500 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Logo & Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-white/90 p-1">
                {/* Logo placeholder */}
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
              <span className="text-xl font-bold text-white">GroceryScout</span>
            </Link>
          </div>

          {/* Center - Navigation (desktop only) */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <NavLink 
                  to="/"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-white/90 ${
                      isActive ? "text-white" : "text-white/70"
                    }`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/products"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-white/90 ${
                      isActive ? "text-white" : "text-white/70"
                    }`
                  }
                >
                  Products
                </NavLink>
              </li>
              {isAuthenticated && 
                <li>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors hover:text-white/90 ${
                        isActive ? "text-white" : "text-white/70"
                      }`
                    }
                  >
                    My Orders
                  </NavLink>
                </li>
              }
            </ul>
          </nav>

          {/* Right - Auth & Cart */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex md:items-center md:space-x-4">
              {isAuthenticated ? (
                <>
                  <span>Welcome, {user?.name}!</span>
                  <Button variant="ghost" size="sm" className="text-white bg-red-500 rounded hover:bg-red-600 hover:text-white" onClick={logout}>
                    Logout
                  </Button>
                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-emerald-700 hover:text-white">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {!isLoadingCart && itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {itemCount}
                        </span>
                      )}
                      Cart
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-emerald-700 hover:text-white" >
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-emerald-700 hover:text-white" >
                      <User className="mr-2 h-4 w-4" />
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-emerald-700">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-lg font-bold text-emerald-600">GroceryScout</span>
                    <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  <nav className="flex-1 py-4">
                    <ul className="space-y-4">
                      <li>
                        <NavLink
                          to="/"
                          className={({ isActive }) =>
                            `block py-2 text-base font-medium ${
                              isActive ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
                            }`
                          }
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Home
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/products"
                          className={({ isActive }) =>
                            `block py-2 text-base font-medium ${
                              isActive ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
                            }`
                          }
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Products
                        </NavLink>
                      </li>
                      {isAuthenticated && 
                        <li>
                          <NavLink
                            to="/orders"
                            className={({ isActive }) =>
                              `block py-2 text-base font-medium ${
                                isActive ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
                              }`
                            }
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Orders
                          </NavLink>
                        </li>
                      }`
                    </ul>
                  </nav>
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {setIsMenuOpen(false); logout();}}>
                          <User className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                        <Link to="/cart" className="mt-2 block">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Cart
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Login
                          </Button>
                        </Link>
                        <Link to="/register">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Register
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-100 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">© {currentYear} GroceryScout. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
