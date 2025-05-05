import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState('');
  const { loginUser, googleLoginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (res) => {
        try {
          await googleLoginUser(res.credential);
          navigate('/');
        } catch (e) {
          setError(e.errors?.[0]?.msg || 'Google Sign-In failed');
        }
      }
    });
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
                                    { theme: 'filled_black', size: 'large', shape: 'circle' }
    );
  }, []); // empty array prevents size change ■

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captcha) return setError('Please complete the captcha');
    try {
      await loginUser({ email, password, captcha });
      navigate('/');
    } catch (e) {
      setError(e.errors?.[0]?.msg || 'Login failed');
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
    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

    <form onSubmit={handleSubmit} className="space-y-4">
    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none" />
    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 rounded bg-transparent border-b-2 border-white text-white placeholder-gray-300 focus:outline-none" />
    <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={token => setCaptcha(token)} />
    <button type="submit" className="w-full py-3 bg-black bg-opacity-70 text-white rounded-md hover:bg-opacity-90 transition">Login</button>
    </form>

    <div className="flex items-center my-4 text-white">
    <hr className="flex-grow border-gray-400" />
    <span className="mx-2">OR</span>
    <hr className="flex-grow border-gray-400" />
    </div>

    <div id="google-btn" className="flex justify-center"></div>
    <p className="mt-4 text-center">
    <Link to="/forgot-password" className="text-yellow-400 hover:underline">
    Forgot password?
    </Link>
    </p>

    <p className="text-center text-white mt-6">
    Don't have an account? <Link to="/register" className="hover:underline font-semibold">Register</Link>
    </p>
    </div>
    </div>
    </div>
  );
}
