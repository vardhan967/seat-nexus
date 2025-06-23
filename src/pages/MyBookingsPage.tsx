
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import apiClient from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, QrCode, X } from 'lucide-react';

interface Booking {
  id: number;
  seat: {
    number: string;
    section: {
      name: string;
    };
  };
  start_time: string;
  end_time: string;
  status: string;
  qr_code_token: string;
}

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/api/bookings/');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      await apiClient.post(`/api/bookings/${bookingId}/cancel/`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error cancelling booking');
    }
  };

  const isUpcoming = (endTime: string) => {
    return new Date(endTime) > new Date();
  };

  const upcomingBookings = bookings.filter(booking => isUpcoming(booking.end_time));
  const pastBookings = bookings.filter(booking => !isUpcoming(booking.end_time));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-[#00B9F5] text-white';
      case 'checked-in':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const BookingCard: React.FC<{ booking: Booking; showActions?: boolean }> = ({ 
    booking, 
    showActions = false 
  }) => (
    <Card className="modern-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                Seat {booking.seat.number}
              </h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{booking.seat.section.name}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(booking.start_time), 'PPP')}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-3">
            {booking.status.toLowerCase() === 'confirmed' && booking.qr_code_token && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="secondary-button flex items-center space-x-2">
                    <QrCode className="w-4 h-4" />
                    <span>Show QR Code</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Your QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center space-y-4 py-6">
                    <QRCodeSVG value={booking.qr_code_token} size={200} />
                    <div className="text-center">
                      <p className="font-medium text-gray-900">Seat {booking.seat.number}</p>
                      <p className="text-sm text-gray-600">{booking.seat.section.name}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Show this QR code for check-in
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {showActions && booking.status.toLowerCase() === 'confirmed' && (
            <Button
              onClick={() => cancelBooking(booking.id)}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B9F5] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <Button
            onClick={() => navigate('/dashboard')}
            className="primary-button"
          >
            Book New Seat
          </Button>
        </div>
        
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-lg p-1 shadow-sm">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-[#00B9F5] data-[state=active]:text-white"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-[#00B9F5] data-[state=active]:text-white"
            >
              Completed ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingBookings.length === 0 ? (
              <div className="modern-card text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-6">Ready to book your next study session?</p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="primary-button"
                >
                  Book a Seat
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {pastBookings.length === 0 ? (
              <div className="modern-card text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed bookings</h3>
                <p className="text-gray-600">Your booking history will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBookingsPage;
