import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, googleLoginUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('Google Sign-In response received');
      const result = await googleLoginUser(credentialResponse.credential);
      console.log('Google login result:', result);
      
      if (result?.user) {
        addNotification('Successfully logged in with Google', 'success');
        navigate('/');
      } else {
        throw new Error('Failed to get user data after Google login');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError(error.message || 'Google Sign-In failed. Please try again.');
      addNotification('Google Sign-In failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
    setError('Failed to sign in with Google');
    addNotification('Google Sign-In failed', 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) {
      setError('Please complete the captcha');
      addNotification('Please complete the captcha', 'warning');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      await loginUser({ email, password, captcha });
      addNotification('Successfully logged in', 'success');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      addNotification('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url('/bg.jpg')` }}>
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <nav className="relative z-10 flex items-center justify-between p-6 text-white">
        <span className="text-2xl font-bold">Noor Al‑Iman</span>
        <Link to="/register" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition">
          Register
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="bg-white bg-opacity-30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-300">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Login</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none"
              disabled={isLoading}
            />
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={token => setCaptcha(token)}
            />
            <button
              type="submit"
              className={`w-full py-3 bg-black bg-opacity-70 text-white rounded-md transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center my-4 text-white">
            <hr className="flex-grow border-gray-400" />
            <span className="mx-2">OR</span>
            <hr className="flex-grow border-gray-400" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              shape="circle"
              text="signin_with"
              size="large"
              width="300"
            />
          </div>

          <p className="mt-4 text-center">
            <Link to="/forgot-password" className="text-yellow-400 hover:underline">
              Forgot password?
            </Link>
          </p>

          <p className="text-center text-white mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="hover:underline font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
