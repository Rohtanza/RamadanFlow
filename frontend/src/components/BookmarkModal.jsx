
import React from 'react';

export default function BookmarkModal({ isOpen, onClose, onSave, category, setCategory, note, setNote }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-white mb-4">Add Bookmark</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="Study">Study</option>
              <option value="Memorization">Memorization</option>
              <option value="Favorite">Favorite</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-2">Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
              rows="4"
              placeholder="Add notes about this bookmark..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 