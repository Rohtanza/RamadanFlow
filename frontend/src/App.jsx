// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Notification from './components/Notification';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import Chat from './components/Chat/Chat';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';

import Dashboard       from './pages/Dashboard';
import PrayerTimes     from './pages/PrayerTimes';
import SalahTracker    from './pages/SalahTracker';
import QuranReader     from './pages/QuranReader';
import AzkarLibrary    from './pages/AzkarLibrary';
import TasbihCounter   from './pages/TasbihCounter';
import HijriCalendar   from './pages/HijriCalendar';
import LibraryPage     from './pages/LibraryPage';
import RamadanGoals    from './pages/RamadanGoals';

import { useAuth }     from './context/AuthContext';

function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1 flex flex-col pt-20 md:pt-24">
              <Routes>
                {/* Public */}
                <Route path="/login"           element={<Login />} />
                <Route path="/register"        element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Private */}
                <Route element={<PrivateRoute />}>
                  <Route path="/"             element={<Dashboard />} />
                  <Route path="/prayer"       element={<PrayerTimes />} />
                  <Route path="/salah"        element={<SalahTracker />} />
                  <Route path="/quran"        element={<QuranReader />} />
                  <Route path="/azkar"        element={<AzkarLibrary />} />
                  <Route path="/tasbih"       element={<TasbihCounter />} />
                  <Route path="/calendar"     element={<HijriCalendar />} />
                  <Route path="/library"      element={<LibraryPage />} />
                  <Route path="/ramadan"      element={<RamadanGoals />} />
                  <Route path="/chat"         element={<Chat />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
