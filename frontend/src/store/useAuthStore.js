import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';


export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check')
            set({ authUser: res.data })
        } catch (error) {
            console.log('Error in useAuthStore.js checkAuth: ', error);
            set({ authUser: null })
        }
        finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({ authUser: res.data });
            toast.success("Account created successfully")
        } catch (e) {
            const errorMessage = e.response?.data?.message || e.message || 'An error occurred during signup';
            toast.error(errorMessage);
            console.log('Error during signing up useAuthStore.js:', e);
        } finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ authUser: res.data });
            toast.success('Logged in successfully');
        } catch (e) {
            const errorMessage = e.response?.data?.message || e.message || 'An error occurred during login';
            toast.error(errorMessage);
            console.log('Error during login useAuthStore.js:', e);
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully');
            // Clear the jwt cookie
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // Navigate to login page
            window.location.href = '/login';
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred during logout';
            toast.error(errorMessage);
        }
    }
}))