import { useState } from 'react';
import { fetchAzkar } from '../services/azkarService';

const CATEGORIES = [
  { label: 'Morning Azkar',    value: 'morning' },
  { label: 'Evening Azkar',    value: 'evening' },
  { label: 'Post-Prayer Azkar', value: 'post-prayer' }
];

export default function AzkarLibrary() {
  const [category, setCategory] = useState('morning');
  const [azkarData, setAzkarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAzkar(category);
      setAzkarData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load Azkar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Azkar Library</h2>

      <div className="flex space-x-2">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="flex-1 p-2 border rounded"
        >
          {CATEGORIES.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Load
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {azkarData && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">{azkarData.title}</h3>
          <div className="space-y-4">
            {azkarData.content.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded shadow">
                <p className="mb-2 whitespace-pre-wrap">{item.zekr}</p>
                {item.repeat && <p className="text-sm text-gray-600">Repeat: {item.repeat} times</p>}
                {item.bless && <p className="text-sm italic text-gray-500 mt-1">{item.bless}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
