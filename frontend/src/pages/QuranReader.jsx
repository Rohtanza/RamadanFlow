import React, { useState, useEffect, useRef } from 'react'
import {
  fetchSurahList,
  fetchVerse,
  fetchReciters,
  getVerseAudioUrl,
  getChapterAudioUrl,
  fetchTranslation,
  fetchSurah
} from '../services/quranService'
import {
  searchQuran,
  getSearchSuggestions,
  getJuzList,
  getRukuList,
  getRevelationTypes,
  getEditions
} from '../services/searchService'
import { SURAH_LIST } from '../data/surahList'
import NavBar from '../components/NavBar'
import BookmarkModal from '../components/BookmarkModal'
import SearchModal from '../components/SearchModal'
import SearchFilters from '../components/SearchFilters'
import { debounce } from 'lodash'
import { useNavigate } from 'react-router-dom'
import {
  addBookmark,
  removeBookmark,
  toggleFavorite,
  getFavorites,
  addToHistory,
  getReadingHistory,
  getSettings,
  updateSettings,
  setLastRead,
  getLastRead,
  exportData,
  importData,
  getBookmarks
} from '../services/quranFeatures'
import QuranSidebar from '../components/QuranSidebar'
import QuranSettings from '../components/QuranSettings'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'
import {
  getReciters,
  getAudioUrl,
  getSurahList,
  getSurah,
  getVerse
} from '../services/quranApi'
import { useNotification } from '../context/NotificationContext'

