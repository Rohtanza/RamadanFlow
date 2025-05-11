// src/pages/TasbihCounter.jsx

import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  listCounters,
  createCounter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  updateCounter,
  deleteCounter,
  getCategories
} from '../services/tasbihService';
import NavBar from '../components/NavBar';

export default function TasbihCounter() {
  const { addNotification } = useNotification();
  const [counters, setCounters] = useState([]);
  const [categories, setCategories] = useState(['All', 'Morning', 'Evening', 'Prayer', 'Custom', 'Other']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [newName, setNewName] = useState('Remembrance');
  const [newTarget, setNewTarget] = useState(33);
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Other');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState(33);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('Other');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [countersData, categoriesData] = await Promise.all([
          listCounters(),
          getCategories()
        ]);
        setCounters(countersData);
        // Merge default categories with user's custom categories
        const allCategories = ['All', 'Morning', 'Evening', 'Prayer', 'Custom', 'Other'];
        const uniqueCategories = [...new Set([...allCategories, ...categoriesData])];
        setCategories(uniqueCategories);
      } catch (e) {
        console.error('Failed to load data', e);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateList = updated => setCounters(cs => cs.map(c => c._id === updated._id ? updated : c));
  const removeFromList = id => setCounters(cs => cs.filter(c => c._id !== id));

  // Create
  const handleCreate = async e => {
    e.preventDefault();
    try {
      const counter = await createCounter(newName, newTarget, newDescription, newCategory);
      setCounters([counter, ...counters]);
      setNewName('Remembrance');
      setNewTarget(33);
      setNewDescription('');
      setNewCategory('Other');
      addNotification(`Created new counter: ${newName}`, 'success');
    } catch (e) {
      console.error('Create failed', e);
      addNotification('Failed to create counter', 'error');
    }
  };

  // Increment
  const handleIncrement = async id => {
    try {
      const updated = await incrementCounter(id);
      updateList(updated);
      const counter = counters.find(c => c._id === id);
      if (updated.count === counter.target) {
        addNotification(`Congratulations! You've reached your target for ${counter.name}`, 'success');
      }
      if (updated.streak > 0 && updated.streak % 7 === 0) {
        addNotification(`Amazing! You've maintained a ${updated.streak}-day streak for ${counter.name}!`, 'success');
      }
    } catch (e) {
      console.error('Increment failed', e);
      addNotification('Failed to increment counter', 'error');
    }
  };

  // Decrement
  const handleDecrement = async id => {
    try {
      const updated = await decrementCounter(id);
      updateList(updated);
    } catch (e) {
      console.error('Decrement failed', e);
      addNotification('Failed to decrement counter', 'error');
    }
  };

  // Reset
  const handleReset = async id => {
    try {
      const updated = await resetCounter(id);
      updateList(updated);
      const counter = counters.find(c => c._id === id);
      addNotification(`Reset counter: ${counter.name}`, 'info');
    } catch (e) {
      console.error('Reset failed', e);
      addNotification('Failed to reset counter', 'error');
    }
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Delete this counter?')) return;
    try {
      const counter = counters.find(c => c._id === id);
      await deleteCounter(id);
      removeFromList(id);
      addNotification(`Deleted counter: ${counter.name}`, 'info');
    } catch (e) {
      console.error('Delete failed', e);
      addNotification('Failed to delete counter', 'error');
    }
  };

  // Start editing
  const startEdit = c => {
    setEditingId(c._id);
    setEditName(c.name);
    setEditTarget(c.target);
    setEditDescription(c.description || '');
    setEditCategory(c.category || 'Other');
  };

  // Save edit
  const saveEdit = async id => {
    try {
      const updated = await updateCounter(id, editName, editTarget, editDescription, editCategory);
      updateList(updated);
      setEditingId(null);
      addNotification(`Updated counter: ${editName}`, 'success');
    } catch (e) {
      console.error('Update failed', e);
      addNotification('Failed to update counter', 'error');
    }
  };

  // Filter counters by category
  const filteredCounters = selectedCategory === 'All' 
    ? counters 
    : counters.filter(c => c.category === selectedCategory);

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
    <div className="flex-1 w-full bg-cover bg-center relative" style={{ 
      backgroundImage: "url('/home-back.jpg')", 
      fontFamily: "'Poppins', sans-serif'" 
    }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70" />
      <div className="relative flex-1">
        <main className="relative z-10 w-full max-w-screen-xl mx-auto px-4 py-8">
          <div className="w-full max-w-4xl mx-auto p-8 bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl space-y-8">
            <h2 className="text-4xl font-extrabold text-white text-center">Tasbih Counters</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-gray-900 font-semibold'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* New Counter Form */}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Counter name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Target"
                  value={newTarget}
                  onChange={e => setNewTarget(Number(e.target.value))}
                  min={1}
                  className="px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
                />
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white bg-opacity-20 text-white focus:outline-none"
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category} className="text-gray-900">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-medium shadow-lg transition"
              >
                Add Counter
              </button>
            </form>

            {/* Counters Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredCounters.map(c => (
                <div key={c._id} className="bg-gray-700 bg-opacity-80 rounded-2xl p-6 shadow-inner space-y-4 hover:bg-opacity-90 transition-all duration-300">
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
                        min={1}
                        className="w-full px-3 py-2 rounded-lg text-gray-900"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 rounded-lg text-gray-900"
                      />
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-gray-900"
                      >
                        {categories.filter(cat => cat !== 'All').map(category => (
                          <option key={category} value={category} className="text-gray-900">
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(c._id)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-white">{c.name}</h3>
                            <span className="inline-block px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded-full">
                              {c.category}
                            </span>
                          </div>
                          {c.description && (
                            <p className="text-gray-300 text-sm">{c.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Edit counter"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Delete counter"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-400 bg-yellow-900 bg-opacity-50">
                              Progress
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-yellow-400">
                              {Math.round((c.count / c.target) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                          <div
                            style={{ width: `${Math.min((c.count / c.target) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500 transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="text-4xl font-bold text-white">
                            {c.count}
                          </div>
                          <div className="text-gray-400">/</div>
                          <div className="text-2xl text-gray-400">{c.target}</div>
                        </div>

                        {c.streak > 0 && (
                          <div className="flex items-center justify-center space-x-2 text-yellow-400">
                            <span className="text-xl">🔥</span>
                            <span className="text-sm font-medium">{c.streak} day streak</span>
                          </div>
                        )}

                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleDecrement(c._id)}
                            className="w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Decrement"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReset(c._id)}
                            className="w-12 h-12 flex items-center justify-center bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors shadow-lg"
                            title="Reset"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleIncrement(c._id)}
                            className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
                            title="Increment"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
