
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    console.log('LoginPage: Checking authentication status:', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting login with username:', username);

    try {
      const response = await apiClient.post('/api/auth/jwt/create/', {
        username,
        password
      });

      console.log('Login API response status:', response.status);
      console.log('Login API response data:', response.data);

      if (response.status === 200) {
        console.log('Login successful, calling login function');
        login(response.data.access);
        console.log('Navigating to dashboard');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Library Seat Booking System
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to book seats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Register
              </Link>
            </p>
          </div>
          
          {/* Test credentials for debugging */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Test Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>User: testuser / password123</p>
              <p>Admin: admin / admin123</p>
              <p>User: john_doe / library2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
