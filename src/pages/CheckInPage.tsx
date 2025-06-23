
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import apiClient from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { QrReader } from 'react-qr-reader';

const CheckInPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = async (data: string | null) => {
    if (data) {
      setIsScanning(false);
      try {
        const response = await apiClient.post('/api/admin/check-in/', {
          qr_code_token: data
        });

        if (response.status === 200) {
          const { user, seat, booking } = response.data;
          setResult(`Successfully checked in ${user.first_name} ${user.last_name} for Seat ${seat.number} in ${seat.section.name}`);
        }
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setResult(`Error: ${error.response.data.detail}`);
        } else {
          setResult('Error: Invalid QR Code or check-in failed');
        }
      }

      // Reset scanning after 3 seconds
      setTimeout(() => {
        setIsScanning(true);
        setResult('');
      }, 3000);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setResult('Error: Camera not accessible or QR scanner failed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
          Scan User QR Code for Check-In
        </h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 text-center">
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isScanning && (
                <div className="relative">
                  <QrReader
                    onResult={(result, error) => {
                      if (!!result) {
                        handleScan(result?.getText());
                      }
                      if (!!error) {
                        handleError(error);
                      }
                    }}
                    style={{ width: '100%' }}
                    constraints={{
                      facingMode: 'environment'
                    }}
                  />
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Position the QR code within the camera view
                  </div>
                </div>
              )}
              
              {result && (
                <div className={`p-4 rounded-lg text-center ${
                  result.includes('Successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  <p className="font-medium">{result}</p>
                </div>
              )}
              
              {!isScanning && !result && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Processing QR code...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ask users to show their booking QR code</li>
                <li>• Position the QR code clearly within the camera view</li>
                <li>• The system will automatically process valid QR codes</li>
                <li>• Successfully checked-in users will be marked as present</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
