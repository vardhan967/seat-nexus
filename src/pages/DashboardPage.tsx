
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import Navigation from '../components/Navigation';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import Seat from '../components/Seat';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Section {
  id: number;
  name: string;
  description: string;
}

interface SeatData {
  id: number;
  number: string;
  section: number;
  is_available: boolean;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection && selectedDate) {
      fetchSeats();
    }
  }, [selectedSection, selectedDate, startTime, endTime]);

  const fetchSections = async () => {
    try {
      const response = await apiClient.get('/api/sections/');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await apiClient.get(`/api/seats/?section_id=${selectedSection}`);
      setSeats(response.data);
      setSelectedSeat(null);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const handleSeatClick = (seatId: number) => {
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !selectedDate || !startTime || !endTime) {
      alert('Please select all required fields');
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        seat_id: selectedSeat,
        start_time: `${selectedDate.toISOString().split('T')[0]}T${startTime}:00`,
        end_time: `${selectedDate.toISOString().split('T')[0]}T${endTime}:00`
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
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Welcome, {user?.first_name}!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date
                  </label>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                </div>

                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  label="Start Time"
                />

                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  label="End Time"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a section" />
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

                <Button
                  onClick={handleBookSeat}
                  disabled={!selectedSeat || isBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isBooking ? 'Booking...' : 'Book Seat'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Seat Map</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSection && seats.length > 0 ? (
                  <div className="grid grid-cols-8 gap-3">
                    {seats.map((seat) => (
                      <Seat
                        key={seat.id}
                        id={seat.id}
                        number={seat.number}
                        isAvailable={seat.is_available}
                        isSelected={selectedSeat === seat.id}
                        isBooked={!seat.is_available}
                        onClick={() => handleSeatClick(seat.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {selectedSection ? 'No seats available in this section' : 'Please select a section to view seats'}
                  </div>
                )}
                
                {selectedSection && seats.length > 0 && (
                  <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
