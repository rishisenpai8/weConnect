import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { axiosInstance } from './lib/axios.js';
import { useAuthStore } from './store/useAuthStore.js';

import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <Routes>
        <Route
          path='/'
          element={authUser ? <HomePage /> : <Navigate to="/login" state={{ from: location }} replace />}
        />
        <Route
          path='/signup'
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path='/login'
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path='/settings'
          element={authUser ? <SettingsPage /> : <Navigate to="/login" state={{ from: location }} replace />}
        />
        <Route
          path='/profile'
          element={authUser ? <ProfilePage /> : <Navigate to="/login" state={{ from: location }} replace />}
        />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App  