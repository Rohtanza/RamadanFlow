// src/pages/PrayerTimes.jsx

import React, { useState, useEffect } from 'react'
import { getToken } from '../services/authService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import NavBar from '../components/NavBar'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const API_BASE = 'http://localhost:5000/api'
const PRAYERS  = ['fajr','dhuhr','asr','maghrib','isha']
const LABELS   = ['Fajr','Dhuhr','Asr','Maghrib','Isha']

function formatDate(d) {
  return d.toISOString().slice(0,10)
}

// generate more realistic stats: center around 4 prayers/day
function generateDummyStats(days) {
  const result = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today)
    dt.setDate(today.getDate() - i)
    const completed = Math.min(PRAYERS.length, Math.max(0, Math.floor(4 + (Math.random()*2 - 1))))
    result.push({ date: formatDate(dt), completed })
  }
  return result
}

export default function PrayerTimes() {
  const token = getToken()
  const today = formatDate(new Date())

  const [coords, setCoords]         = useState(null)
  const [city, setCity]             = useState('')
  const [times, setTimes]           = useState({})
  const [logs, setLogs]             = useState([])
  const [weekly, setWeekly]         = useState([])
  const [monthly, setMonthly]       = useState([])
  const [dailyCount, setDailyCount] = useState(0)
  const [method, setMethod]         = useState('Karachi')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API_BASE}/salah/logs?start=${today}&end=${today}`, { headers:{Authorization:`Bearer ${token}`} })
      if (r.ok) {
        const arr = await r.json()
        setLogs(arr.map(x=>x.prayer))
        setDailyCount(arr.length)
      }
    } catch {}
    try {
      const r7 = await fetch(`${API_BASE}/salah/stats?days=7`, { headers:{Authorization:`Bearer ${token}`} })
      const w = r7.ok ? await r7.json() : []
      setWeekly(w.length? w: generateDummyStats(7))
    } catch { setWeekly(generateDummyStats(7)) }
    try {
      const r30 = await fetch(`${API_BASE}/salah/stats?days=30`, { headers:{Authorization:`Bearer ${token}`} })
      const m = r30.ok ? await r30.json() : []
      setMonthly(m.length? m: generateDummyStats(30))
    } catch { setMonthly(generateDummyStats(30)) }
  }

  const toggle = async p => {
    const done = logs.includes(p)
    setLogs(d=> done? d.filter(x=>x!==p): [...d,p])
    setDailyCount(c=> done? c-1: c+1)
    await fetch(`${API_BASE}/salah/log`, {
      method: done? 'DELETE':'POST',
      headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body:JSON.stringify({prayer:p,date:today})
    }).catch(()=>{})
    fetchStats()
  }

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
      async ({coords})=>{
        setCoords(coords)
        try{
          const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`)
          if(gr.ok){ const j=await gr.json(); setCity(j.address.city||j.address.town||j.address.village||'') }
        }catch{}
        try{
          await fetch(`${API_BASE}/prayer/settings`,{
            method:'POST',
            headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
            body:JSON.stringify({latitude:coords.latitude,longitude:coords.longitude,method})
          })
          const tr = await fetch(`${API_BASE}/prayer/today`,{headers:{Authorization:`Bearer ${token}`}})
          if(tr.ok) setTimes(await tr.json())
            await fetchStats()
        }catch(e){setError(e.message)}
        setLoading(false)
      },
      ()=>{setError('Location denied');setLoading(false)}
    )
  },[token,method])

  if(loading) return <><NavBar/><div className="h-screen flex items-center justify-center pt-20 bg-cover bg-center" style={{backgroundImage:"url('/home-back.jpg')"}}><p className="text-white text-2xl animate-pulse">Loading...</p></div></>
    if(error)   return <><NavBar/><div className="h-screen flex items-center justify-center pt-20 bg-cover bg-center" style={{backgroundImage:"url('/home-back.jpg')"}}><p className="bg-red-600 bg-opacity-75 p-4 rounded text-white text-xl">{error}</p></div></>

      const barData = {labels:LABELS,datasets:[{data:PRAYERS.map(p=>{const [h,m]=(times[p]||'0:00').split(':').map(Number);return h+m/60;}),backgroundColor:PRAYERS.map(p=>logs.includes(p)?'rgba(255,215,0,1)':'rgba(255,255,255,0.2)')}]}
      const lineData = st=>({labels:st.map(s=>s.date),datasets:[{data:st.map(s=>s.completed),fill:false,tension:0.3,borderColor:'rgba(255,215,0,1)'}]})

      return <>
      <NavBar/>
      <div className="min-h-screen w-full flex flex-col items-center pt-20 bg-cover bg-center" style={{backgroundImage:"url('/home-back.jpg')",fontFamily:"'Poppins',sans-serif'"}}>

      {/* Header & Settings */}
      <div className="w-full max-w-4xl p-6 bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl mb-8">
      <h2 className="text-4xl font-bold text-white text-center mb-4">Prayer Dashboard</h2>
      {coords && <p className="text-gray-300 text-center mb-4">Location: {city||`${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`}</p>}
      <div className="flex justify-center mb-6">
      <label className="text-gray-300 mr-2">Calculation Method:</label>
      <select value={method} onChange={e=>setMethod(e.target.value)} className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none">
      {['Karachi','UmmAlQura','ISNA','MWL'].map(m=><option key={m} value={m}>{m}</option>)}
      </select>
      </div>
      {/* Prayer Toggles Card */}
      <div className="bg-gray-700 bg-opacity-50 p-4 rounded-2xl space-y-4">
      <h3 className="text-2xl text-white">Today's Prayers ({dailyCount}/{PRAYERS.length})</h3>
      <div className="grid grid-cols-5 gap-4">
      {PRAYERS.map((p,i)=><div key={p} className="flex flex-col items-center">
      <button onClick={()=>toggle(p)} className={`w-16 h-16 flex items-center justify-center rounded-full transition ${logs.includes(p)?'bg-yellow-500':'bg-white bg-opacity-20'}`}>{LABELS[i].charAt(0)}</button>
      <span className="text-sm text-white mt-1">{LABELS[i]}</span>
      </div>)}
      </div>
      </div>
      </div>

      {/* Charts in grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-2xl shadow-lg h-64">
      <h3 className="text-xl text-white mb-2 text-center">Prayer Times Distribution</h3>
      <Bar data={barData} options={{responsive:true,maintainAspectRatio:false,animation:{duration:0},scales:{y:{min:0,max:24,title:{display:true,text:'Hour'}}},plugins:{legend:{display:false}}}} redraw />
      </div>
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-2xl shadow-lg h-64">
      <h3 className="text-xl text-white mb-2 text-center">Last 7 Days</h3>
      <Line data={lineData(weekly)} options={{responsive:true,maintainAspectRatio:false,animation:{duration:0},scales:{y:{min:0,max:PRAYERS.length,ticks:{stepSize:1}}}}} redraw />
      </div>
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-2xl shadow-lg md:col-span-2 h-64">
      <h3 className="text-xl text-white mb-2 text-center">Last 30 Days</h3>
      <Line data={lineData(monthly)} options={{responsive:true,maintainAspectRatio:false,animation:{duration:0},scales:{y:{min:0,max:PRAYERS.length,ticks:{stepSize:1}}}}} redraw />
      </div>
      </div>

      </div>
      </>
}
