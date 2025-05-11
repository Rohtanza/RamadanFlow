//frontend/src/pages/ResetPassword.jsx

import {useState,useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword()
{
    const {token} = useParams();
    const nav = useNavigate();
    const [valid,setValid] = useState(false);
    const [pass,setNewPass] = useState('');
    const [error, setError] = useState('');

    useEffect(()=>{
        axios.get(`/api/auth/reset=password/${token}`) //get method of axios
        .then(()=> setValid(true))
        .catch(()=>setError('Link invalid or expired. '));
    },[token]);  // depending on token receieved //


    const handleSubmit = async e => {
        e.preventDefault();

        try{
            await axios.post(`/api/auth/reset-password/${token}`,{password: pass}); //post method of axios
            nav('/login');
        }
        catch(err)
        {
            setError(err.response?.data?.msg || 'Failed to reset. ');
        }
        };

        if(!valid)
        {
            return <p className="p-6 text-center text-red-400">{error || ' Verifying Link ...'}</p>;
        }

        return (
    <div className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-white">
        <h2 className="text-2xl mb-4">Reset Password</h2>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            required
            className="w-full p-3 rounded bg-gray-700 placeholder-gray-400"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400">Reset Password</button>
        </form>
      </div>
    </div>
  );

}
