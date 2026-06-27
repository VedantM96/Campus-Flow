/// <reference types="vite/client" />
import axios from 'axios';

// 1. Create the Axios instance pointing to your Spring Boot backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// 2. Add an "Interceptor" to automatically attach the JWT token
api.interceptors.request.use(
    (config) => {
        // Grab the token from local storage
        const token = localStorage.getItem('token');
        
        // If the token exists, attach it to the Authorization header
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;