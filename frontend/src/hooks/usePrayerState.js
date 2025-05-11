import { useState, useEffect } from 'react';
import { getPrayerTimes, togglePrayer, getPrayerStats, getLocationName } from '../services/prayerService';

const DEFAULT_LOCATION = {
  latitude: 21.4225,
  longitude: 39.8262
};

export const usePrayerState = () => {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState('');
  const [times, setTimes] = useState({});
  const [logs, setLogs] = useState([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [method, setMethod] = useState('Karachi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);

  // Initialize geolocation
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000
          });
        });
        
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      } catch (err) {
        console.warn('Using default location:', err);
        setCoords(DEFAULT_LOCATION);
      }
    };

    initializeLocation();
  }, []);

  // Update prayer times when location or method changes
  useEffect(() => {
    if (coords) {
      updatePrayerTimes();
      updateLocationName();
    }
  }, [coords, method]);

  // Load stats periodically
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const updatePrayerTimes = async () => {
    try {
      setLoading(true);
      const data = await getPrayerTimes(coords.latitude, coords.longitude, method);
      setTimes(data.times);
      setLogs(data.completed || []);
      setDailyCount((data.completed || []).length);
      setError(null);
    } catch (err) {
      setError(err.msg || 'Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  };

  const updateLocationName = async () => {
    if (coords) {
      const name = await getLocationName(coords.latitude, coords.longitude);
      setCity(name);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading stats...');
      const weeklyData = await getPrayerStats(7);
      const monthlyData = await getPrayerStats(30);
      
      console.log('Stats loaded:', { weeklyData, monthlyData });
      
      setWeeklyStats(weeklyData);
      setMonthlyStats(monthlyData);
      
      // Calculate streak
      let currentStreak = 0;
      for (let i = monthlyData.length - 1; i >= 0; i--) {
        if (monthlyData[i].completed === 5) currentStreak++;
        else break;
      }
      setStreak(currentStreak);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleTogglePrayer = async (prayer) => {
    try {
      const updatedLogs = await togglePrayer(prayer);
      setLogs(updatedLogs.completed || []);
      setDailyCount((updatedLogs.completed || []).length);
      await loadStats(); // Refresh stats after toggle
    } catch (err) {
      setError(err.msg || 'Failed to update prayer status');
    }
  };

  return {
    coords,
    setCoords,
    city,
    times,
    logs,
    dailyCount,
    weeklyStats,
    monthlyStats,
    method,
    setMethod,
    loading,
    error,
    streak,
    togglePrayer: handleTogglePrayer
  };
}; 