
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import apiClient from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Analytics {
  total_seats: number;
  occupied_seats: number;
  occupancy_rate: number;
  bookings_today: number;
  no_show_rate: number;
}

const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/api/admin/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ 
    title, 
    value, 
    description 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>
        
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Seats"
              value={analytics.total_seats}
              description="Total seats in the library"
            />
            <StatCard
              title="Occupied Seats"
              value={analytics.occupied_seats}
              description="Currently occupied"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${analytics.occupancy_rate.toFixed(1)}%`}
              description="Current occupancy"
            />
            <StatCard
              title="Bookings Today"
              value={analytics.bookings_today}
              description="Total bookings today"
            />
            <StatCard
              title="No-Show Rate"
              value={`${analytics.no_show_rate.toFixed(1)}%`}
              description="Users who didn't show up"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                <h3 className="font-semibold text-blue-800">View All Bookings</h3>
                <p className="text-sm text-blue-600 mt-1">Manage current bookings</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                <h3 className="font-semibold text-green-800">Check-In Users</h3>
                <p className="text-sm text-green-600 mt-1">Scan QR codes for check-in</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                <h3 className="font-semibold text-purple-800">Manage Sections</h3>
                <p className="text-sm text-purple-600 mt-1">Add or modify sections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
