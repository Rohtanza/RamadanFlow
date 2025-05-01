import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';

export default function PrayerTimes() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  // Load saved settings + today's times on mount
  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        // 1) Fetch saved settings
        const resSett = await fetch('http://localhost:5000/api/prayer/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resSett.ok) {
          const data = await resSett.json();
          if (data) {
            setLat(data.latitude);
            setLon(data.longitude);
          }
        }

        // 2) Fetch today's prayer times
        const resTimes = await fetch('http://localhost:5000/api/prayer/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resTimes.ok) {
          setTimes(await resTimes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Save new settings and refresh times
  const handleSave = async e => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const token = getToken();
      await fetch('http://localhost:5000/api/prayer/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        })
      });
      setStatus('Fetching updated times…');
      const resp = await fetch('http://localhost:5000/api/prayer/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimes(await resp.json());
      setStatus('Updated!');
    } catch {
      setStatus('Error saving settings.');
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Prayer Times</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={e => setLat(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lon}
            onChange={e => setLon(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Save & Refresh
        </button>
      </form>

      {status && <p className="text-sm text-gray-600">{status}</p>}

      {times && (
        <div className="mt-6 bg-gray-50 p-4 rounded shadow">
          <h3 className="text-xl mb-2">Times for {times.date}</h3>
          <ul className="space-y-1">
            <li>Fajr: {times.fajr}</li>
            <li>Dhuhr: {times.dhuhr}</li>
            <li>Asr: {times.asr}</li>
            <li>Maghrib: {times.maghrib}</li>
            <li>Isha: {times.isha}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
