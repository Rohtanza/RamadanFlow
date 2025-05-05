// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) {
      setError('Please complete the captcha');
      return;
    }
    try {
      await registerUser({ name, email, password, captcha });
      navigate('/');
    } catch (err) {
      setError(err.errors?.[0]?.msg || 'Registration failed');
    }
  };

  return (
    <div
    className="min-h-screen bg-cover bg-center relative"
    style={{ backgroundImage: `url('/bg.jpg')` }}
    >
    <div className="absolute inset-0 bg-black bg-opacity-30"></div>

    <nav className="relative z-10 flex items-center justify-between p-6 text-white">
    <span className="text-2xl font-bold">Noor Al‑Iman</span>
    <Link
    to="/login"
    className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition"
    >
    Login
    </Link>
    </nav>

    <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
    <div className="bg-white bg-opacity-30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-300">
    <h1 className="text-3xl font-bold text-center text-white mb-6">Register</h1>
    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

    <form onSubmit={handleSubmit} className="space-y-4">
    <input
    type="text"
    placeholder="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
    />

    <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
    />

    <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
    />

    <ReCAPTCHA
    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
    onChange={(token) => setCaptcha(token)}
    className="mx-auto"
    />

    <button
    type="submit"
    className="w-full py-3 bg-black bg-opacity-70 text-white rounded-md hover:bg-opacity-90 transition"
    >
    Sign Up
    </button>
    </form>

    <p className="text-center text-white mt-6">
    Already have an account?{' '}
    <Link to="/login" className="hover:underline font-semibold">
    Login
    </Link>
    </p>
    </div>
    </div>
    </div>
  );
}