export default function QuranReader() {
  const { addNotification } = useNotification();
  // State for Quran data
  const [surahList, setSurahList] = useState([])
  const [currentSurah, setCurrentSurah] = useState(null)
  const [currentVerse, setCurrentVerse] = useState(null)
  const [selectedSurah, setSelectedSurah] = useState(1)
  const [selectedVerse, setSelectedVerse] = useState(1)
  const [translations, setTranslations] = useState({
    english: '',
    urdu: '',
    arabic1: '',
    arabic2: ''
  })
  
  // State for features
  const [bookmarks, setBookmarks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [readingHistory, setReadingHistory] = useState([])
  const [settings, setSettings] = useState(getSettings())
  const { theme } = useTheme()
  
  // State for audio
  const [reciters, setReciters] = useState({})
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const audioRef = useRef(null)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  
  // State for UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState('default') // 'default', 'translation', 'arabic'

  // Bookmark states
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [bookmarkCategory, setBookmarkCategory] = useState('Favorite')
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    juz: '',
    ruku: '',
    revelationType: '',
    minVerses: '',
    maxVerses: '',
    edition: 'en'
  })
  
  // Filter options
  const [juzList, setJuzList] = useState([])
  const [rukuList, setRukuList] = useState([])
  const [revelationTypes, setRevelationTypes] = useState([])
  const [editions, setEditions] = useState([])

  const navigate = useNavigate()

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [surahListData, recitersData] = await Promise.all([
          getSurahList(),
          getReciters()
        ])
        setSurahList(surahListData)
        setReciters(recitersData)
        
        // Load saved settings and data
        const savedSettings = getSettings()
        setSettings(savedSettings)
        setSelectedReciter(savedSettings.reciterId)
        
        setBookmarks(getBookmarks())
        setFavorites(getFavorites())
        setReadingHistory(getReadingHistory())
        
        // Load initial surah and verse
        await loadSurah(selectedSurah)
        await loadVerse(selectedSurah, selectedVerse)
      } catch (err) {
        setError('Failed to load initial data')
        toast.error('Failed to load initial data')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Load surah
  const loadSurah = async (surahNumber) => {
    try {
      const surahData = await getSurah(surahNumber)
      setCurrentSurah(surahData)
      setSelectedSurah(surahNumber)
      // Load first verse of the new surah
      await loadVerse(surahNumber, 1)
      return surahData
    } catch (err) {
      setError('Failed to load surah')
      toast.error('Failed to load surah')
    }
  }

  // Load verse
  const loadVerse = async (surah, verse) => {
    try {
      setLoading(true)
      setError(null)
      
      const verseData = await getVerse(surah, verse)
      setCurrentVerse(verseData)
      setSelectedSurah(surah)
      setSelectedVerse(verse)
      
      // Add to reading history
      const historyEntry = { 
        surah, 
        verse,
        timestamp: new Date().toISOString()
      }
      addToHistory(historyEntry)
      setReadingHistory(getReadingHistory())
      
      // Update audio URL
      const newAudioUrl = getAudioUrl(selectedReciter, surah, verse)
      setAudioUrl(newAudioUrl)
      
      // Reset audio state
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = newAudioUrl
        audioRef.current.load()
      }
    } catch (err) {
      console.error('Failed to load verse:', err)
      setError(err.message || 'Failed to load verse. Please try again.')
      toast.error(err.message || 'Failed to load verse')
      setCurrentVerse(prev => prev)
    } finally {
      setLoading(false)
    }
  }

  // Handle audio playback
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      toast.error('Audio not available')
      return
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsAudioLoading(true)
      console.log('Playing audio from URL:', audioUrl) // Debug log
      
      // Pre-load the audio
      audioRef.current.load()
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setIsAudioLoading(false)
          console.log('Audio playing successfully') // Debug log
        })
        .catch(err => {
          console.error('Audio playback error:', err)
          console.log('Failed audio URL:', audioUrl) // Debug log
          setIsPlaying(false)
          setIsAudioLoading(false)
          toast.error('Failed to play audio. Please try a different reciter.')
        })
    }
  }

  const handleAudioEnd = () => {
    console.log('Audio ended') // Debug log
    setIsPlaying(false)
    if (settings.autoPlayNext) {
      handleNextVerse()
    } else if (settings.repeatVerse) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Failed to repeat verse:', err)
            toast.error('Failed to repeat verse')
          })
      }
    }
  }

  const handlePreviousVerse = () => {
    if (!currentSurah) return
    
    if (selectedVerse > 1) {
      loadVerse(selectedSurah, selectedVerse - 1)
    } else if (selectedSurah > 1) {
      const prevSurah = selectedSurah - 1
      loadSurah(prevSurah).then(surahData => {
        loadVerse(prevSurah, surahData.numberOfAyahs)
      })
    }
  }

  const handleNextVerse = () => {
    if (!currentSurah) return
    
    if (selectedVerse < currentSurah.numberOfAyahs) {
      loadVerse(selectedSurah, selectedVerse + 1)
    } else if (selectedSurah < surahList.length) {
      loadSurah(selectedSurah + 1).then(() => {
        loadVerse(selectedSurah + 1, 1)
      })
    }
  }

  // Audio handlers
  const handleReciterChange = (reciterId) => {
    setSelectedReciter(reciterId)
    if (currentVerse) {
      const newAudioUrl = getAudioUrl(reciterId, selectedSurah, selectedVerse)
      setAudioUrl(newAudioUrl)
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = newAudioUrl
        audioRef.current.load()
      }
    }
  }

  // Feature handlers
  const handleBookmarkToggle = () => {
    if (!currentVerse) return;
    
    const isBookmarked = bookmarks.some(
      b => b.surah === currentVerse.surah && b.verse === currentVerse.verse
    );
    
    if (isBookmarked) {
      removeBookmark(currentVerse.surah, currentVerse.verse);
      setBookmarks(getBookmarks());
      addNotification('Bookmark removed successfully', 'success');
    } else {
      setShowBookmarkModal(true);
    }
  };

  const handleFavoriteToggle = () => {
    if (!currentVerse) return;
    
    const isFavorited = favorites.some(
      f => f.surah === currentVerse.surah && f.verse === currentVerse.verse
    );
    
    toggleFavorite(currentVerse.surah, currentVerse.verse);
    setFavorites(getFavorites());
    addNotification(
      isFavorited ? 'Removed from favorites' : 'Added to favorites',
      'success'
    );
  };

  const handleBookmarkSave = () => {
    if (!currentVerse) return;
    
    addBookmark(currentVerse.surah, currentVerse.verse, {
      note: bookmarkNote,
      category: bookmarkCategory
    });
    setBookmarks(getBookmarks());
    setShowBookmarkModal(false);
    setBookmarkNote('');
    setBookmarkCategory('Favorite');
    addNotification('Bookmark added successfully', 'success');
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateSettings(newSettings)
  }

  // Search handlers
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    try {
      const results = await searchQuran(searchQuery, searchFilters)
      setSearchResults(results)
      setShowSearchModal(true)
    } catch (err) {
      setError('Search failed')
    }
  }

  const handleResultClick = (result) => {
    setSelectedSurah(result.surah)
    setSelectedVerse(result.ayah)
    setShowSearchModal(false)
  }

  // Keyboard shortcuts
  useHotkeys('right', handleNextVerse)
  useHotkeys('left', handlePreviousVerse)
  useHotkeys('space', handlePlayPause)
  useHotkeys('b', handleBookmarkToggle)
  useHotkeys('f', handleFavoriteToggle)
  useHotkeys('s', () => setShowSettings(true))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-red-500 bg-red-100 px-6 py-4 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  const getFontSizeClass = (type, increaseSize = false) => {
    const baseSize = increaseSize ? 'text-quran-large' : 'text-quran-medium'
    switch (type) {
      case 'arabic':
        switch (settings.fontSize) {
          case 'small': return 'text-quran-small'
          case 'medium': return 'text-quran-medium'
          case 'large': return 'text-quran-large'
          case 'x-large': return 'text-quran-xlarge'
          default: return baseSize
        }
      case 'english':
        switch (settings.fontSize) {
          case 'small': return 'text-translation-small'
          case 'medium': return 'text-translation-medium'
          case 'large': return 'text-translation-large'
          case 'x-large': return 'text-translation-xlarge'
          default: return 'text-translation-medium'
        }
      case 'urdu':
        switch (settings.fontSize) {
          case 'small': return 'text-urdu-small'
          case 'medium': return 'text-urdu-medium'
          case 'large': return 'text-urdu-large'
          case 'x-large': return 'text-urdu-xlarge'
          default: return 'text-urdu-medium'
        }
      default:
        return 'text-translation-medium'
    }
  }

  return (
    <>
      <NavBar />
      <div className={`flex h-screen bg-[url('/home-back.jpg')] bg-cover bg-center bg-fixed theme-${theme}`}>
        <div className="absolute inset-0 bg-theme-overlay backdrop-blur-sm"></div>
        <QuranSidebar
          surahList={surahList}
          selectedSurah={selectedSurah}
          selectedVerse={selectedVerse}
          bookmarks={bookmarks}
          favorites={favorites}
          readingHistory={readingHistory}
          onSurahSelect={loadSurah}
          onVerseSelect={loadVerse}
          onBookmarkAdd={handleBookmarkToggle}
          onBookmarkRemove={handleBookmarkToggle}
          onFavoriteToggle={handleFavoriteToggle}
        />

        <main className="flex-1 overflow-auto p-8 relative flex items-center justify-center">
          <div className="w-full max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <h1 className="text-6xl font-bold text-theme-accent drop-shadow-lg">
                  {currentSurah ? currentSurah.englishName : 'Quran Reader'}
                </h1>
                {currentSurah && (
                  <h2 className="text-3xl font-amiri mt-3 text-theme-accent">
                    {currentSurah.name}
                  </h2>
                )}
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-md border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/60
                    ${bookmarks.some(b => b.surah === selectedSurah && b.verse === selectedVerse)
                      ? 'bg-theme-accent text-theme-primary scale-110 ring-2 ring-theme-accent/40'
                      : 'bg-theme-secondary text-theme-accent hover:bg-theme-hover hover:scale-105'}
                  `}
                  title="Bookmark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
                  </svg>
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-md border border-theme-border focus:outline-none focus:ring-2 focus:ring-theme-accent/60
                    ${favorites.some(f => f.surah === selectedSurah && f.verse === selectedVerse)
                      ? 'bg-theme-accent text-theme-primary scale-110 ring-2 ring-theme-accent/40'
                      : 'bg-theme-secondary text-pink-500 hover:bg-theme-hover hover:scale-105'}
                  `}
                  title="Favorite"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-4 rounded-2xl bg-theme-secondary text-theme-accent hover:bg-theme-hover transition-all duration-300 border border-theme-border hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-theme-accent/60"
                  title="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {!loading && currentVerse && (
              <div className="quran-card backdrop-blur-lg rounded-3xl p-16 mb-6 shadow-2xl border border-theme-border transform transition-all duration-500 hover:shadow-theme-accent/10">
                <div className="mb-12">
                  <div className={`arabic-text mb-12 ${settings.arabicFont} text-quran-xxlarge text-theme-accent text-right leading-relaxed`}>
                    {currentVerse.arabic1}
                  </div>
                  {settings.showTranslation && (
                    <>
                      <div className={`${getFontSizeClass('english')} text-theme-text-primary mb-8 leading-relaxed`}>
                        {currentVerse.english}
                      </div>
                      <div className={`urdu-text text-urdu-xxlarge text-theme-text-secondary text-right leading-relaxed`}>
                        {currentVerse.urdu}
                      </div>
                    </>
                  )}
                </div>

                {/* Audio Controls */}
                <div className="border-t border-theme-border pt-12">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <select
                      value={selectedReciter}
                      onChange={(e) => handleReciterChange(e.target.value)}
                      className="w-full sm:w-auto bg-theme-secondary text-theme-text-primary rounded-2xl px-8 py-4 focus:outline-none focus:ring-2 focus:ring-theme-accent border border-theme-border text-lg transition-all duration-200 hover:bg-theme-hover"
                    >
                      {Object.entries(reciters).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center space-x-8">
                      <button
                        onClick={handlePreviousVerse}
                        className="p-6 rounded-2xl bg-theme-secondary text-theme-text-primary hover:bg-theme-hover transition-all duration-200 border border-theme-border hover:scale-110 transform hover:shadow-lg"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handlePlayPause}
                        disabled={isAudioLoading || !audioUrl}
                        className={`p-10 rounded-full border-2 border-theme-accent shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-theme-accent/40
                          ${isPlaying
                            ? 'bg-theme-accent text-theme-primary scale-110 ring-2 ring-theme-accent/40 brightness-110'
                            : 'bg-theme-secondary text-theme-accent hover:bg-theme-accent hover:text-theme-primary hover:scale-110 hover:brightness-110'}
                        `}
                      >
                        {isAudioLoading ? (
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
                        ) : isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={handleNextVerse}
                        className="p-6 rounded-2xl bg-theme-secondary text-theme-text-primary hover:bg-theme-hover transition-all duration-200 border border-theme-border hover:scale-110 transform hover:shadow-lg"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Settings Modal */}
        <QuranSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingChange={handleSettingChange}
          onExport={() => {
            const data = exportData()
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'quran-settings.json'
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Settings exported')
          }}
          onImport={(data) => {
            try {
              importData(data)
              setSettings(getSettings())
              setBookmarks(getBookmarks())
              setFavorites(getFavorites())
              toast.success('Settings imported')
            } catch (err) {
              toast.error('Failed to import settings')
            }
          }}
        />

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          onError={(e) => {
            console.error('Audio error:', e)
            console.log('Error with URL:', audioUrl)
            setIsPlaying(false)
            setIsAudioLoading(false)
            toast.error('Failed to load audio. Please try a different reciter.')
          }}
          onLoadStart={() => {
            console.log('Audio loading started:', audioUrl)
            setIsAudioLoading(true)
          }}
          onCanPlay={() => {
            console.log('Audio can play now')
            setIsAudioLoading(false)
          }}
          onPlay={() => {
            console.log('Audio started playing')
            setIsPlaying(true)
          }}
          onPause={() => {
            console.log('Audio paused')
            setIsPlaying(false)
          }}
          preload="auto"
          crossOrigin="anonymous"
        />
      </div>
    </>
  );
}