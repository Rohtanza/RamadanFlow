import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useTheme } from '../context/ThemeContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function QuranSidebar({
  surahList,
  selectedSurah,
  selectedVerse,
  onSurahSelect,
  bookmarks,
  favorites,
  readingHistory,
  onBookmarkAdd,
  onBookmarkRemove,
  onFavoriteToggle,
  onVerseSelect
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  const filteredSurahs = surahList.filter(surah =>
    surah.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(surah.number).includes(searchQuery)
  );

  return (
    <div className="w-96 h-screen flex flex-col bg-gray-900/80 backdrop-blur-lg border-r border-gray-800/50 overflow-hidden">
      {/* Search Bar */}
      <div className="p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700/50"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
              </div>

      <Tab.Group>
        <Tab.List className="flex p-2 space-x-2 bg-gray-800/30 mx-6 rounded-xl">
          {['Surahs', 'Bookmarks', 'Favorites', 'History'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200',
                  'focus:outline-none',
                  selected
                    ? 'bg-yellow-500 text-gray-900 shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="flex-1 overflow-auto scrollbar-hide mt-6">
          {/* Surahs Panel */}
          <Tab.Panel className="h-full overflow-auto scrollbar-hide">
            <div className="space-y-2 px-6">
              {filteredSurahs.map((surah) => (
                    <button
                  key={surah.number}
                  onClick={() => onSurahSelect(surah.number)}
                  className={classNames(
                    'w-full px-6 py-4 rounded-xl text-left transition-all duration-200',
                    selectedSurah === surah.number
                      ? 'bg-yellow-500 text-gray-900 shadow-lg'
                      : 'hover:bg-gray-800/50 text-white'
                  )}
                >
                  <div className="flex items-center">
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-800/50 rounded-lg text-lg font-medium">
                      {surah.number}
                    </span>
                    <div className="ml-4">
                      <div className="font-medium text-lg">{surah.englishName}</div>
                      <div className="text-sm opacity-75">
                        {surah.englishNameTranslation}
                          </div>
                        </div>
                      </div>
                    </button>
              ))}
            </div>
          </Tab.Panel>

          {/* Bookmarks Panel */}
          <Tab.Panel className="h-full overflow-auto scrollbar-hide">
            <div className="space-y-1 p-2">
              {bookmarks.map((bookmark) => (
                      <button
                  key={`${bookmark.surah}:${bookmark.verse}`}
                  onClick={() => onVerseSelect(bookmark.surah, bookmark.verse)}
                  className="w-full px-4 py-3 rounded-lg text-left hover:bg-theme-primary text-theme-primary transition-all duration-200"
                      >
                  <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                        Surah {bookmark.surah}, Verse {bookmark.verse}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {surahList[bookmark.surah - 1]?.englishName}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                        onBookmarkRemove(bookmark.surah, bookmark.verse);
                            }}
                      className="p-2 rounded-full hover:bg-red-500 hover:text-white transition"
                          >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                          </button>
                        </div>
                      </button>
              ))}
                    </div>
          </Tab.Panel>

          {/* Favorites Panel */}
          <Tab.Panel className="h-full overflow-auto scrollbar-hide">
            <div className="space-y-1 p-2">
              {favorites.map((favorite) => (
                      <button
                  key={`${favorite.surah}:${favorite.verse}`}
                  onClick={() => onVerseSelect(favorite.surah, favorite.verse)}
                  className="w-full px-4 py-3 rounded-lg text-left hover:bg-theme-primary text-theme-primary transition-all duration-200"
                      >
                  <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                        Surah {favorite.surah}, Verse {favorite.verse}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {surahList[favorite.surah - 1]?.englishName}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                        onFavoriteToggle(favorite.surah, favorite.verse);
                            }}
                      className="p-2 rounded-full hover:bg-red-500 hover:text-white transition"
                          >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                          </button>
                        </div>
                      </button>
              ))}
            </div>
          </Tab.Panel>

          {/* History Panel */}
          <Tab.Panel className="h-full overflow-auto scrollbar-hide">
            <div className="space-y-1 p-2">
              {readingHistory.map((item, index) => (
                <button
                  key={`${item.surah}:${item.verse}-${index}`}
                  onClick={() => onVerseSelect(item.surah, item.verse)}
                  className="w-full px-4 py-3 rounded-lg text-left hover:bg-theme-primary text-theme-primary transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center bg-theme-primary rounded-full text-sm font-medium">
                      {item.surah}:{item.verse}
                    </span>
                    <div className="ml-3">
                      <div className="font-medium">
                        {surahList[item.surah - 1]?.englishName}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        Verse {item.verse}
                      </div>
                      {item.timestamp && (
                        <div className="text-xs text-theme-secondary">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      </div>
  );
} 