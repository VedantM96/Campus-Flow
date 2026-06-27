import api from './api';

export const authService = {
    // Register a new user
    register: async (name: string, email: string, password: string, role: string) => {
        const response = await api.post('/auth/register', { name, email, password, role });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    // Login an existing user
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/authenticate', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token); // Save the token!
        }
        return response.data;
    },

    // Logout the user
    logout: () => {
        localStorage.removeItem('token');
    }
};