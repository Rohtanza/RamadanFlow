// frontend/src/pages/LibraryPage.jsx
import { useState, useEffect } from 'react';
import {
  fetchBooks,
  fetchChapters,
  fetchChapterHadiths,
  searchHadiths,
  addFavorite,
  removeFavorite
} from '../services/libraryService';

export default function LibraryPage() {
  const [books, setBooks]         = useState([]);
  const [edition, setEdition]     = useState('');
  const [chapters, setChapters]   = useState([]);
  const [chapter, setChapter]     = useState('');
  const [hadiths, setHadiths]     = useState([]);
  const [query, setQuery]         = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  /* ------------ load book list ------------ */
  useEffect(() => {
    fetchBooks().then(setBooks).catch(e => setError(e.message));
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchBooks();
        console.log("Fetched books:", result); // ✅ log here
        setBooks(result);
      } catch (e) {
        setError(e.message);
      }
    };
  
    fetchData();
  }, []);
  

  /* ------------ when edition changes ------------ */
  useEffect(() => {
    if (!edition) return;
    setLoading(true);
    fetchChapters(edition)
    .then(setChapters)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, [edition]);

  /* ------------ when chapter changes ------------ */
  useEffect(() => {
    if (!chapter) return;
    setLoading(true);
    fetchChapterHadiths(edition, chapter)
    .then(setHadiths)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, [chapter]);

  /* ------------ search ------------ */
  const doSearch = async e => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try   { setHadiths(await searchHadiths(edition, chapter, query)); }
    catch (e){ setError(e.message); }
    finally { setLoading(false); }
  };

  /* ------------ favourite toggle ------------ */
  const toggleFavorite = async h => {
    const existing = favorites.find(f => f.number === h.hadithNumber);
    if (existing) {
      await removeFavorite(existing._id);
      setFavorites(fav => fav.filter(f => f._id !== existing._id));
    } else {
      const fav = await addFavorite({
        edition,
        chapter,
        number : h.hadithNumber,
        hadith : h
      });
      setFavorites(favList => [...favList, fav]);
    }
  };

  /* ============================================================ */
  return (
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Hadith Library</h1>

    {error && <p className="text-red-600">{error}</p>}

    {/* ---- edition picker ---- */}
    <select
    id="edition"
    value={edition}
    onChange={e => { setEdition(e.target.value); setChapter(''); }}
    className="border p-2 mb-4 w-full md:w-1/3"
    >
    <option value="">Select Book</option>
    {books.map(b => (
      <option key={b.edition} value={b.edition}>
      {b.name} ({b.language})
      </option>
    ))}
    </select>

    {/* ---- chapter picker ---- */}
    {chapters.length > 0 && (
      <select
      id="chapter"
      value={chapter}
      onChange={e => setChapter(e.target.value)}
      className="border p-2 mb-4 w-full md:w-1/3"
      >
      <option value="">Select Chapter</option>
      {chapters.map(c => (
        <option key={c.number} value={c.number}>
        {c.number}. {c.title}
        </option>
      ))}
      </select>
    )}

    {/* ---- search ---- */}
    {chapter && (
      <form onSubmit={doSearch} className="mb-4">
      <input
      type="text"
      placeholder="Search this chapter…"
      value={query}
      onChange={e => setQuery(e.target.value)}
      className="border p-2 w-2/3 md:w-1/3"
      />
      <button className="ml-2 px-4 py-2 border">Search</button>
      </form>
    )}

    {/* ---- loading ---- */}
    {loading && <p>Loading…</p>}

    {/* ---- hadith list ---- */}
    {hadiths.map(h => (
      <div key={h.hadithNumber} className="border p-4 mb-4 rounded">
      <div className="flex justify-between items-center">
      <strong>Hadith #{h.hadithNumber}</strong>
      <button
      onClick={() => toggleFavorite(h)}
      className="text-yellow-500"
      >
      {favorites.some(f => f.number === h.hadithNumber)
        ? '★ Remove'
    : '☆ Add'}
    </button>
    </div>

    {/* Arabic */}
    {h.arabicText && (
      <p className="mt-2 text-right font-serif">{h.arabicText}</p>
    )}

    {/* Any available translation */}
    {h.englishText && <p className="mt-2">{h.englishText}</p>}
    {h.urduText    && <p className="mt-2">{h.urduText}</p>}
    {(!h.englishText && !h.urduText && !h.arabicText) && h.text && (
      <p className="mt-2">{h.text}</p>
    )}
    </div>
    ))}
    </div>
  );
}
