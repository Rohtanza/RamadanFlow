// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send.');
    }
  };

  if (sent) {
    return <p className="p-6 text-center">Check your email for the reset link.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-white">
        <h2 className="text-2xl mb-4">Forgot Password</h2>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded bg-gray-700 placeholder-gray-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
