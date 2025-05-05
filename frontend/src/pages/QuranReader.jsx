import React, { useState, useEffect } from 'react'
import {
  getProgress,
  setProgress,
  fetchSurah
} from '../services/quranService'
import { SURAH_LIST } from '../data/surahList'
import NavBar from '../components/NavBar'

export default function QuranReader() {
  const [surahNum, setSurahNum] = useState(1)
  const [ayahNum, setAyahNum]   = useState(1)
  const [surahData, setSurahData] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [jumpValue, setJumpValue] = useState('')

  // initial load
  useEffect(() => {
    ;(async () => {
      try {
        const prog = await getProgress()
        const s = prog?.surah || 1
        const a = prog?.ayah   || 1
        setSurahNum(s)
        setAyahNum(a)
        setSurahData(await fetchSurah(s))
      } catch {
        setError('Could not load Quran')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const selectSurah = async num => {
    setLoading(true)
    try {
      await setProgress(num, 1)
      setSurahNum(num)
      setAyahNum(1)
      setSurahData(await fetchSurah(num))
    } catch {
      setError('Failed to load surah')
    } finally {
      setLoading(false)
    }
  }

  const navigateAyah = async dir => {
    if (!surahData) return
      let s = surahNum
      let a = ayahNum + (dir === 'next' ? 1 : -1)
      if (a > surahData.numberOfAyahs) { s++; a = 1 }
      if (a < 1) { s--; if (s < 1) return; a = surahData.numberOfAyahs }
      setLoading(true)
      try {
        await setProgress(s, a)
        setSurahNum(s)
        setAyahNum(a)
        setSurahData(await fetchSurah(s))
      } catch {
        setError('Navigation failed')
      } finally {
        setLoading(false)
      }
  }

  const handleJump = async e => {
    e.preventDefault()
    const v = Number(jumpValue)
    if (!surahData || !v || v < 1 || v > surahData.numberOfAyahs) return
      setAyahNum(v)
      await setProgress(surahNum, v)
      setJumpValue('')
  }

  if (loading) {
    return (
      <>
      <NavBar />
      <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <p className="text-white text-2xl animate-pulse">Loading...</p>
      </div>
      </>
    )
  }

  if (error) {
    return (
      <>
      <NavBar />
      <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <p className="bg-red-600 bg-opacity-75 p-4 rounded text-white text-xl">{error}</p>
      </div>
      </>
    )
  }

  const ayah = surahData.ayahs.find(a => a.numberInSurah === ayahNum)

  return (
    <>
    <NavBar />

    <div
    className="min-h-screen w-full relative bg-cover bg-center flex"
    style={{
      backgroundImage: "url('/home-back.jpg')",
          fontFamily: "'Poppins', sans-serif'"
    }}
    >
    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />

    {/* Sidebar: fixed directly under NavBar */}
    <aside className="fixed top-0 left-0 bottom-0 w-64 z-10 bg-gray-800 bg-opacity-70 backdrop-blur-md p-6 pt-20 overflow-auto no-scrollbar">
    <h2 className="text-xl font-bold text-white mb-4">Surahs</h2>
    <ul className="space-y-2">
    {SURAH_LIST.map(s => (
      <li key={s.number}>
      <button
      onClick={() => selectSurah(s.number)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
        s.number === surahNum
        ? 'bg-yellow-500 text-gray-900 font-semibold'
        : 'hover:bg-gray-700 text-white'
      }`}
      >
      {s.number}. {s.englishName}
      </button>
      </li>
    ))}
    </ul>
    </aside>

    {/* Main area: offset for Sidebar and NavBar */}
    <main className="flex-1 ml-64 pt-20 p-8 overflow-auto no-scrollbar relative z-10">
    <div className="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl p-12 shadow-2xl space-y-8">
    <header className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    <h2 className="text-4xl font-bold text-white tracking-tight">
    {surahData.englishName} — {surahNum}:{ayahNum}
    </h2>
    <form onSubmit={handleJump} className="flex items-center space-x-2">
    <input
    type="number"
    min="1"
    max={surahData.numberOfAyahs}
    placeholder="Ayah #"
    value={jumpValue}
    onChange={e => setJumpValue(e.target.value)}
    className="w-20 px-3 py-2 rounded-lg bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none"
    />
    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
    Go
    </button>
    </form>
    <div className="flex space-x-2">
    <button onClick={() => navigateAyah('prev')} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition">
    ← Prev
    </button>
    <button onClick={() => navigateAyah('next')} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition">
    Next →
    </button>
    </div>
    </header>

    <article className="space-y-6">
    <p className="text-5xl leading-relaxed text-white text-right">{ayah.text}</p>
    <p className="text-2xl italic text-gray-300">{ayah.translation}</p>
    </article>
    </div>
    </main>
    </div>
    </>
  )
}
