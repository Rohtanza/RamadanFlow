import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { HiOutlineDownload, HiOutlineLogout } from 'react-icons/hi';
import { getToken } from '../services/authService';

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadActivity = async () => {
    console.log('Download activity button clicked');
    try {
      setIsLoading(true);
      const token = getToken();
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        addNotification('Please login again to download your activity', 'error');
        return;
      }

      console.log('Making request to:', `${import.meta.env.VITE_API_URL}/auth/activity`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/activity`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if your backend uses them
      });
      console.log('Response status:', response.status);

      if (response.status === 401) {
        addNotification('Session expired. Please login again.', 'error');
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format the data for better readability
      const formattedData = data.map(activity => ({
        action: activity.action,
        details: activity.details,
        timestamp: new Date(activity.timestamp).toLocaleString(),
      }));

      const blob = new Blob([JSON.stringify(formattedData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addNotification('Activity log downloaded successfully', 'success');
    } catch (error) {
      console.error('Download activity error:', error);
      addNotification(error.message || 'Failed to download activity log', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-semibold text-lg">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          
          <button
            onClick={handleDownloadActivity}
            disabled={isLoading}
            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center space-x-2 transition-colors duration-150 disabled:opacity-50"
          >
            <HiOutlineDownload className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Downloading...' : 'Download Activity'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 flex items-center space-x-2 transition-colors duration-150"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu; 