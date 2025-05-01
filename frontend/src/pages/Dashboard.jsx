import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-6">
        <nav className="flex flex-col space-y-4">
          <Link to="/prayer" className="px-4 py-2 bg-blue-500 text-white rounded">
            Manage Prayer Times
          </Link>
          <Link to="/salah" className="px-4 py-2 bg-green-600 text-white rounded">
            Track Prayers
          </Link>
          <Link to="/quran" className="px-4 py-2 bg-purple-600 text-white rounded">
            Quran Reader
          </Link>
          <Link to="/azkar" className="px-4 py-2 bg-indigo-600 text-white rounded">
            Azkar & Duas
          </Link>
          <Link to="/tasbih" className="px-4 py-2 bg-pink-600 text-white rounded">
            Tasbih Counter
          </Link>
          <Link to="/calendar" className="px-4 py-2 bg-indigo-600 text-white rounded">
            Hijri Calendar
          </Link>
          <Link to="/library" className="px-4 py-2 bg-teal-600 text-white rounded">
            Dua & Hadith Library
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Noor ul Eman</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl mb-4">Welcome, {user.name}!</h2>
          <p className="mb-6">Your email: {user.email}</p>
          {/* Additional dashboard content can be added here */}
        </main>
      </div>
    </div>
  );
}
