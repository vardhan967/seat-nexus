
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Filter, Zap } from 'lucide-react';

interface SeatData {
  id: number;
  number: string;
  section: {
    id: number;
    name: string;
  };
  is_available: boolean;
  has_power_outlet?: boolean;
  near_window?: boolean;
}

const SeatSelectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('number');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hasPowerOutlet: false,
    nearWindow: false
  });

  const sectionId = searchParams.get('section');
  const date = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSeats();
  }, [sectionId, date, startTime, endTime, isAuthenticated]);

  const fetchSeats = async () => {
    if (!sectionId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/seats/?section_id=${sectionId}`);
      setSeats(response.data);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async (seatId: number) => {
    if (!date || !startTime || !endTime) {
      alert('Missing booking information');
      return;
    }

    try {
      const bookingData = {
        seat_id: seatId,
        start_time: `${date}T${startTime}`,
        end_time: `${date}T${endTime}`
      };

      await apiClient.post('/api/bookings/', bookingData);
      alert('Booking successful!');
      navigate('/my-bookings');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('This seat is already booked for the selected time.');
      }
    }
  };

  const filteredSeats = seats.filter(seat => {
    if (filters.hasPowerOutlet && !seat.has_power_outlet) return false;
    if (filters.nearWindow && !seat.near_window) return false;
    return seat.is_available;
  });

  const sortedSeats = [...filteredSeats].sort((a, b) => {
    if (sortBy === 'number') {
      return a.number.localeCompare(b.number);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B9F5] mx-auto mb-4"></div>
          <p className="text-gray-600">Finding available seats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Available Seats</h1>
                <p className="text-sm text-gray-600">
                  {date} • {startTime} - {endTime}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80">
              <div className="modern-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B9F5] focus:border-transparent"
                    >
                      <option value="number">Seat Number (A-Z)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.hasPowerOutlet}
                          onChange={(e) => setFilters({...filters, hasPowerOutlet: e.target.checked})}
                          className="rounded border-gray-300 text-[#00B9F5] focus:ring-[#00B9F5]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Has Power Outlet</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.nearWindow}
                          onChange={(e) => setFilters({...filters, nearWindow: e.target.checked})}
                          className="rounded border-gray-300 text-[#00B9F5] focus:ring-[#00B9F5]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Near Window</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seats Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                Found {sortedSeats.length} available seats
              </p>
            </div>

            {sortedSeats.length === 0 ? (
              <div className="modern-card text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No seats available</p>
                <p className="text-gray-400">Try adjusting your filters or selecting a different time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSeats.map((seat) => (
                  <Card key={seat.id} className="modern-card hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Seat {seat.number}
                          </h3>
                          <p className="text-gray-600">{seat.section.name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Available
                        </Badge>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {seat.has_power_outlet && (
                          <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <Zap className="w-3 h-3" />
                            <span>Power Outlet</span>
                          </div>
                        )}
                        {seat.near_window && (
                          <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Window View</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleBookSeat(seat.id)}
                        className="w-full secondary-button"
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
