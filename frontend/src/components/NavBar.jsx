// src/components/NavBar.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiMenu, HiX } from 'react-icons/hi'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/dashboard', label: 'Home' },
    { to: '/prayer',    label: 'Prayer Times' },
    { to: '/quran',     label: 'Quran Reader' },
    { to: '/azkar',     label: 'Azkar' },
    { to: '/tasbih',    label: 'Tasbih' },
    { to: '/calendar',  label: 'Hijri Calendar' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-gray-900/60 to-gray-900/30 backdrop-blur-lg shadow-lg">
    <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
    {/* Logo */}
    <NavLink to="/dashboard" className="text-2xl font-extrabold text-white hover:drop-shadow-lg transition">
    Noor Al-Iman
    </NavLink>

    {/* Desktop Links */}
    <div className="hidden md:flex items-center space-x-4">
    {links.map(({ to, label }) => (
      <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
      [
        'px-4 py-2 rounded-full font-medium transition',
        isActive
        ? 'bg-yellow-500 text-gray-900 shadow-md'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      ].join(' ')
      }
      >
      {label}
      </NavLink>
    ))}

    <button
    onClick={logout}
    className="ml-4 px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
    >
    Logout ({user.name})
    </button>
    </div>

    {/* Mobile Toggle */}
    <button
    className="md:hidden text-gray-200 focus:outline-none"
    onClick={() => setOpen(o => !o)}
    >
    {open ? <HiX size={28}/> : <HiMenu size={28}/>}
    </button>
    </div>

    {/* Mobile Menu */}
    <div
    className={`md:hidden bg-gray-800/75 backdrop-blur-lg overflow-hidden transition-[max-height] duration-300 ${
      open ? 'max-h-screen py-4' : 'max-h-0'
    }`}
    >
    <div className="px-6 flex flex-col items-center space-y-3">
    {links.map(({ to, label }) => (
      <NavLink
      key={to}
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
      [
        'w-full text-center px-4 py-2 rounded-full font-medium transition',
        isActive
        ? 'bg-yellow-500 text-gray-900'
        : 'text-gray-200 hover:bg-gray-700'
      ].join(' ')
      }
      >
      {label}
      </NavLink>
    ))}

    <button
    onClick={() => { setOpen(false); logout() }}
    className="w-full mt-3 px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
    >
    Logout ({user.name})
    </button>
    </div>
    </div>
    </nav>
  )
}
