// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiMenu, HiX, HiMoon, HiSun } from 'react-icons/hi'
import { 
  FaHome, 
  FaPray, 
  FaQuran, 
  FaPrayingHands, 
  FaComments,
  FaCalendarAlt,
  FaMosque,
  FaMoon as FaRamadan
} from 'react-icons/fa'
import ProfileMenu from './ProfileMenu'

const NavBar = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navLinks = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/prayer', label: 'Prayer Times', icon: FaPray },
    { path: '/quran', label: 'Quran', icon: FaQuran },
    { path: '/azkar', label: 'Azkar', icon: FaPrayingHands },
    { path: '/tasbih', label: 'Tasbih', icon: FaPrayingHands },
    { path: '/chat', label: 'Community', icon: FaComments },
    { path: '/calendar', label: 'Calendar', icon: FaCalendarAlt },
    { path: '/ramadan', label: 'Ramadan', icon: FaRamadan }
  ]

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-800' 
          : 'bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center border-4 border-gray-900 shadow-md">
                <FaMosque className="w-7 h-7 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-yellow-400 font-poppins whitespace-nowrap">
                  RamadanFlow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'text-gray-900 bg-yellow-400 shadow-lg shadow-yellow-500/20'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                      isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-yellow-400'
                    }`} />
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {/* Profile menu for download activity */}
              {user && <ProfileMenu user={user} logout={logout} />}
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-xl text-gray-300 hover:text-yellow-400 transition-colors duration-200 hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[calc(100vh-5rem)] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-gray-900 shadow-lg border-t border-gray-800`}>
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-gray-900 bg-yellow-400 shadow-lg shadow-yellow-500/20'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`} />
                  {link.label}
                </Link>
              )
            })}
            {/* Profile menu for download activity in mobile */}
            {user && <div className="mt-4"><ProfileMenu user={user} logout={logout} mobile /></div>}
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavBar
