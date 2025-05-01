import { useState, useEffect } from 'react';
import {
  listCounters,
  createCounter,
  incrementCounter,
  resetCounter,
  deleteCounter
} from '../services/tasbihService';

export default function TasbihCounter() {
  const [counters, setCounters] = useState([]);
  const [name, setName]       = useState('');
  const [target, setTarget]   = useState(33);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Load counters
  useEffect(() => {
    async function load() {
      try {
        const data = await listCounters();
        setCounters(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load counters');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Add new counter
  const handleAdd = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const newCtr = await createCounter(name.trim(), target);
      setCounters(prev => [...prev, newCtr]);
      setName('');
      setTarget(33);
    } catch (err) {
      console.error(err);
      setError('Could not create counter');
    }
  };

  // Increment, reset, delete handlers
  const handleInc = async id => {
    try {
      const updated = await incrementCounter(id);
      setCounters(prev => prev.map(c => c._id === id ? updated : c));
    } catch {
      setError('Increment failed');
    }
  };
  const handleReset = async id => {
    try {
      const updated = await resetCounter(id);
      setCounters(prev => prev.map(c => c._id === id ? updated : c));
    } catch {
      setError('Reset failed');
    }
  };
  const handleDelete = async id => {
    try {
      await deleteCounter(id);
      setCounters(prev => prev.filter(c => c._id !== id));
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Tasbih Counters</h2>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex space-x-2">
        <input
          type="text"
          placeholder="Counter Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Target"
          value={target}
          onChange={e => setTarget(Number(e.target.value))}
          className="w-20 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add
        </button>
      </form>

      {/* Counters List */}
      <ul className="space-y-4">
        {counters.map(ct => (
          <li
            key={ct._id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <p className="font-medium">{ct.name}</p>
              <p className="text-sm text-gray-600">
                {ct.count} / {ct.target}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleInc(ct._id)}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                +1
              </button>
              <button
                onClick={() => handleReset(ct._id)}
                className="px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Reset
              </button>
              <button
                onClick={() => handleDelete(ct._id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {counters.length === 0 && <p>No counters yet.</p>}
      </ul>
    </div>
  );
}
