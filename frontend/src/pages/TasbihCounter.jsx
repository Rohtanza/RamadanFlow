// src/pages/TasbihCounter.jsx

import React, { useState, useEffect } from 'react';
import {
  listCounters,
  createCounter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  updateCounter,
  deleteCounter
} from '../services/tasbihService';
import NavBar from '../components/NavBar';

export default function TasbihCounter() {
  const [counters, setCounters]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [newName, setNewName]     = useState('Remembrance');
  const [newTarget, setNewTarget] = useState(33);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');
  const [editTarget, setEditTarget] = useState(33);

  // Load initial list
  useEffect(() => {
    (async () => {
      try {
        const data = await listCounters();
        setCounters(data);
      } catch (e) {
        console.error('Failed to load counters', e);
        setError('Failed to load counters');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateList     = updated => setCounters(cs => cs.map(c => c._id === updated._id ? updated : c));
  const removeFromList = id      => setCounters(cs => cs.filter(c => c._id !== id));

  // Create
  const handleCreate = async e => {
    e.preventDefault();
    try {
      const counter = await createCounter(newName, newTarget);
      setCounters([counter, ...counters]);
      setNewName('Remembrance');
      setNewTarget(33);
    } catch (e) {
      console.error('Create failed', e);
      alert(`Create error: ${e.message}`);
    }
  };

  // Increment
  const handleIncrement = async id => {
    try {
      const updated = await incrementCounter(id);
      updateList(updated);
    } catch (e) {
      console.error('Increment failed', e);
      alert(`Increment error: ${e.message}`);
    }
  };

  // Decrement
  const handleDecrement = async id => {
    try {
      const updated = await decrementCounter(id);
      updateList(updated);
    } catch (e) {
      console.error('Decrement failed', e);
      alert(`Decrement error: ${e.message}`);
    }
  };

  // Reset
  const handleReset = async id => {
    try {
      const updated = await resetCounter(id);
      updateList(updated);
    } catch (e) {
      console.error('Reset failed', e);
      alert(`Reset error: ${e.message}`);
    }
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Delete this counter?')) return;
    try {
      await deleteCounter(id);
      removeFromList(id);
    } catch (e) {
      console.error('Delete failed', e);
      alert(`Delete error: ${e.message}`);
    }
  };

  // Start editing
  const startEdit = c => {
    setEditingId(c._id);
    setEditName(c.name);
    setEditTarget(c.target);
  };

  // Save edit
  const saveEdit = async id => {
    try {
      const updated = await updateCounter(id, editName, editTarget);
      updateList(updated);
      setEditingId(null);
    } catch (e) {
      console.error('Update failed', e);
      alert(`Update error: ${e.message}`);
    }
  };

  if (loading) {
    return <>
    <NavBar />
    <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
    <p className="text-white text-2xl animate-pulse">Loading...</p>
    </div>
    </>;
  }

  if (error) {
    return <>
    <NavBar />
    <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
    <p className="bg-red-600 bg-opacity-75 p-4 rounded text-white text-xl">{error}</p>
    </div>
    </>;
  }

  return (
    <>
    <NavBar />
    <div
    className="min-h-screen w-full relative flex items-center justify-center bg-cover bg-center pt-20"
    style={{ backgroundImage: "url('/home-back.jpg')", fontFamily: "'Poppins', sans-serif" }}
    >
    <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70" />
    <div className="relative z-10 w-full max-w-4xl p-8 bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl space-y-8">
    <h2 className="text-4xl font-extrabold text-white text-center">Tasbih Counters</h2>

    {/* New Counter Form */}
    <form onSubmit={handleCreate} className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
    <input
    type="text"
    placeholder="Counter name"
    value={newName}
    onChange={e => setNewName(e.target.value)}
    className="flex-grow px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
    required
    />
    <input
    type="number"
    placeholder="Target"
    value={newTarget}
    onChange={e => setNewTarget(Number(e.target.value))}
    min={1}
    className="w-24 px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
    />
    <button
    type="submit"
    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-medium shadow-lg transition"
    >
    Add
    </button>
    </form>

    {/* Counters Grid */}
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
    {counters.map(c => (
      <div key={c._id} className="bg-gray-700 bg-opacity-80 rounded-2xl p-6 shadow-inner space-y-4">
      {editingId === c._id ? (
        <>
        <input
        value={editName}
        onChange={e => setEditName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-gray-900"
        />
        <input
        type="number"
        value={editTarget}
        onChange={e => setEditTarget(Number(e.target.value))}
        className="w-24 px-3 py-2 rounded-lg text-gray-900"
        />
        <div className="flex justify-end space-x-2">
        <button onClick={() => saveEdit(c._id)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Save</button>
        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
        </div>
        </>
      ) : (
        <>
        <div className="flex justify-between items-center">
        <p className="text-white text-2xl font-semibold">{c.name}</p>
        <p className="text-yellow-300 text-3xl font-bold">{c.count}</p>
        </div>
        <div className="flex justify-center items-center space-x-6">
        <button onClick={() => handleDecrement(c._id)} className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
        </svg>
        </button>
        <button onClick={() => handleIncrement(c._id)} className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
        </button>
        </div>
        <div className="flex justify-between items-center">
        <button onClick={() => handleReset(c._id)} className="text-gray-300 hover:text-white">Reset</button>
        <div className="space-x-4 text-sm">
        <button onClick={() => startEdit(c)} className="text-blue-400 hover:underline">Edit</button>
        <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline">Delete</button>
        </div>
        </div>
        <p className="text-gray-400">Target: {c.target}</p>
        </>
      )}
      </div>
    ))}
    </div>
    </div>
    </div>
    </>
  );
}
