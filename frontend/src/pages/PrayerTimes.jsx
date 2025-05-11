// src/pages/PrayerTimes.jsx

import React, { useState, useEffect, useCallback } from 'react'
import { getToken } from '../services/authService'
import ReactMapGL, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Chart from 'react-apexcharts'
import { FaMapMarkerAlt, FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import NavBar from '../components/NavBar'
import { useNotification } from '../context/NotificationContext'
import { usePrayerState } from '../hooks/usePrayerState'
import { formatDate, getCurrentDate } from '../utils/dateUtils'

const API_BASE = 'http://localhost:5000/api'
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_LABELS = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
}
const LABELS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9odGFuemEiLCJhIjoiY21hZmw1ZGNyMDN0cjJscHpmdnZjc3pwbSJ9.VOaCR6r_3XFUZvNEiuLBKQ'
const DEFAULT_LOCATION = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: 'Mecca'
}

// Motivational quotes
const QUOTES = [
  'Consistency is the key to success!',
  'Every prayer brings you closer to peace.',
  'Small steps every day lead to big results.',
  'Your streak is your strength!',
  'Keep going, you are doing great!'
]

// Simple date parser
function parseDate(dateString) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Simplified location name function with better error handling
async function getLocationName(lat, lon) {
  try {
    // First try Mapbox Geocoding
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place`,
      {
        timeout: 5000
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].text;
      }
    }

    // If Mapbox fails, try OpenStreetMap
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'Prayer Times App'
        }
      }
    );
    
    if (osmResponse.ok) {
      const osmData = await osmResponse.json();
      return osmData.address?.city || osmData.address?.town || osmData.address?.village;
    }

    // If both fail, return coordinates
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.warn('Failed to get location name:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

export default function PrayerTimes() {
  const { addNotification } = useNotification();
  const token = getToken();
  const [formattedWeeklyStats, setFormattedWeeklyStats] = useState([]);
  const [formattedMonthlyStats, setFormattedMonthlyStats] = useState([]);

  const {
    coords,
    setCoords,
    city,
    setCity,
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
    togglePrayer,
    updatePrayerTimes
  } = usePrayerState();

  const [viewport, setViewport] = useState({
    latitude: coords?.latitude || DEFAULT_LOCATION.latitude,
    longitude: coords?.longitude || DEFAULT_LOCATION.longitude,
    zoom: 12
  });
  
  const [motivational] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Debug logging
  useEffect(() => {
    console.log('PrayerTimes state:', {
      coords,
      city,
      times,
      logs,
      loading,
      error
    });
  }, [coords, city, times, logs, loading, error]);

  // Format dates for stats
  useEffect(() => {
    if (!weeklyStats?.length || !monthlyStats?.length) return;

    console.log('Formatting stats:', { weeklyStats, monthlyStats });

    // Format weekly stats
    const formattedWeekly = weeklyStats.map((stat) => {
      const date = parseDate(stat.date);
      return {
        ...stat,
        formattedDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });
    setFormattedWeeklyStats(formattedWeekly);

    // Format monthly stats
    const formattedMonthly = monthlyStats.map((stat) => {
      const date = parseDate(stat.date);
      return {
        ...stat,
        formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });
    setFormattedMonthlyStats(formattedMonthly);
  }, [weeklyStats, monthlyStats]);

  // Handle map click
  const handleMapClick = async (e) => {
    if (e.lngLat) {
      const newCoords = { 
        latitude: e.lngLat.lat, 
        longitude: e.lngLat.lng 
      };
      console.log('Map clicked:', newCoords);
      setCoords(newCoords);
      await updatePrayerTimes(newCoords);
    }
  };

  // Update viewport when coords change
  useEffect(() => {
    if (coords) {
      console.log('Updating viewport with coords:', coords);
      setViewport(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
    }
  }, [coords]);

  // Loading state with debug info
  if (loading) {
    console.log('Rendering loading state');
    return (
    <>
      <NavBar />
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-cover bg-center" style={{ backgroundImage: "url('/home-back.jpg')" }}>
          <p className="text-white text-2xl animate-pulse mb-4">Loading your dashboard...</p>
          <p className="text-white text-sm opacity-75">
            {coords ? `Location: ${coords.latitude}, ${coords.longitude}` : 'Getting location...'}
          </p>
      </div>
    </>
    );
  }

  // Error state with debug info
  if (error) {
    console.error('Rendering error state:', error);
    return (
    <>
      <NavBar />
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-cover bg-center" style={{ backgroundImage: "url('/home-back.jpg')" }}>
          <div className="bg-red-600 bg-opacity-75 p-6 rounded-lg text-white">
            <p className="text-xl mb-2">Error loading dashboard</p>
            <p className="text-sm opacity-75">{error}</p>
            {coords && (
              <p className="text-sm mt-2">
                Last known location: {coords.latitude}, {coords.longitude}
              </p>
            )}
          </div>
      </div>
    </>
    );
  }

  const prayerTimesChart = {
    options: {
      chart: { type: 'bar', background: 'transparent', foreColor: '#fff' },
      plotOptions: { bar: { borderRadius: 4, horizontal: false,
        dataLabels: { position: 'top' }
      } },
      dataLabels: {
        enabled: true,
        formatter: function (val) { return Math.round(val); },
        offsetY: -20,
        style: { fontSize: '14px', colors: ['#fff'] }
      },
      xaxis: { categories: LABELS },
      yaxis: {
        title: { text: 'Hour of Day' },
        min: 0,
        max: 24,
        labels: { formatter: val => Math.round(val) }
      },
      theme: { mode: 'dark' },
      tooltip: { theme: 'dark', y: { formatter: val => Math.round(val) } }
    },
    series: [{ name: 'Prayer Time', data: PRAYERS.map(p => { const [h, m] = (times[p] || '0:00').split(':').map(Number); return Math.round(h + m / 60); }) }]
  }

  const weeklyChart = {
    options: {
      chart: {
        type: 'area',
        background: 'transparent',
        foreColor: '#fff'
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        categories: formattedWeeklyStats.map(s => s.formattedDate),
        labels: {
          formatter: (value) => value || ''
        }
      },
      yaxis: {
        title: {
          text: 'Prayers Completed'
        },
        min: 0,
        max: 5,
        tickAmount: 5
      },
      theme: {
        mode: 'dark'
      },
      tooltip: {
        theme: 'dark',
        x: {
          formatter: (value) => {
            const stat = formattedWeeklyStats[value - 1];
            return stat?.fullDate || 'Unknown date';
          }
        },
        y: {
          formatter: (val) => `${val} prayers completed`
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      }
    },
    series: [{
      name: 'Prayers Completed',
      data: formattedWeeklyStats.map(s => s.completed)
    }]
  }

  const monthlyChart = {
    options: {
      chart: {
        type: 'heatmap',
        background: 'transparent',
        foreColor: '#fff'
      },
      dataLabels: {
        enabled: false
      },
      theme: {
        mode: 'dark'
      },
      tooltip: {
        theme: 'dark',
        x: {
          formatter: (value) => {
            const stat = formattedMonthlyStats.find(s => s.formattedDate === value);
            return stat?.fullDate || 'Unknown date';
          }
        },
        y: {
          formatter: (val, { seriesIndex }) => {
            const prayer = LABELS[seriesIndex];
            return val ? `${prayer} prayer completed` : `${prayer} prayer missed`;
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: formattedMonthlyStats.map(day => day.formattedDate),
        labels: {
          formatter: (value) => value || ''
        }
      },
      yaxis: {
        categories: LABELS
      },
      colors: [
        '#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800', '#FFD700'
      ]
    },
    series: PRAYERS.map((prayer, idx) => ({
      name: LABELS[idx],
      data: formattedMonthlyStats.map(day => {
        const prayerDetails = day.details?.find(d => d.name === prayer);
        return prayerDetails?.completed ? 1 : 0;
      })
    }))
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen w-full flex flex-col pt-2 bg-cover bg-center" style={{ backgroundImage: "url('/home-back.jpg')", fontFamily: "'Poppins', sans-serif" }}>
        <div className="container mx-auto px-4 py-1">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column - Map and Location */}
            <div className="lg:col-span-4">
              <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-4 h-full">
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-white mb-2">Prayer Location</h2>
                  <div className="flex items-center text-gray-300 mb-2">
                    <FaMapMarkerAlt className="mr-2 text-yellow-400" />
                    {city || (coords && `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`) || 'Location Unknown'}
                  </div>
                  <div className="flex-grow rounded-xl overflow-hidden border-2 border-yellow-400 shadow-lg mb-2" style={{ minHeight: "250px" }}>
                    {coords && (
                      <ReactMapGL
                        {...viewport}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
                        onMove={evt => setViewport(evt.viewState)}
                        onClick={handleMapClick}
                      >
                        <Marker 
                          longitude={coords.longitude} 
                          latitude={coords.latitude} 
                          color="#FFD700"
                        />
                      </ReactMapGL>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="text-gray-300 block mb-1">Calculation Method:</label>
                    <select 
                      value={method} 
                      onChange={e => setMethod(e.target.value)} 
                      className="w-full px-3 py-1.5 bg-gray-700 text-white rounded-lg focus:outline-none border border-gray-600 hover:border-yellow-400 transition-colors text-sm"
                    >
                      {[
                        { value: 'Karachi', label: 'Karachi (University of Islamic Sciences)' },
                        { value: 'ISNA', label: 'ISNA (Islamic Society of North America)' },
                        { value: 'MWL', label: 'MWL (Muslim World League)' },
                        { value: 'UmmAlQura', label: 'Umm Al-Qura University, Makkah' },
                        { value: 'Egyptian', label: 'Egyptian General Authority' },
                        { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
                        { value: 'Gulf', label: 'Gulf Region' },
                        { value: 'Kuwait', label: 'Kuwait' },
                        { value: 'Qatar', label: 'Qatar' },
                        { value: 'Singapore', label: 'Singapore' },
                        { value: 'Turkey', label: 'Turkey' },
                        { value: 'Dubai', label: 'Dubai' },
                        { value: 'Morocco', label: 'Morocco' }
                      ].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="text-base text-yellow-400 font-semibold">🔥 {streak} Day Streak</div>
                  <div className="text-xs text-gray-400 mt-1 italic">{motivational}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Prayer Times and Stats */}
            <div className="lg:col-span-8">
              {/* Today's Prayers */}
              <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-xl p-4 mb-4">
                <h3 className="text-xl text-white mb-3 text-center font-bold">
                  Today's Prayers <span className="text-yellow-400">({dailyCount}/{PRAYERS.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {PRAYERS.map((prayer) => (
                    <div key={prayer} className="flex flex-col items-center bg-gray-700 bg-opacity-50 rounded-xl p-3 hover:bg-opacity-70 transition-all">
                      <button
                        onClick={() => togglePrayer(prayer)}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition transform hover:scale-110 text-xl ${
                          logs.includes(prayer) 
                            ? 'bg-yellow-400 text-gray-900 shadow-lg hover:bg-yellow-500' 
                            : 'bg-gray-700 text-white border-2 border-gray-500 hover:bg-gray-600'
                        }`}
                        title={`${PRAYER_LABELS[prayer]} - Click to ${logs.includes(prayer) ? 'uncheck' : 'check'}`}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        ) : logs.includes(prayer) ? (
                          <FaCheckCircle className="transition-transform transform hover:scale-110" />
                        ) : (
                          <FaRegCircle className="transition-transform transform hover:scale-110" />
                        )}
                      </button>
                      <span className="text-sm text-white mt-2 font-semibold">{PRAYER_LABELS[prayer]}</span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {loading ? '--:--' : times[prayer] || '--:--'}
                      </span>
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="mt-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-center text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-gray-800 bg-opacity-90 p-4 rounded-2xl shadow-lg">
                  <h3 className="text-lg text-white mb-2 text-center font-bold">Weekly Progress</h3>
                  {formattedWeeklyStats.length > 0 && formattedWeeklyStats.some(day => day.completed > 0) ? (
                    <Chart options={weeklyChart.options} series={weeklyChart.series} type="area" height={200} />
                  ) : (
                    <div className="text-center text-gray-400 py-8 text-sm">No data for the last 7 days.</div>
                  )}
                </div>
                <div className="bg-gray-800 bg-opacity-90 p-4 rounded-2xl shadow-lg">
                  <h3 className="text-lg text-white mb-2 text-center font-bold">Prayer Times Distribution</h3>
                  <Chart options={prayerTimesChart.options} series={prayerTimesChart.series} type="bar" height={200} />
                </div>
              </div>

              {/* Monthly Heatmap */}
              <div className="bg-gray-800 bg-opacity-90 p-4 rounded-2xl shadow-lg mt-4">
                <h3 className="text-lg text-white mb-2 text-center font-bold">Monthly Prayer Heatmap</h3>
                {formattedMonthlyStats.length > 0 ? (
                  <Chart options={monthlyChart.options} series={monthlyChart.series} type="heatmap" height={180} />
                ) : (
                  <div className="text-center text-gray-400 py-8 text-sm">No data for the last 30 days.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
