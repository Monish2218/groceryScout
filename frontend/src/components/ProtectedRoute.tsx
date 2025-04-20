// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth(); // Use isLoading

    // Optional: Show loading state while checking auth
    // This is more useful if you implement async checks on initial load
    if (isLoading) {
         return (
            <div className="flex justify-center items-center h-screen">
                 {/* Add a nice spinner here */}
                 <p>Loading authentication...</p>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;