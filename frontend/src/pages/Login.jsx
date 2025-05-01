import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.errors?.[0]?.msg || 'Login failed');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign In failed');
  };

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url('./public/bg.jpg')` }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between p-6 text-white">
        <span className="text-2xl font-bold">Noor-ul-Eman</span>
        <div className="flex space-x-6">
          <Link to="/register" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition">Register</Link>
        </div>
      </nav>

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="bg-white bg-opacity-30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-300">
          {/* Close button (optional) */}
          <div className="flex justify-end">
            <button className="text-gray-300 hover:text-white">&times;</button>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-6">Login</h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-white text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="hover:underline">Forgot Password?</Link>
            </div>

            <button type="submit" className="w-full py-3 bg-black bg-opacity-70 text-white rounded-md hover:bg-opacity-90 transition">
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4 text-white">
            <hr className="flex-grow border-gray-400" />
            <span className="mx-2">OR</span>
            <hr className="flex-grow border-gray-400" />
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="circle"
              size="large"
            />
          </div>

          {/* Register link */}
          <p className="text-center text-white mt-6">
            Don't have an account? <Link to="/register" className="hover:underline font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
