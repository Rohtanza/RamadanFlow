import { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import Modal from '../components/Modal';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export default function SalahTracker() {
  const [todayLogs, setTodayLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, prayer: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = getToken();
  const today = formatDate(new Date());

  useEffect(() => {
    async function load() {
      try {
        const logRes = await fetch(
          `http://localhost:5000/api/salah/logs?start=${today}&end=${today}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const logData = await logRes.json();
        setTodayLogs(logData.map(l => l.prayer));
        const statsRes = await fetch(
          `http://localhost:5000/api/salah/stats?days=7`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(await statsRes.json());
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, today]);
  const performToggle = async (prayer) => {
    const body = JSON.stringify({ prayer, date: today });
    const opts = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body
    };

    try {
      if (todayLogs.includes(prayer)) {
        await fetch('http://localhost:5000/api/salah/log', {
          method: 'DELETE',
          ...opts
        });
      } else {
        await fetch('http://localhost:5000/api/salah/log', {
          method: 'POST',
          ...opts
        });
      }

      // Update UI optimistically
      setTodayLogs(prev =>
      prev.includes(prayer)
      ? prev.filter(p => p !== prayer)
      : [...prev, prayer]
      );

      // Refresh stats
      const statsRes = await fetch(
        `http://localhost:5000/api/salah/stats?days=7`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
      setError('Update failed.');
    }
  };

  // Handler for checkbox clicks
  const handleToggle = (prayer) => {
    if (todayLogs.includes(prayer)) {
      setConfirmModal({ isOpen: true, prayer });
    } else {
      performToggle(prayer);
    }
  };

  // Modal confirm/cancel handlers
  const onConfirm = () => {
    performToggle(confirmModal.prayer);
    setConfirmModal({ isOpen: false, prayer: '' });
  };
  const onCancel = () => {
    setConfirmModal({ isOpen: false, prayer: '' });
  };

  if (loading) return <p className="p-4">Loading…</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
    <h2 className="text-2xl font-semibold">Today's Prayers</h2>

    {/* Today's date and progress */}
    <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
    <div className="text-gray-700 font-medium">
    Date: {today}
    </div>
    <div className="text-gray-700 font-medium">
    Completed: {todayLogs.length} / {PRAYERS.length}
    </div>
    </div>

    {/* Prayer checkboxes */}
    <div className="grid grid-cols-2 gap-4 mt-4">
    {PRAYERS.map(prayer => (
      <label key={prayer} className="flex items-center space-x-2">
      <input
      type="checkbox"
      checked={todayLogs.includes(prayer)}
      onChange={() => handleToggle(prayer)}
      className="h-5 w-5"
      />
      <span className="capitalize">{prayer}</span>
      </label>
    ))}
    </div>

    <h2 className="text-2xl font-semibold mt-8">Last 7 Days</h2>
    <table className="w-full text-left border-collapse">
    <thead>
    <tr>
    <th className="border-b px-4 py-2">Date</th>
    <th className="border-b px-4 py-2">Prayers Done</th>
    </tr>
    </thead>
    <tbody>
    {stats.map(({ date, completed }) => (
      <tr key={date}>
      <td className="px-4 py-2">{date}</td>
      <td className="px-4 py-2">{completed} / {PRAYERS.length}</td>
      </tr>
    ))}
    </tbody>
    </table>

    {/* Confirmation Modal */}
    <Modal
    isOpen={confirmModal.isOpen}
    title="Confirm Uncheck"
    onConfirm={onConfirm}
    onCancel={onCancel}
    >
    Are you sure you want to mark <strong>{confirmModal.prayer}</strong> as not done today?
    </Modal>
    </div>
  );
}
