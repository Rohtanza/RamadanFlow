// Local storage keys
const BOOKMARKS_KEY = 'azkar_bookmarks'
const FAVORITES_KEY = 'azkar_favorites'
const CUSTOM_COLLECTIONS_KEY = 'azkar_custom_collections'
const NOTES_KEY = 'azkar_notes'
const SETTINGS_KEY = 'azkar_settings'

// Default settings
const DEFAULT_SETTINGS = {
  fontSize: 'text-2xl',
  arabicFont: 'font-amiri',
  theme: 'dark',
  showTranslation: true,
  showBlessings: true
}

// Helper functions
const safeParseJSON = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error parsing ${key}:`, error)
    return defaultValue
  }
}

const safeSaveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error saving ${key}:`, error)
    return false
  }
}

// Bookmark functions
export const getBookmarks = () => {
  return safeParseJSON(BOOKMARKS_KEY)
}

export const addBookmark = (id, category, azkar) => {
  const bookmarks = getBookmarks()
  if (!bookmarks.some(b => b.id === id)) {
    bookmarks.push({ id, category, azkar })
    safeSaveJSON(BOOKMARKS_KEY, bookmarks)
  }
  return bookmarks
}

export const removeBookmark = (id) => {
  const bookmarks = getBookmarks().filter(b => b.id !== id)
  safeSaveJSON(BOOKMARKS_KEY, bookmarks)
  return bookmarks
}

// Favorite functions
export const getFavorites = () => {
  return safeParseJSON(FAVORITES_KEY)
}

export const toggleFavorite = (id, azkar) => {
  const favorites = getFavorites()
  const existingIndex = favorites.findIndex(f => f.id === id)
  
  if (existingIndex === -1) {
    favorites.push({ id, category: azkar.category, azkar })
    safeSaveJSON(FAVORITES_KEY, favorites)
    return true
  } else {
    favorites.splice(existingIndex, 1)
    safeSaveJSON(FAVORITES_KEY, favorites)
    return false
  }
}

// Custom collections functions
export const getCustomCollections = () => {
  return safeParseJSON(CUSTOM_COLLECTIONS_KEY)
}

export const createCollection = (name, description = '') => {
  const collections = getCustomCollections()
  const newCollection = {
    id: Date.now().toString(),
    name,
    description,
    items: []
  }
  collections.push(newCollection)
  safeSaveJSON(CUSTOM_COLLECTIONS_KEY, collections)
  return newCollection
}

export const addToCollection = (collectionId, azkar) => {
  const collections = getCustomCollections()
  const collection = collections.find(c => c.id === collectionId)
  
  if (collection) {
    // Create a unique identifier for the Azkar based on its content
    const azkarContent = typeof azkar === 'string' 
      ? azkar 
      : azkar.zekr || azkar.content || azkar.zikr || azkar.text || JSON.stringify(azkar)
    
    // Check if the Azkar is already in the collection by comparing content
    const isDuplicate = collection.items.some(item => {
      const itemContent = typeof item === 'string'
        ? item
        : item.zekr || item.content || item.zikr || item.text || JSON.stringify(item)
      return itemContent === azkarContent
    })

    if (!isDuplicate) {
      // Add a timestamp and unique ID to track when the item was added
      const itemWithMetadata = {
        ...azkar,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: Date.now()
      }
      collection.items.push(itemWithMetadata)
      safeSaveJSON(CUSTOM_COLLECTIONS_KEY, collections)
    }
  }
  return collections
}

export const removeFromCollection = (collectionId, item) => {
  const collections = getCustomCollections()
  const collection = collections.find(c => c.id === collectionId)
  
  if (collection) {
    // Create a unique identifier for the item based on its content
    const itemContent = typeof item === 'string'
      ? item
      : item.zekr || item.content || item.zikr || item.text || JSON.stringify(item)
    
    // Remove the item by comparing content
    collection.items = collection.items.filter(existingItem => {
      const existingContent = typeof existingItem === 'string'
        ? existingItem
        : existingItem.zekr || existingItem.content || existingItem.zikr || existingItem.text || JSON.stringify(existingItem)
      return existingContent !== itemContent
    })
    
    safeSaveJSON(CUSTOM_COLLECTIONS_KEY, collections)
  }
  return collections
}

export const deleteCollection = (collectionId) => {
  const collections = getCustomCollections().filter(c => c.id !== collectionId)
  safeSaveJSON(CUSTOM_COLLECTIONS_KEY, collections)
  return collections
}

// Notes functions
export const getNotes = () => {
  return safeParseJSON(NOTES_KEY)
}

export const addNote = (id, note) => {
  const notes = getNotes()
  const existingNote = notes.find(n => n.id === id)
  
  if (existingNote) {
    existingNote.note = note
  } else {
    notes.push({ id, note })
  }
  
  safeSaveJSON(NOTES_KEY, notes)
  return notes
}

export const updateNote = (id, note) => {
  return addNote(id, note)
}

export const removeNote = (id) => {
  const notes = getNotes().filter(n => n.id !== id)
  safeSaveJSON(NOTES_KEY, notes)
  return notes
}

// Settings functions
export const getSettings = () => {
  return safeParseJSON(SETTINGS_KEY, DEFAULT_SETTINGS)
}

export const updateSettings = (newSettings) => {
  const currentSettings = getSettings()
  const updatedSettings = { ...currentSettings, ...newSettings }
  safeSaveJSON(SETTINGS_KEY, updatedSettings)
  return updatedSettings
} 