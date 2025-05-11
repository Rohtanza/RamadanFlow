// Local Storage Keys
const STORAGE_KEYS = {
  BOOKMARKS: 'quran_bookmarks',
  FAVORITES: 'quran_favorites',
  HISTORY: 'quran_history',
  SETTINGS: 'quran_settings',
  LAST_READ: 'quran_last_read'
};

// Default settings
const DEFAULT_SETTINGS = {
  fontSize: 'medium',
  arabicFont: 'Amiri',
  theme: 'light',
  showTranslation: true,
  autoPlayNext: false,
  repeatVerse: false,
  readingMode: 'verse',
  reciterId: 'ar.alafasy'
};

// Helper function to safely parse JSON from localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Helper function to safely save JSON to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Bookmarks
export const getBookmarks = () => getFromStorage(STORAGE_KEYS.BOOKMARKS);

export const addBookmark = (bookmark) => {
  const bookmarks = getBookmarks();
  bookmarks.push(bookmark);
  saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
};

export const removeBookmark = (bookmark) => {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(
    b => !(b.surah === bookmark.surah && b.verse === bookmark.verse)
  );
  saveToStorage(STORAGE_KEYS.BOOKMARKS, filtered);
};

// Favorites
export const getFavorites = () => getFromStorage(STORAGE_KEYS.FAVORITES);

export const toggleFavorite = (favorite) => {
  const favorites = getFavorites();
  const exists = favorites.some(
    f => f.surah === favorite.surah && f.verse === favorite.verse
  );

  if (exists) {
    const filtered = favorites.filter(
      f => !(f.surah === favorite.surah && f.verse === favorite.verse)
    );
    saveToStorage(STORAGE_KEYS.FAVORITES, filtered);
  } else {
    favorites.push(favorite);
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
  }
};

// Reading History
export const getReadingHistory = () => getFromStorage(STORAGE_KEYS.HISTORY);

export const addToHistory = (entry) => {
  const history = getReadingHistory();
  history.unshift(entry);
  if (history.length > 100) history.pop();
  saveToStorage(STORAGE_KEYS.HISTORY, history);
};

// Settings
export const getSettings = () => ({
  ...DEFAULT_SETTINGS,
  ...getFromStorage(STORAGE_KEYS.SETTINGS, {})
});

export const updateSettings = (newSettings) => {
  const settings = getSettings();
  const updatedSettings = { ...settings, ...newSettings };
  saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
  return updatedSettings;
};

// Last Read
export const getLastRead = () => getFromStorage(STORAGE_KEYS.LAST_READ, { surah: 1, verse: 1 });

export const setLastRead = (position) => {
  saveToStorage(STORAGE_KEYS.LAST_READ, position);
};

// Data Export/Import
export const exportData = () => ({
  bookmarks: getBookmarks(),
  favorites: getFavorites(),
  history: getReadingHistory(),
  settings: getSettings(),
  lastRead: getLastRead()
});

export const importData = (data) => {
  if (data.bookmarks) saveToStorage(STORAGE_KEYS.BOOKMARKS, data.bookmarks);
  if (data.favorites) saveToStorage(STORAGE_KEYS.FAVORITES, data.favorites);
  if (data.history) saveToStorage(STORAGE_KEYS.HISTORY, data.history);
  if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
  if (data.lastRead) saveToStorage(STORAGE_KEYS.LAST_READ, data.lastRead);
}; 