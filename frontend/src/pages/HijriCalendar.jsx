// src/pages/HijriCalendar.jsx
import React, { useState, useEffect } from 'react'
import { fetchTodayCalendar } from '../services/calendarService'
import NavBar from '../components/NavBar' // IMPORT NAVBAR

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
      <>
      <NavBar />
      <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <p className="text-white text-xl">Loading...</p>
      </div>
      </>
    )

    if (error)
      return (
        <>
        <NavBar />
        <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
        <p className="text-red-400 text-xl bg-gray-800 bg-opacity-75 p-4 rounded">{error}</p>
        </div>
        </>
      )

      if (!data) return null

        const { hijri, gregorian, upcomingEvents } = data

        return (
          <>
          <NavBar />
          <div
          className="min-h-screen w-full relative flex items-center justify-center bg-cover bg-center pt-20"
          style={{
            backgroundImage: "url('/home-back.jpg')",
                fontFamily: "'Poppins', sans-serif"
          }}
          >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />

          {/* Card Container */}
          <div className="relative z-10 w-full max-w-lg p-8 bg-gray-800 bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
          Islamic & Gregorian Calendar
          </h2>

          {/* Date Picker */}
          <div className="flex items-center justify-between bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-full">
          <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-transparent text-white placeholder-gray-300 px-3 py-1 border-b border-white/50 focus:outline-none"
          />
          <button
          onClick={() => setDate('')}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-full shadow transition"
          >
          Today
          </button>
          </div>

          {/* Dates Display */}
          <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg text-center">
          <h3 className="font-semibold text-yellow-300">Gregorian</h3>
          <p className="mt-1 text-2xl font-medium text-white">
          {gregorian.numeric.year}-
          {String(gregorian.numeric.month).padStart(2, '0')}-
          {String(gregorian.numeric.day).padStart(2, '0')}
          </p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg text-center">
          <h3 className="font-semibold text-yellow-300">Hijri</h3>
          <p className="mt-1 text-2xl font-medium text-white">
          {hijri.numeric.year}-
          {String(hijri.numeric.month).padStart(2, '0')}-
          {String(hijri.numeric.day).padStart(2, '0')}
          </p>
          </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white text-center">Upcoming Islamic Events</h3>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
            {upcomingEvents.map(ev => (
              <li key={ev.hijriDate} className="flex justify-between items-center bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-white font-medium">{ev.name}</span>
              <span className="text-yellow-300">{ev.hijriDate}</span>
              </li>
            ))}
            </ul>
          ) : (
            <p className="text-center text-gray-300">No upcoming events.</p>
          )}
          </div>
          </div>
          </div>
          </>
        )
}
