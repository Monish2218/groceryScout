import axios from 'axios';

const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(new Error(error.message ?? String(error)));
    }
);

// Response Interceptor (Optional): Handle global errors like 401
axiosInstance.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response && error.response.status === 401) {
            // Unauthorized - Token might be invalid or expired
            console.error("Unauthorized access - 401");
            // TODO: Implement logout logic here (e.g., clear token, redirect to login)
            // This is tricky to do globally without access to context/router,
            // Often handled within the component or auth context error handling instead.
            // For now, we just log it.
            localStorage.removeItem('authToken'); // Simple logout on 401
            //  window.location.href = '/login'; // Force redirect
        }
        return Promise.reject(error instanceof Error ? error : new Error(error.message ?? String(error)));
    }
);


export default axiosInstance;