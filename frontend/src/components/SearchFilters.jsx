import React from 'react';

export default function SearchFilters({ filters, setFilters, juzList, rukuList, revelationTypes }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-4">
      <h4 className="text-white font-semibold">Filters</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Juz Filter */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Juz</label>
          <select
            value={filters.juz}
            onChange={(e) => setFilters({ ...filters, juz: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white"
          >
            <option value="">All Juz</option>
            {juzList.map(juz => (
              <option key={juz.number} value={juz.number}>
                Juz {juz.number} - {juz.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ruku Filter */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Ruku</label>
          <select
            value={filters.ruku}
            onChange={(e) => setFilters({ ...filters, ruku: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white"
          >
            <option value="">All Ruku</option>
            {rukuList.map(ruku => (
              <option key={ruku.number} value={ruku.number}>
                Ruku {ruku.number}
              </option>
            ))}
          </select>
        </div>

        {/* Revelation Type Filter */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Revelation Type</label>
          <select
            value={filters.revelationType}
            onChange={(e) => setFilters({ ...filters, revelationType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white"
          >
            <option value="">All Types</option>
            {revelationTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Verses Range */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">Number of Verses</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minVerses}
              onChange={(e) => setFilters({ ...filters, minVerses: e.target.value })}
              className="w-1/2 px-3 py-2 rounded-lg bg-gray-600 text-white"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxVerses}
              onChange={(e) => setFilters({ ...filters, maxVerses: e.target.value })}
              className="w-1/2 px-3 py-2 rounded-lg bg-gray-600 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 