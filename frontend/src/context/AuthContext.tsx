import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
    useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'sonner';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: Record<string, string>) => Promise<boolean>;
    register: (userData: Record<string, string>) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
    setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (credentials: Record<string, string>): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post<{token: string; user: User}>('/auth/login', credentials);
            const { token: receivedToken, user: loggedInUser } = response.data;

            localStorage.setItem('authToken', receivedToken);
            setToken(receivedToken);
            setUser(loggedInUser);
            setIsAuthenticated(true);
            toast.success('Login successful!');
            navigate('/');
            return true;
        } catch (err: unknown) {
            console.error("Login failed:", err);
            const error = err as { response?: { data?: { message?: string } } };
            const message = error.response?.data?.message ?? 'Login failed. Please check credentials.';
            setError(message);
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const register = useCallback(async (userData: Record<string, string>): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post<{token: string; user: User}>('/auth/register', userData);
            const { token: receivedToken, user: newUser } = response.data;

            localStorage.setItem('authToken', receivedToken);
            setToken(receivedToken);
            setUser(newUser);
            setIsAuthenticated(true);
            toast.success('Registration successful!');
            navigate('/');
            return true;
        } catch (err: unknown) {
            console.error("Registration failed:", err);
            const error = err as { response?: { data?: { message?: string } } };
            const message = error.response?.data?.message ?? 'Registration failed. Please try again.';
            setError(message);
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const handleStorageChange = () => {
            const currentToken = localStorage.getItem('authToken');
            if (currentToken !== token) {
                console.log("Auth token change detected, logging out.");
                logout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [token, logout]);


    const value: AuthContextType = React.useMemo(
        () => ({
            isAuthenticated,
            user,
            token,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
            setError,
        }),
        [isAuthenticated, user, token, isLoading, error, login, register, logout, clearError, setError]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};