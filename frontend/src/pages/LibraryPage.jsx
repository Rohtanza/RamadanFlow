import React, { useState, useEffect } from 'react';
import {
  fetchBooks,
  fetchChapters,
  fetchHadiths,
  fetchFavorites,
  addFavorite,
  removeFavorite
} from '../services/libraryService';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [slug, setSlug] = useState('');
  const [queryText, setQueryText] = useState('');
  const [chapters, setChapters] = useState([]);
  const [results, setResults] = useState(null); // null until search performed
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load: books + favorites
  useEffect(() => {
    (async () => {
      try {
        const [b, f] = await Promise.all([fetchBooks(), fetchFavorites()]);
        setBooks(b);
        setFavs(f);
      } catch (e) {
        console.error(e);
        setError('Failed to load library');
      }
    })();
  }, []);

  // Handle book selection -> load chapters
  const onBookSelect = async (e) => {
    const s = e.target.value;
    setSlug(s);
    setResults(null);
    setError('');
    if (s) {
      try {
        setLoading(true);
        const [ch, data] = await Promise.all([
          fetchChapters(s),
                                             fetchHadiths({ book: s })
        ]);
        setChapters(ch);
        setResults(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load hadiths for selected book');
        setChapters([]);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setChapters([]);
      setResults(null);
    }
  };

  // Perform search
  const onSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (queryText) params.hadithEnglish = queryText;
      if (slug) params.book = slug;
      const data = await fetchHadiths(params);
      setResults(data);
    } catch (e) {
      console.error(e);
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Favorite toggle
  const toggleFav = async (hadith) => {
    const exists = favs.find(
      f => f.bookSlug === hadith.bookSlug && f.hadithNumber === hadith.hadithNumber
    );
    try {
      if (exists) {
        await removeFavorite(exists._id);
        setFavs(prev => prev.filter(f => f._id !== exists._id));
      } else {
        const newFav = await addFavorite({
          bookSlug: hadith.bookSlug,
          hadithNumber: hadith.hadithNumber,
          hadith
        });
        setFavs(prev => [...prev, newFav]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
    <h1 className="text-2xl font-semibold">Dua & Hadith Library</h1>

    {error && <p className="text-red-500">{error}</p>}

    <div className="flex gap-4 items-end">
    <select
    onChange={onBookSelect}
    value={slug}
    className="border p-2"
    >
    <option value="">-- Select Book (optional) --</option>
    {books.map(b => (
      <option key={b.bookSlug} value={b.bookSlug}>
      {b.bookName}
      </option>
    ))}
    </select>

    <input
    type="text"
    placeholder="Search English..."
    className="border p-2 flex-1"
    value={queryText}
    onChange={e => setQueryText(e.target.value)}
    />

    <button
    onClick={onSearch}
    disabled={!queryText && !slug}
    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
    Search
    </button>
    </div>

    {loading && <p>Searching…</p>}

    {results === null ? null : (
      results.length === 0 ? (
        <p>No hadiths found.</p>
      ) : (
        <ul className="space-y-4">
        {results.map(h => {
          const isFav = favs.some(
            f => f.bookSlug === h.bookSlug && f.hadithNumber === h.hadithNumber
          );
          return (
            <li
            key={`${h.bookSlug}-${h.hadithNumber}`}
            className="border p-4 rounded"
            >
            <div className="flex justify-between">
            <strong>
            {h.bookSlug} #{h.hadithNumber}
            </strong>
            <button
            onClick={() => toggleFav(h)}
            className={isFav ? 'text-yellow-400' : 'text-gray-300'}
            >
            ★
            </button>
            </div>
            <p className="italic mt-1">{h.hadithArabic}</p>
            <p className="mt-2">{h.hadithEnglish}</p>
            </li>
          );
        })}
        </ul>
      )
    )}
    </div>
  );
}
