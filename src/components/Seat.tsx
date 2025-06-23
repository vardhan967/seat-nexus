
import React from 'react';
import { cn } from '../lib/utils';

interface SeatProps {
  id: number;
  number: string;
  isAvailable: boolean;
  isSelected: boolean;
  isBooked: boolean;
  onClick: () => void;
}

const Seat: React.FC<SeatProps> = ({
  id,
  number,
  isAvailable,
  isSelected,
  isBooked,
  onClick
}) => {
  const getStatusColor = () => {
    if (isBooked) return 'bg-red-500 hover:bg-red-600';
    if (!isAvailable) return 'bg-gray-400 cursor-not-allowed';
    if (isSelected) return 'bg-blue-500 hover:bg-blue-600 ring-2 ring-blue-300';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getStatusText = () => {
    if (isBooked) return 'Booked';
    if (!isAvailable) return 'Unavailable';
    if (isSelected) return 'Selected';
    return 'Available';
  };

  return (
    <div
      className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all duration-200 transform hover:scale-105',
        getStatusColor(),
        !isAvailable && 'cursor-not-allowed'
      )}
      onClick={isAvailable && !isBooked ? onClick : undefined}
      title={`Seat ${number} - ${getStatusText()}`}
    >
      {number}
    </div>
  );
};

export default Seat;
