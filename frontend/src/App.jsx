import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';  

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrayerTimes from './pages/PrayerTimes';
import SalahTracker from './pages/SalahTracker';
import QuranReader from './pages/QuranReader';
import AzkarLibrary from './pages/AzkarLibrary';
import TasbihCounter from './pages/TasbihCounter';
import HijriCalendar from './pages/HijriCalendar';
import LibraryPage from './pages/LibraryPage';

import { useAuth } from './context/AuthContext';

function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="281920266514-33embptdvinecscinirfe8rkl9676o5i.apps.googleusercontent.com"> 
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All routes below require auth */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prayer" element={<PrayerTimes />} />
          <Route path="/salah" element={<SalahTracker />} />
          <Route path="/quran" element={<QuranReader />} />
          <Route path="/tasbih" element={<TasbihCounter />} />
          <Route path="/calendar" element={<HijriCalendar />} />
          <Route path="/azkar" element={<AzkarLibrary />} />
          <Route path="/library" element={<LibraryPage />} />
          {/* add more protected pages here */}
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}
