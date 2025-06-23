
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Calendar, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-blue-400">Library Booking</h1>
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/my-bookings"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/admin/check-in"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Check-In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user?.first_name}!</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
