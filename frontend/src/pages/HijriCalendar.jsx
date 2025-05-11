// src/pages/HijriCalendar.jsx
import React, { useState, useEffect } from 'react'
import { fetchTodayCalendar } from '../services/calendarService'
import { motion } from 'framer-motion'
import { FaMoon, FaSun, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'

export default function HijriCalendar() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchTodayCalendar(date)
      .then(cal => {
        if (!cal || !cal.hijri || !cal.gregorian) {
          throw new Error('Invalid calendar data received')
        }
        setData(cal)
        setError('')
      })
      .catch(err => {
        console.error(err)
        setError('Could not load calendar data')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [date])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <FaMoon className="animate-pulse text-yellow-400 text-4xl mx-auto mb-4" />
          <p className="text-white text-xl">Loading Calendar...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center bg-red-900/20 backdrop-blur-sm p-6 rounded-lg">
          <FaSun className="text-red-400 text-4xl mx-auto mb-4" />
          <p className="text-red-400 text-xl">{error}</p>
        </div>
      </div>
    )

  if (!data || !data.hijri || !data.gregorian) return null

  const { hijri, gregorian, upcomingEvents = [] } = data

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  // Helper function to format date parts safely
  const formatDatePart = (part) => String(part || '0').padStart(2, '0')

  // Helper function to safely get nested properties
  const getNestedValue = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((acc, part) => acc[part], obj) || defaultValue
    } catch {
      return defaultValue
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div {...fadeIn} className="inline-block">
            <FaMoon className="text-yellow-400 text-5xl mx-auto mb-4" />
          </motion.div>
          <motion.h1 {...fadeIn} className="text-4xl md:text-5xl font-bold text-white mb-2">
            Islamic Calendar
          </motion.h1>
          <motion.p {...fadeIn} className="text-gray-400 text-lg">
            Discover Islamic dates and upcoming events
          </motion.p>
        </div>

        {/* Date Controls */}
        <motion.div 
          {...fadeIn}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setDate('')}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FaCalendarAlt />
              Today
            </button>
          </div>
        </motion.div>

        {/* Calendar Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gregorian Date */}
          <motion.div 
            {...fadeIn}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaSun className="text-yellow-400 text-2xl" />
              <h2 className="text-xl font-semibold text-white">Gregorian Date</h2>
            </div>
            <p className="text-3xl font-bold text-white">
              {getNestedValue(gregorian, 'numeric.year', new Date().getFullYear())}-
              {formatDatePart(getNestedValue(gregorian, 'numeric.month'))}-
              {formatDatePart(getNestedValue(gregorian, 'numeric.day'))}
            </p>
            <p className="text-gray-400 mt-2">{getNestedValue(gregorian, 'weekday.en', '')}</p>
          </motion.div>

          {/* Hijri Date */}
          <motion.div 
            {...fadeIn}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaMoon className="text-yellow-400 text-2xl" />
              <h2 className="text-xl font-semibold text-white">Hijri Date</h2>
            </div>
            <p className="text-3xl font-bold text-white">
              {getNestedValue(hijri, 'numeric.year', '')}-
              {formatDatePart(getNestedValue(hijri, 'numeric.month'))}-
              {formatDatePart(getNestedValue(hijri, 'numeric.day'))}
            </p>
            <p className="text-gray-400 mt-2">{getNestedValue(hijri, 'month.en', '')}</p>
          </motion.div>
        </div>

        {/* Location Info */}
        <motion.div 
          {...fadeIn}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaMapMarkerAlt className="text-yellow-400 text-2xl" />
            <h2 className="text-xl font-semibold text-white">Location</h2>
          </div>
          <p className="text-gray-400">Calculations based on Karachi, Pakistan</p>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div 
          {...fadeIn}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Upcoming Islamic Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((ev, index) => (
                <motion.div
                  key={ev.hijriDate || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaMoon className="text-yellow-400" />
                    <span className="text-white font-medium">{ev.name || 'Unknown Event'}</span>
                  </div>
                  <span className="text-yellow-400 mt-2 sm:mt-0">{ev.hijriDate || 'Date not available'}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No upcoming events.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
