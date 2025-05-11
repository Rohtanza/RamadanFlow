import React, { useState, useEffect, useRef } from 'react'
import { fetchAzkar } from '../services/azkarService'
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  getFavorites,
  toggleFavorite,
  getNotes,
  addNote,
  updateNote,
  removeNote,
  getSettings,
  updateSettings,
  getCustomCollections,
  addToCollection,
  removeFromCollection
} from '../services/azkarFeatures'
import html2pdf from 'html2pdf.js'
import NavBar from '../components/NavBar'
import CustomCollections from '../components/CustomCollections'
import { useNotification } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import { FaBookmark, FaStar, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { Tab } from '@headlessui/react'

const CATEGORIES = [
  { key: 'm',  label: 'Morning Adhkar' },
  { key: 'e',  label: 'Evening Adhkar' },
  { key: 'as', label: 'Post-Prayer Adhkar' }
]

const DEFAULT_SETTINGS = {
  fontSize: 'text-3xl',
  arabicFont: 'font-amiri',
  theme: 'dark',
  showTranslation: true,
  showBlessings: true
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AzkarLibrary() {
  const { addNotification } = useNotification()
  const { theme } = useTheme()
  const [settings, setSettings] = useState(getSettings())
  const [bookmarks, setBookmarks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [notes, setNotes] = useState([])
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedAzkar, setSelectedAzkar] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false)
  const [selectedAzkarForCollection, setSelectedAzkarForCollection] = useState(null)
  const [collections, setCollections] = useState([])
  const { setCategory, category, items, loading, error, pdfRef } = useAzkarLogic()

  useEffect(() => {
    setBookmarks(getBookmarks())
    setFavorites(getFavorites())
    setNotes(getNotes())
    loadCollections()
  }, [])

  const loadCollections = () => {
    try {
      const savedCollections = getCustomCollections()
      setCollections(Array.isArray(savedCollections) ? savedCollections : [])
    } catch (error) {
      console.error('Error loading collections:', error)
      addNotification('Error loading collections', 'error')
    }
  }

  const handleBookmarkToggle = (azkarId, azkar) => {
    const isBookmarked = bookmarks.some(b => b.id === azkarId)
    if (isBookmarked) {
      removeBookmark(azkarId)
      addNotification('Bookmark removed', 'success')
    } else {
      addBookmark(azkarId, category, azkar)
      addNotification('Bookmark added', 'success')
    }
    setBookmarks(getBookmarks())
  }

  const handleFavoriteToggle = (azkarId, azkar) => {
    const isFavorited = toggleFavorite(azkarId, azkar)
    addNotification(
      isFavorited ? 'Added to favorites' : 'Removed from favorites',
      'success'
    )
    setFavorites(getFavorites())
  }

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection)
    setSelectedTab(3) // Switch to Custom Collections tab
  }

  const handleAddToCollection = (azkar) => {
    setSelectedAzkarForCollection(azkar)
    setShowAddToCollectionModal(true)
    loadCollections() // Reload collections to ensure we have the latest data
  }

  const handleNoteToggle = (azkar) => {
    setSelectedAzkar(azkar)
    const existingNote = notes.find(n => n.id === azkar.id)
    setNoteText(existingNote ? existingNote.note : '')
    setShowNoteModal(true)
  }

  const handleNoteSave = () => {
    if (!selectedAzkar) return

    const existingNote = notes.find(n => n.id === selectedAzkar.id)
    if (existingNote) {
      updateNote(selectedAzkar.id, noteText)
    } else {
      addNote(selectedAzkar.id, noteText)
    }
    setNotes(getNotes())
    setShowNoteModal(false)
    addNotification('Note saved', 'success')
  }

  const handleAddToCollectionConfirm = (collectionId) => {
    if (!selectedAzkarForCollection) return

    try {
      addToCollection(collectionId, selectedAzkarForCollection)
      loadCollections() // Reload collections after adding
      setShowAddToCollectionModal(false)
      setSelectedAzkarForCollection(null)
      addNotification('Added to collection', 'success')
    } catch (error) {
      console.error('Error adding to collection:', error)
      addNotification('Error adding to collection', 'error')
    }
  }

  const downloadPDF = () => {
    const title = selectedCollection 
      ? selectedCollection.name 
      : CATEGORIES.find(c => c.key === category).label

    // Create a temporary container for PDF generation
    const tempContainer = document.createElement('div')
    tempContainer.className = 'pdf-container bg-white p-8'
    tempContainer.style.direction = 'rtl'
    tempContainer.style.fontFamily = settings.arabicFont

    // Add title
    const titleElement = document.createElement('h1')
    titleElement.className = 'text-3xl font-bold text-gray-900 mb-8 text-center'
    titleElement.textContent = title
    tempContainer.appendChild(titleElement)

    // Add all Azkar
    const azkarList = selectedCollection 
      ? selectedCollection.items 
      : items

    azkarList.forEach((itm, idx) => {
      const text = typeof itm === 'string'
        ? itm
        : itm.zekr || itm.content || itm.zikr || itm.text || JSON.stringify(itm)

      const repeat = typeof itm === 'object' ? itm.repeat || '' : ''
      const bless = typeof itm === 'object' ? itm.bless || '' : ''

      const azkarElement = document.createElement('div')
      azkarElement.className = 'mb-8 p-6 bg-gray-50 rounded-lg'
      azkarElement.style.fontSize = '1.5rem'
      azkarElement.style.lineHeight = '2.5rem'

      // Add Azkar text
      const textElement = document.createElement('p')
      textElement.className = 'text-gray-900 mb-4'
      textElement.innerHTML = `<span class="text-yellow-600 ml-2">${idx + 1}.</span> ${text}`
      azkarElement.appendChild(textElement)

      // Add repetition and blessing if they exist
      if (repeat || bless) {
        const detailsElement = document.createElement('div')
        detailsElement.className = 'flex flex-wrap gap-4 justify-end text-gray-600 text-xl'
        
        if (repeat) {
          const repeatElement = document.createElement('span')
          repeatElement.innerHTML = `التكرار: <strong class="text-yellow-600">${repeat}×</strong>`
          detailsElement.appendChild(repeatElement)
        }
        
        if (bless) {
          const blessElement = document.createElement('span')
          blessElement.innerHTML = `ملاحظة: <em class="text-yellow-600">${bless}</em>`
          detailsElement.appendChild(blessElement)
        }
        
        azkarElement.appendChild(detailsElement)
      }

      tempContainer.appendChild(azkarElement)
    })

    // Add footer with app name and date
    const footer = document.createElement('div')
    footer.className = 'mt-8 pt-4 border-t border-gray-200 text-center text-gray-500'
    footer.innerHTML = `
      <p>${import.meta.env.VITE_APP_NAME}</p>
      <p>${new Date().toLocaleDateString('ar-SA')}</p>
    `
    tempContainer.appendChild(footer)

    // Configure PDF options
    const opt = {
      margin: 20,
      filename: `${title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'pt', 
        format: 'a4', 
        orientation: 'portrait'
      }
    }

    // Generate and download PDF
    addNotification('Generating PDF...', 'info')
    
    html2pdf()
      .set(opt)
      .from(tempContainer)
      .save()
      .then(() => {
        addNotification('PDF downloaded successfully', 'success')
      })
      .catch(err => {
        console.error('PDF export error', err)
        addNotification('Failed to generate PDF', 'error')
      })
      .finally(() => {
        // Clean up
        tempContainer.remove()
      })
  }

  const renderAzkarList = (items, showActions = true) => {
    if (items.length === 0) {
      return <p className="text-center text-gray-300 text-xl">No entries found.</p>
    }

    return items.map((itm, idx) => {
      const text = typeof itm === 'string'
        ? itm
        : itm.zekr || itm.content || itm.zikr || itm.text || JSON.stringify(itm)

      const repeat = typeof itm === 'object' ? itm.repeat || '' : ''
      const bless = typeof itm === 'object' ? itm.bless || '' : ''
      const azkarId = `${category}-${idx}`

      return (
        <div 
          key={idx} 
          className="bg-gray-700 bg-opacity-80 p-8 rounded-2xl shadow-inner text-right relative group flex flex-col h-full"
        >
          {showActions && (
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleBookmarkToggle(azkarId, itm)}
                className={`p-2 rounded-full transition-colors ${
                  bookmarks.some(b => b.id === azkarId)
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title="Bookmark"
              >
                <FaBookmark />
              </button>
              <button
                onClick={() => handleFavoriteToggle(azkarId, itm)}
                className={`p-2 rounded-full transition-colors ${
                  favorites.some(f => f.id === azkarId)
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title="Favorite"
              >
                <FaStar />
              </button>
              <button
                onClick={() => handleNoteToggle(itm)}
                className="p-2 rounded-full bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
                title="Add Note"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleAddToCollection(itm)}
                className="p-2 rounded-full bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors"
                title="Add to Collection"
              >
                <FaPlus />
              </button>
            </div>
          )}

          <div className="flex-grow">
            <p 
              className="text-white text-3xl font-amiri mb-4 leading-relaxed"
              style={{ 
                fontFamily: 'Amiri, serif',
                lineHeight: '2.5rem',
                letterSpacing: '0.02em'
              }}
            >
              <span className="text-yellow-400 ml-2 text-2xl">{idx + 1}.</span> {text}
            </p>
          </div>

          <div className="mt-auto">
            {(repeat || bless) && (
              <div className="flex flex-wrap gap-4 justify-end mt-4">
                {repeat && (
                  <span className="text-gray-300 text-xl font-amiri">
                    التكرار: <strong className="text-yellow-400">{repeat}×</strong>
                  </span>
                )}
                {bless && (
                  <span className="text-gray-300 text-xl font-amiri">
                    ملاحظة: <em className="text-yellow-400">{bless}</em>
                  </span>
                )}
              </div>
            )}

            {notes.find(n => n.id === azkarId) && (
              <div className="mt-4 p-4 bg-gray-600/50 rounded-lg">
                <p className="text-gray-300 text-lg font-amiri">
                  {notes.find(n => n.id === azkarId).note}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  const renderBookmarkedAzkar = () => {
    if (bookmarks.length === 0) {
      return <p className="text-center text-gray-300 text-xl">No bookmarked Azkar yet.</p>
    }

    return bookmarks.map((bookmark) => {
      const azkar = bookmark.azkar
      if (!azkar) return null

      return (
        <div key={bookmark.id} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-white">
              {CATEGORIES.find(c => c.key === bookmark.category)?.label}
            </h4>
            <button
              onClick={() => handleBookmarkToggle(bookmark.id, azkar)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          {renderAzkarList([azkar], false)}
        </div>
      )
    })
  }

  const renderFavoriteAzkar = () => {
    if (favorites.length === 0) {
      return <p className="text-center text-gray-300 text-xl">No favorite Azkar yet.</p>
    }

    return favorites.map((favorite) => {
      const azkar = favorite.azkar
      if (!azkar) return null

      return (
        <div key={favorite.id} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-white">
              {CATEGORIES.find(c => c.key === favorite.category)?.label}
            </h4>
            <button
              onClick={() => handleFavoriteToggle(favorite.id, azkar)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          {renderAzkarList([azkar], false)}
        </div>
      )
    })
  }

  return (
    <>
      <NavBar />
      <div
        className="w-full min-h-screen relative flex items-start justify-center bg-cover bg-center bg-fixed py-8"
        style={{
          backgroundImage: "url('/home-back.jpg')",
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70" />

        {/* Content container */}
        <div className="relative z-10 w-full max-w-4xl mx-auto bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl">
          <div className="p-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
              Azkar Library
            </h2>

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-gray-700/50 p-1">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-800 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-yellow-500 text-gray-900 shadow'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    )
                  }
                >
                  Categories
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-800 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-yellow-500 text-gray-900 shadow'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    )
                  }
                >
                  Bookmarks
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-800 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-yellow-500 text-gray-900 shadow'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    )
                  }
                >
                  Favorites
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-800 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-yellow-500 text-gray-900 shadow'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    )
                  }
                >
                  Custom Collections
                </Tab>
              </Tab.List>

              <Tab.Panels className="mt-8">
                <Tab.Panel className="space-y-6">
                  {/* Add Category Selection Buttons */}
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`px-6 py-3 rounded-full font-medium transition-colors duration-300 ${
                          category === cat.key
                            ? 'bg-yellow-500 text-gray-900 shadow-lg'
                            : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : error ? (
                    <p className="text-red-400 text-center">{error}</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-3xl font-semibold text-white">
                          {CATEGORIES.find(c => c.key === category)?.label}
                        </h3>
                        <button
                          onClick={downloadPDF}
                          className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium shadow-lg transition duration-300"
                        >
                          Download PDF
                        </button>
                      </div>
                      <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                        {renderAzkarList(items)}
                      </div>
                    </>
                  )}
                </Tab.Panel>

                <Tab.Panel>
                  <div className="space-y-8">
                    <h3 className="text-3xl font-semibold text-white">Bookmarked Azkar</h3>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                      {renderBookmarkedAzkar()}
                    </div>
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <div className="space-y-8">
                    <h3 className="text-3xl font-semibold text-white">Favorite Azkar</h3>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                      {renderFavoriteAzkar()}
                    </div>
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <CustomCollections onSelectCollection={handleCollectionSelect} />
                  
                  {selectedCollection && (
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-3xl font-semibold text-white">
                          {selectedCollection.name}
                        </h3>
                        <button
                          onClick={downloadPDF}
                          className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium shadow-lg transition duration-300"
                        >
                          Download PDF
                        </button>
                      </div>

                      <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                        {renderAzkarList(selectedCollection.items || [])}
                      </div>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Add Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none"
              placeholder="Enter your note here..."
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleNoteSave}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Collection Modal */}
      {showAddToCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Add to Collection</h3>
            {collections.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No collections available. Create a collection first.
              </p>
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleAddToCollectionConfirm(collection.id)}
                    className="w-full p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-left"
                  >
                    <h4 className="text-lg font-semibold">{collection.name}</h4>
                    {collection.description && (
                      <p className="text-gray-400 text-sm mt-1">{collection.description}</p>
                    )}
                    <p className="text-gray-400 text-sm mt-2">
                      {collection.items?.length || 0} Azkar
                    </p>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAddToCollectionModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Encapsulated hook logic for clarity
function useAzkarLogic() {
  const [category, setCategory] = useState('m')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pdfRef = useRef()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchAzkar(category)
      .then(data => {
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error(err)
        if (!cancelled) setError('Failed to load Azkar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [category])

  return { category, setCategory, items, loading, error, pdfRef }
}
