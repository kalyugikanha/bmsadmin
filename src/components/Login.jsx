import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLandmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Re-added role state
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Only sending email and password
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      login(data.accessToken, role); // Pass selected role to context's login function
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-staymaster-light-bg p-4 font-sans">
      <div className="bg-staymaster-white-bg p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center items-center mb-6">
          <FaLandmark className="w-8 h-8 text-staymaster-primary mr-2" />
          <span className="text-3xl font-bold text-staymaster-primary">Staymaster</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-staymaster-text-dark mb-4">Welcome Back!</h2>
        <p className="text-center text-staymaster-text-gray mb-8">Login to your account</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-staymaster-text-gray text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border border-staymaster-border-light rounded w-full py-3 px-4 text-staymaster-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-staymaster-primary focus:border-transparent text-sm"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-staymaster-text-gray text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border border-staymaster-border-light rounded w-full py-3 px-4 text-staymaster-text-dark mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-staymaster-primary focus:border-transparent text-sm" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Re-added role selection */}
          <div className="mb-6">
            <label htmlFor="role" className="block text-staymaster-text-gray text-sm font-semibold mb-2">
              Select Role
            </label>
            <select
              id="role"
              className="shadow-sm border border-staymaster-border-light rounded w-full py-3 px-4 text-staymaster-text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-staymaster-primary focus:border-transparent text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="hospitality">Hospitality</option>
              <option value="finance">Finance</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-staymaster-primary hover:bg-teal-700 text-staymaster-white-bg font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out text-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;