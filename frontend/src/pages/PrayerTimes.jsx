// src/pages/PrayerTimes.jsx
import React, { useState, useEffect } from 'react'
import { getToken } from '../services/authService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import NavBar from '../components/NavBar' // ← IMPORT NAVBAR

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend)

const API_BASE = 'http://localhost:5000/api'
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const LABELS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

export default function PrayerTimes() {
  const token = getToken()
  const today = formatDate(new Date())
  const [coords, setCoords] = useState(null)
  const [city, setCity] = useState('')
  const [times, setTimes] = useState(null)
  const [logs, setLogs] = useState([])
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])
  const [dailyCount, setDailyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API_BASE}/salah/logs?start=${today}&end=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const arr = await r.json()
      setLogs(arr.map((x) => x.prayer))
      setDailyCount(arr.length)
      const r7 = await fetch(`${API_BASE}/salah/stats?days=7`, { headers: { Authorization: `Bearer ${token}` } })
      if (r7.ok) setWeekly(await r7.json())
        const r30 = await fetch(`${API_BASE}/salah/stats?days=30`, { headers: { Authorization: `Bearer ${token}` } })
        if (r30.ok) setMonthly(await r30.json())
    } catch (e) {
      console.warn(e)
    }
  }

  const toggle = async (p) => {
    const done = logs.includes(p)
    setLogs((d) => (done ? d.filter((x) => x !== p) : [...d, p]))
    setDailyCount((c) => (done ? c - 1 : c + 1))
    await fetch(`${API_BASE}/salah/log`, {
      method: done ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prayer: p, date: today }),
    })
    fetchStats()
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setCoords(coords)
        try {
          const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`)
          if (gr.ok) {
            const j = await gr.json()
            setCity(j.address.city || j.address.town || j.address.village || '')
          }
        } catch {}
        try {
          await fetch(`${API_BASE}/prayer/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude, method: 'Karachi' }),
          })
          const tr = await fetch(`${API_BASE}/prayer/today`, { headers: { Authorization: `Bearer ${token}` } })
          const tjson = await tr.json()
          setTimes(tjson)
          fetchStats()
        } catch (e) {
          setError(e.message)
        }
        setLoading(false)
      },
      (e) => {
        setError('Location denied')
        setLoading(false)
      }
    )
  }, [token])

  if (loading)
    return (
      <>
      <NavBar />
      <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <p className="text-white text-2xl animate-pulse">Loading...</p>
      </div>
      </>
    )

    if (error)
      return (
        <>
        <NavBar />
        <div className="h-screen flex items-center justify-center bg-cover bg-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')" }}>
        <p className="bg-red-600 bg-opacity-75 p-4 rounded text-white text-xl">{error}</p>
        </div>
        </>
      )

      const barData = {
        labels: LABELS,
        datasets: [
          {
            data: PRAYERS.map((_, i) => {
              const [h, m] = times[PRAYERS[i]].split(':').map(Number)
              return h + m / 60
            }),
            backgroundColor: 'rgba(255,215,0,0.6)',
          },
        ],
      }

      const lineData = (st) => ({
        labels: st.map((s) => s.date),
                                datasets: [
                                  {
                                    data: st.map((s) => s.completed),
                                fill: false,
                                tension: 0.3,
                                borderColor: 'rgba(255,215,0,1)',
                                  },
                                ],
      })

      return (
        <>
        <NavBar />
        <div className="min-h-screen w-full relative bg-cover bg-center flex justify-center items-center pt-20" style={{ backgroundImage: "url('/home-back.jpg')", fontFamily: "'Poppins', sans-serif" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70" />
        <div className="relative z-10 w-full max-w-4xl p-8 bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl space-y-8">
        <h2 className="text-4xl font-bold text-white text-center">Prayer Dashboard</h2>
        {coords && (
          <p className="text-gray-300 text-center">
          Location: {city || `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`}
          </p>
        )}
        <div className="bg-gray-700 bg-opacity-50 p-6 rounded-2xl space-y-4">
        <h3 className="text-2xl text-white">Today's Prayers</h3>
        <div className="grid grid-cols-2 gap-4">
        {PRAYERS.map((p, i) => (
          <button
          key={p}
          onClick={() => toggle(p)}
          className={`flex justify-between items-center px-4 py-3 rounded-lg transition ${
            logs.includes(p)
            ? 'bg-yellow-500 text-gray-900'
            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-40'
          }`}
          >
          <span className="capitalize">{LABELS[i]}</span>
          <span className="font-mono">{times[p]}</span>
          </button>
        ))}
        </div>
        <p className="text-gray-300">Completed: {dailyCount}/{PRAYERS.length}</p>
        </div>

        <div>
        <h3 className="text-2xl text-white mb-2">Prayer Times Distribution</h3>
        <Bar
        data={barData}
        options={{
          scales: { y: { min: 0, max: 24, title: { display: true, text: 'Hour' } } },
          plugins: { legend: { display: false } },
        }}
        />
        </div>

        <div>
        <h3 className="text-2xl text-white mb-2">Last 7 Days</h3>
        {weekly.length > 0 ? (
          <Line data={lineData(weekly)} options={{ scales: { y: { min: 0, max: PRAYERS.length, ticks: { stepSize: 1 } } } }} />
        ) : (
          <p className="text-gray-300">No prayer data for the last 7 days</p>
        )}
        </div>

        <div>
        <h3 className="text-2xl text-white mb-2">Last 30 Days</h3>
        {monthly.length > 0 ? (
          <Line data={lineData(monthly)} options={{ scales: { y: { min: 0, max: PRAYERS.length, ticks: { stepSize: 1 } } } }} />
        ) : (
          <p className="text-gray-300">No prayer data for the last 30 days</p>
        )}
        </div>
        </div>
        </div>
        </>
      )
}
