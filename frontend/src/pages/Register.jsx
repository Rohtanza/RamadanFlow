import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await registerUser({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.errors?.[0]?.msg || 'Registration failed');
    }
  };

  return (
    <div>
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <span className="text-lg font-bold">Noor ul Eman</span>
        <Link to="/login" className="underline">Login</Link>
      </nav>
      <div className="max-w-md mx-auto mt-10 p-4 shadow">
        <h1 className="text-xl mb-4">Register</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full p-2 border"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-2 border"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-2 border"
          />
          <button type="submit" className="w-full py-2 bg-green-600 text-white">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
