import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { googleLoginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      console.log('Google Sign-In Success:', credentialResponse);
      await googleLoginUser(credentialResponse.credential);
      navigate('/dashboard'); // or wherever you want to redirect after login
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
    setError('Failed to sign in with Google');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Sign In</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-4">
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
      </div>
    </div>
  );
};

export default Login; 