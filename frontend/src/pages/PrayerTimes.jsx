import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';

export default function PrayerTimes() {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        const res = await fetch('http://localhost:5000/api/prayer/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(res);
        if (res.ok) {
          setTimes(await res.json());
          console.log(times);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        Prayer Times {times?.city && `in ${times.city}`}
      </h2>
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
