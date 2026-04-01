import axios from 'axios';

const getBaseURL = () => {
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    const envURL = import.meta.env.VITE_API_URL;
    
    if (isProduction) {
        // Force the Render URL if env variable is localhost or missing
        if (!envURL || envURL.includes('localhost')) {
            return 'https://project-132g.onrender.com';
        }
        return envURL;
    }
    return envURL || 'http://localhost:5000';
};

const API_URL = getBaseURL();

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        // Handle common error cases (like 401 Unauthorized)
        if (error.response?.status === 401) {
            // Optional: Redirect to login or clear local storage if token is invalid
            // localStorage.removeItem('token');
        }
        
        return Promise.reject(error);
    }
);

export { API_URL };
export default api;
