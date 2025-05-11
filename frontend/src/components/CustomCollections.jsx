import React, { useState, useEffect } from 'react'
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa'
import {
  getCustomCollections,
  createCollection,
  deleteCollection,
  removeFromCollection
} from '../services/azkarFeatures'
import { useNotification } from '../context/NotificationContext'

export default function CustomCollections({ onSelectCollection }) {
  const { addNotification } = useNotification()
  const [collections, setCollections] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: '', description: '' })

  useEffect(() => {
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

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) {
      addNotification('Collection name is required', 'error')
      return
    }

    try {
      createCollection(newCollection.name, newCollection.description)
      setNewCollection({ name: '', description: '' })
      setShowModal(false)
      loadCollections()
      addNotification('Collection created successfully', 'success')
    } catch (error) {
      console.error('Error creating collection:', error)
      addNotification('Error creating collection', 'error')
    }
  }

  const handleDeleteCollection = (collectionId) => {
    try {
      deleteCollection(collectionId)
      loadCollections()
      addNotification('Collection deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting collection:', error)
      addNotification('Error deleting collection', 'error')
    }
  }

  const handleRemoveItem = (collectionId, item) => {
    try {
      const collections = removeFromCollection(collectionId, item)
      setCollections(collections)
      addNotification('Item removed from collection', 'success')
    } catch (error) {
      console.error('Error removing item:', error)
      addNotification('Error removing item', 'error')
    }
  }

  const renderCollectionItems = (collection) => {
    if (!collection.items || collection.items.length === 0) {
      return (
        <p className="text-gray-400 text-center py-4">
          No items in this collection yet
        </p>
      )
    }

    return (
      <div className="space-y-4">
        {collection.items.map((item, index) => {
          const text = typeof item === 'string'
            ? item
            : item.zekr || item.content || item.zikr || item.text || JSON.stringify(item)

          return (
            <div 
              key={index}
              className="bg-gray-700/50 p-4 rounded-lg relative group"
            >
              <button
                onClick={() => handleRemoveItem(collection.id, item)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from collection"
              >
                <FaTimes />
              </button>
              <p className="text-white text-lg pr-8">{text}</p>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-semibold text-white">Custom Collections</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          <FaPlus /> New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <p className="text-center text-gray-300 text-xl py-8">
          No collections yet. Create your first collection to start organizing your Azkar.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map(collection => (
            <div 
              key={collection.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-1">
                    {collection.name}
                  </h4>
                  {collection.description && (
                    <p className="text-gray-400 text-sm">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectCollection(collection)}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete collection"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              {renderCollectionItems(collection)}
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Create New Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter collection name"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter collection description"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 