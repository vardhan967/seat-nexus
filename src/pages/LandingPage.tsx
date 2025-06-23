
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import TimelineSelector from '../components/TimelineSelector';

interface Section {
  id: number;
  name: string;
  description: string;
}

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(11);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await apiClient.get('/api/sections/');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleFindSeats = () => {
    if (!selectedSection || !selectedDate) {
      alert('Please select all required fields');
      return;
    }

    const searchParams = new URLSearchParams({
      section: selectedSection,
      date: selectedDate.toISOString().split('T')[0],
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`
    });

    navigate(`/seat-selection?${searchParams.toString()}`);
  };

  const getDuration = () => {
    const hours = endTime - startTime;
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#00B9F5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Library Booking</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">Welcome, {user?.first_name}!</span>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="primary-button"
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <div className="space-x-3">
                  <Link to="/login">
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="primary-button">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Study Spot
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book library seats easily and enjoy a comfortable study environment
          </p>
        </div>

        {/* Find Your Seat Card */}
        <div className="modern-card max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Find Your Seat</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Section Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select a Section
              </label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Date
              </label>
              <div className="relative">
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                />
              </div>
            </div>

            {/* Duration Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <div className="h-12 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center">
                <span className="text-gray-900 font-medium">{getDuration()}</span>
              </div>
            </div>
          </div>

          {/* Timeline Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Time Slot
            </label>
            <TimelineSelector
              startTime={startTime}
              endTime={endTime}
              onChange={(start, end) => {
                setStartTime(start);
                setEndTime(end);
              }}
            />
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleFindSeats}
              className="primary-button text-lg px-12 py-4"
              disabled={!selectedSection || !selectedDate}
            >
              Find Available Seats
            </Button>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#00B9F5]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Booking</h3>
            </div>
            <p className="text-gray-600">
              Book your preferred seat in just a few clicks with our intuitive interface.
            </p>
          </div>

          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">QR Check-in</h3>
            </div>
            <p className="text-gray-600">
              Quick and contactless check-in using QR codes for a seamless experience.
            </p>
          </div>

          <div className="modern-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Flexible Hours</h3>
            </div>
            <p className="text-gray-600">
              Choose your study duration with our flexible time slot selection system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
