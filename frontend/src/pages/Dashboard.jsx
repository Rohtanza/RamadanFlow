import React, { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Uplifting Islamic quotes
const quotes = [
  'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ‎ (Quran 2:153)',
  'وَمَنْ يَتَّقِ اللَّهَ يَجْعَل لَهُ مَخْرَجًا‎ (Quran 65:2)',
  'رَبِّ زِدْنِي عِلْمًا‎ (Quran 20:114)',
  'وَقُل رَّبِّ زِدْنِي عِلْمًا‎ (Supplication for knowledge)',
  'فَاذْكُرُونِي أَذْكُرْكُمْ‎ (Invoke Me, I will respond to you)'
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const randomQuote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
                              []
  )

  const cards = [
    { title: 'Prayer Times',    desc: 'Manage your daily prayer schedule.',    link: '/prayer' },
    { title: 'Quran Reader',    desc: 'Read the Holy Quran with translations.', link: '/quran' },
    { title: 'Azkar & Duas',    desc: 'Daily remembrances and supplications.',    link: '/azkar' },
    { title: 'Tasbih Counter',  desc: 'Count your dhikr with a beautiful counter.', link: '/tasbih' },
    { title: 'Hijri Calendar',  desc: 'Islamic dates and upcoming events.',       link: '/calendar' }
  ]

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    hover:  { scale: 1.03, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }
  }

  return (
    <div
    className="min-h-screen w-full bg-cover bg-center relative flex items-center justify-center"
    style={{ backgroundImage: "url('/home-back.jpg')", fontFamily: "'Poppins', sans-serif'" }}
    >
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-black/80" />

    <div className="relative z-10 w-full max-w-screen-xl px-6 py-16">
    {/* Header */}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
    <h1 className="text-6xl font-extrabold text-white leading-tight">
    السلام عليكم، <span className="text-yellow-400">{user.name}</span>!
    </h1>
    <button
    onClick={logout}
    className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl text-lg transition"
    >
    Logout
    </button>
    </div>

    {/* Quote */}
    <blockquote className="text-2xl italic text-center text-yellow-300 mx-auto max-w-3xl mb-16 drop-shadow-lg">
    “{randomQuote}”
    </blockquote>

    {/* First Row: Three Cards */}
    <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
    variants={containerVariants}
    initial="hidden"
    animate="show"
    >
    {cards.slice(0, 3).map(card => (
      <motion.div
      key={card.title}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-16 w-full max-w-lg flex flex-col justify-between shadow-2xl border border-gray-700/50"
      variants={cardVariants}
      whileHover="hover"
        >
        <div>
        <h2 className="text-4xl font-semibold text-yellow-100 mb-6">
        {card.title}
        </h2>
        <p className="text-gray-300 text-xl leading-relaxed">
        {card.desc}
        </p>
        </div>
        <Link
        to={card.link}
        className="mt-10 self-start px-16 py-4 bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-lg text-xl transition-colors hover:bg-yellow-400 hover:shadow-xl"
        >
        Go
        </Link>
        </motion.div>
    ))}
    </motion.div>

    {/* Second Row: Two Cards Centered */}
    <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mt-12 max-w-[900px] mx-auto"
    variants={containerVariants}
    initial="hidden"
    animate="show"
    >
    {cards.slice(3).map(card => (
      <motion.div
      key={card.title}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-3xl p-16 w-full max-w-lg flex flex-col justify-between shadow-2xl border border-gray-700/50"
      variants={cardVariants}
      whileHover="hover"
        >
        <div>
        <h2 className="text-4xl font-semibold text-yellow-100 mb-6">
        {card.title}
        </h2>
        <p className="text-gray-300 text-xl leading-relaxed">
        {card.desc}
        </p>
        </div>
        <Link
        to={card.link}
        className="mt-10 self-start px-16 py-4 bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-lg text-xl transition-colors hover:bg-yellow-400 hover:shadow-xl"
        >
        Go
        </Link>
        </motion.div>
    ))}
    </motion.div>
    </div>
    </div>
  )
}
