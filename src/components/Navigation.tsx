
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Calendar, Settings, QrCode } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#00B9F5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Library Booking</h1>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/my-bookings"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/admin/check-in"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Check-In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.first_name}!</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
