import { useState, useEffect } from 'react';
import { fetchTodayCalendar } from '../services/calendarService';

export default function HijriCalendar() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const cal = await fetchTodayCalendar();
        setData(cal);
      } catch (err) {
        console.error(err);
        setError('Could not load calendar data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;

  const { hijri, gregorian, upcomingEvents } = data;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded space-y-6">
    <h2 className="text-2xl font-semibold">Today's Date</h2>

    <div className="grid grid-cols-2 gap-4">
    <div>
    <h3 className="font-medium">Gregorian</h3>
    <p>{gregorian.numeric.year}-{String(gregorian.numeric.month).padStart(2,'0')}-{String(gregorian.numeric.day).padStart(2,'0')}</p>
    </div>
    <div>
    <h3 className="font-medium">Hijri</h3>
    <p>{hijri.numeric.year}-{String(hijri.numeric.month).padStart(2,'0')}-{String(hijri.numeric.day).padStart(2,'0')}</p>
    </div>
    </div>

    <div>
    <h3 className="text-xl font-medium mt-4 mb-2">Upcoming Islamic Events</h3>
    {upcomingEvents.length > 0 ? (
      <ul className="space-y-2">
      {upcomingEvents.map(ev => (
        <li key={ev.hijriDate}>
        {ev.name} — {ev.hijriDate}
        </li>
      ))}
      </ul>
    ) : (
      <p>No major upcoming events soon.</p>
    )}
    </div>
    </div>
  );
}
