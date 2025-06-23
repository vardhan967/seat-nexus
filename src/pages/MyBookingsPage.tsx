
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import apiClient from '../api/client';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

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
      fetchBookings(); // Refresh the list
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
        return 'bg-blue-500';
      case 'checked-in':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const BookingCard: React.FC<{ booking: Booking; showCancel?: boolean }> = ({ booking, showCancel = false }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              Seat {booking.seat.number} - {booking.seat.section.name}
            </h3>
            <p className="text-gray-600">
              {format(new Date(booking.start_time), 'PPP p')} - {format(new Date(booking.end_time), 'p')}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
        
        {booking.status.toLowerCase() === 'confirmed' && booking.qr_code_token && (
          <div className="flex flex-col items-center space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Your QR Code:</p>
            <QRCodeSVG value={booking.qr_code_token} size={128} />
            <p className="text-xs text-gray-500 text-center">
              Show this QR code for check-in
            </p>
          </div>
        )}
        
        {showCancel && booking.status.toLowerCase() === 'confirmed' && (
          <Button
            onClick={() => cancelBooking(booking.id)}
            variant="destructive"
            size="sm"
          >
            Cancel Booking
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">My Bookings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Upcoming Bookings ({upcomingBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
                ) : (
                  upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} showCancel={true} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Past Bookings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">
                  Past Bookings ({pastBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No past bookings</p>
                ) : (
                  pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
