import { useState, useEffect } from 'react';
import {
  getProgress,
  setProgress,
  fetchSurah,
  fetchAudioUrl
} from '../services/quranService';

export default function QuranReader() {
  const [surahNum, setSurahNum] = useState(1);
  const [ayahNum, setAyahNum] = useState(1);
  const [surahData, setSurahData] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load bookmark & surah on mount
  useEffect(() => {
    async function init() {
      try {
        const prog = await getProgress();
        if (prog) {
          setSurahNum(prog.surah);
          setAyahNum(prog.ayah);
        }
        const data = await fetchSurah(prog?.surah || 1);
        setSurahData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load Quran data.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load audio URL whenever surahNum or ayahNum changes
  useEffect(() => {
    async function loadAudio() {
      try {
        const url = await fetchAudioUrl(surahNum, ayahNum);
        setAudioUrl(url);
      } catch (err) {
        console.error(err);
      }
    }
    if (!loading) loadAudio();
  }, [surahNum, ayahNum, loading]);

  // Handler to navigate ayahs
  const navigate = async (direction) => {
    if (!surahData) return;
    let nextSurah = surahNum;
    let nextAyah = ayahNum + (direction === 'next' ? 1 : -1);

    if (nextAyah > surahData.numberOfAyahs) {
      nextSurah = Math.min(114, surahNum + 1);
      nextAyah = 1;
    }
    if (nextAyah < 1) {
      nextSurah = Math.max(1, surahNum - 1);
      // will fetch that surah’s ayah count next
      const prevSurahData = await fetchSurah(nextSurah);
      nextAyah = prevSurahData.numberOfAyahs;
    }

    setLoading(true);
    try {
      // Update backend bookmark
      await setProgress(nextSurah, nextAyah);
      // Update state
      setSurahNum(nextSurah);
      setAyahNum(nextAyah);
      // If changed surah, refetch surah text
      if (nextSurah !== surahNum) {
        const newData = await fetchSurah(nextSurah);
        setSurahData(newData);
      }
    } catch (err) {
      console.error(err);
      setError('Navigation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !surahData) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  const currentAyah = surahData.ayahs.find(a => a.numberInSurah === ayahNum);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        {surahData.englishName} ({surahNum}:{ayahNum})
      </h2>
      <p className="text-3xl leading-relaxed text-right">{currentAyah.text}</p>
      <p className="italic mt-4">{currentAyah.translation || currentAyah.text}</p>

      <audio controls src={audioUrl} className="w-full mt-4" />

      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate('prev')}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => navigate('next')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
