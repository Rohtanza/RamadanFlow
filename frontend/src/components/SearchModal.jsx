import React from 'react';

export default function SearchModal({ isOpen, onClose, results, onResultClick }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">Search Results</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600"
              onClick={() => onResultClick(result)}
            >
              <div className="flex justify-between items-start">
                <span className="text-white font-semibold">
                  {result.surahName} {result.surah}:{result.ayah}
                </span>
                <span className="text-gray-400">{result.revelationType}</span>
              </div>
              <p className="text-white text-right mt-2">{result.text}</p>
              <p className="text-gray-300 mt-2">{result.translation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 