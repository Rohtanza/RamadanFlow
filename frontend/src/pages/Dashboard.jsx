import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPray, FaBook, FaHandHoldingHeart, FaCalculator, FaCalendarAlt, FaMoon, FaComments, FaMosque, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { usePrayerState } from '../hooks/usePrayerState'

// Utility function for merging Tailwind classes
const cn = (...inputs) => twMerge(clsx(inputs))

// Uplifting Islamic quotes
const quotes = [
  'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ‎ (Quran 2:153)',
  'وَمَنْ يَتَّقِ اللَّهَ يَجْعَل لَهُ مَخْرَجًا‎ (Quran 65:2)',
  'رَبِّ زِدْنِي عِلْمًا‎ (Quran 20:114)',
  'وَقُل رَّبِّ زِدْنِي عِلْمًا‎ (Supplication for knowledge)',
  'فَاذْكُرُونِي أَذْكُرْكُمْ‎ (Invoke Me, I will respond to you)'
]

export default function Dashboard() {
  const { user } = useAuth()
  const [currentQuote, setCurrentQuote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    times,
    logs,
    dailyCount,
    streak,
    loading
  } = usePrayerState()

  // Get next prayer
  const nextPrayer = useMemo(() => {
    if (!times) return null;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const prayer of prayers) {
      const [h, m] = (times[prayer] || '00:00').split(':').map(Number);
      const prayerTime = h + (m / 60);
      if (prayerTime > currentTime) {
        return {
          name: prayer.charAt(0).toUpperCase() + prayer.slice(1),
          time: times[prayer]
        };
      }
    }
    return { name: 'Fajr', time: times['fajr'] }; // Next day's Fajr
  }, [times]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  const cards = [
    { title: 'Prayer Times',    desc: 'Manage your daily prayer schedule.',    link: '/prayer', icon: FaPray },
    { title: 'Quran Reader',    desc: 'Read the Holy Quran with translations.', link: '/quran', icon: FaBook },
    { title: 'Azkar & Duas',    desc: 'Daily remembrances and supplications.',    link: '/azkar', icon: FaHandHoldingHeart },
    { title: 'Tasbih Counter',  desc: 'Count your dhikr with a beautiful counter.', link: '/tasbih', icon: FaCalculator },
    { title: 'Hijri Calendar',  desc: 'Islamic dates and upcoming events.',       link: '/calendar', icon: FaCalendarAlt },
    { title: 'Ramadan Goals',   desc: 'Track your Ramadan goals and reflections.', link: '/ramadan', icon: FaMoon },
    { title: 'Community Chat',  desc: 'Connect with other Muslims in real-time.',  link: '/chat', icon: FaComments }
  ]

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    hover: { 
      scale: 1.03, 
      boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
      transition: { duration: 0.3 }
    }
  }

  const quoteVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  }

  // Calculate the number of columns based on screen size and number of cards
  const getGridClass = (index, totalCards) => {
    // For the last row when it's not complete
    const cardsInLastRow = totalCards % 4; // for 2xl screens
    if (cardsInLastRow !== 0 && index >= totalCards - cardsInLastRow) {
      const offset = Math.floor((4 - cardsInLastRow) / 2);
      if (offset > 0) {
        return `2xl:col-start-${offset + 1}`;
      }
    }
    return '';
  };

  return (
    <div className="flex-1 w-full bg-cover bg-center relative" style={{ 
      backgroundImage: "url('/home-back.jpg')", 
      fontFamily: "'Poppins', sans-serif'",
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 to-black/90 pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="relative min-h-full">
        <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-700/30">
              <span 
                className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent" 
                style={{ 
                  fontFamily: 'Amiri, serif',
                  letterSpacing: '0.05em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                السَّلامُ عَلَيْكُم
              </span>
              <span className="text-gray-400">•</span>
              <span 
                className="text-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '0.05em',
                  fontWeight: '500'
                }}
              >
                {user.name}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={statCardVariants}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <FaCheckCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prayers Completed</p>
                  <p className="text-2xl font-bold text-white">{dailyCount}/5</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={statCardVariants}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <FaChartLine className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-white">{streak} days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={statCardVariants}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <FaClock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Next Prayer</p>
                  <p className="text-xl font-bold text-white">
                    {nextPrayer ? `${nextPrayer.name} (${nextPrayer.time})` : 'Loading...'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Daily Quote */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              variants={quoteVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-5 mb-8 border border-gray-700/50 text-center"
            >
              <p className="text-xl text-yellow-400 font-arabic mb-2">{currentQuote}</p>
              <p className="text-gray-400 text-sm">Daily Reminder</p>
            </motion.div>
          </AnimatePresence>

          {/* Cards Grid Container */}
          <div className="flex flex-col items-center w-full">
            <div className="w-full" style={{ maxWidth: '1400px' }}>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 place-items-center"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {cards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    className={cn(
                      "bg-gradient-to-br from-gray-800/50 to-gray-900/50",
                      "backdrop-blur-md rounded-xl p-5",
                      "flex flex-col justify-between",
                      "border border-gray-700/50 hover:border-yellow-500/30",
                      "transition-all duration-300",
                      "h-full w-full max-w-sm",
                      getGridClass(index, cards.length)
                    )}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <card.icon className="text-xl text-yellow-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-yellow-100">
                          {card.title}
                        </h2>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <Link
                      to={card.link}
                      className={cn(
                        "mt-4 self-start px-5 py-2",
                        "bg-gradient-to-r from-yellow-500 to-yellow-600",
                        "text-gray-900 font-semibold rounded-full",
                        "text-sm",
                        "transition-all duration-300",
                        "hover:from-yellow-400 hover:to-yellow-500",
                        "hover:shadow-lg hover:shadow-yellow-500/25"
                      )}
                    >
                      Explore
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
