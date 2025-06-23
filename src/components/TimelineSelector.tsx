
import React, { useState, useRef, useCallback } from 'react';

interface TimelineSelectorProps {
  startTime: number;
  endTime: number;
  onChange: (startTime: number, endTime: number) => void;
  minHour?: number;
  maxHour?: number;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  startTime,
  endTime,
  onChange,
  minHour = 9,
  maxHour = 18
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState({ start: 0, end: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalHours = maxHour - minHour;
  const getTimeString = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getPercentage = (hour: number) => {
    return ((hour - minHour) / totalHours) * 100;
  };

  const getHourFromPosition = (clientX: number) => {
    if (!timelineRef.current) return minHour;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const hour = Math.round(minHour + (percentage * totalHours));
    return Math.max(minHour, Math.min(maxHour, hour));
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end' | 'range') => {
    setIsDragging(type);
    setDragStartX(e.clientX);
    setDragStartValue({ start: startTime, end: endTime });
  }, [startTime, endTime]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const deltaX = e.clientX - dragStartX;
    const rect = timelineRef.current.getBoundingClientRect();
    const hourDelta = Math.round((deltaX / rect.width) * totalHours);

    if (isDragging === 'start') {
      const newStart = Math.max(minHour, Math.min(endTime - 1, dragStartValue.start + hourDelta));
      onChange(newStart, endTime);
    } else if (isDragging === 'end') {
      const newEnd = Math.max(startTime + 1, Math.min(maxHour, dragStartValue.end + hourDelta));
      onChange(startTime, newEnd);
    } else if (isDragging === 'range') {
      const duration = dragStartValue.end - dragStartValue.start;
      const newStart = Math.max(minHour, Math.min(maxHour - duration, dragStartValue.start + hourDelta));
      const newEnd = newStart + duration;
      onChange(newStart, newEnd);
    }
  }, [isDragging, dragStartX, dragStartValue, startTime, endTime, minHour, maxHour, totalHours, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const clickedHour = getHourFromPosition(e.clientX);
    const duration = endTime - startTime;
    const newStart = Math.max(minHour, Math.min(maxHour - duration, clickedHour - Math.floor(duration / 2)));
    const newEnd = newStart + duration;
    
    onChange(newStart, newEnd);
  };

  return (
    <div className="space-y-4">
      {/* Time Display */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{getTimeString(startTime)}</span> - <span className="font-medium text-gray-900">{getTimeString(endTime)}</span>
        </div>
        <div className="text-sm text-[#00B9F5] font-medium">
          {endTime - startTime} {endTime - startTime === 1 ? 'hour' : 'hours'}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Background Timeline */}
        <div
          ref={timelineRef}
          className="h-12 bg-gray-100 rounded-lg relative cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Hour Markers */}
          {Array.from({ length: totalHours + 1 }, (_, i) => {
            const hour = minHour + i;
            const percentage = getPercentage(hour);
            return (
              <div
                key={hour}
                className="absolute top-0 bottom-0 w-px bg-gray-300"
                style={{ left: `${percentage}%` }}
              />
            );
          })}

          {/* Selected Range */}
          <div
            className="absolute top-1 bottom-1 bg-[#00B9F5] rounded-md cursor-grab active:cursor-grabbing transition-all duration-150"
            style={{
              left: `${getPercentage(startTime)}%`,
              width: `${getPercentage(endTime) - getPercentage(startTime)}%`
            }}
            onMouseDown={(e) => handleMouseDown(e, 'range')}
          >
            {/* Start Handle */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1 bg-white rounded-l-md cursor-ew-resize shadow-sm"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'start');
              }}
            />
            
            {/* End Handle */}
            <div
              className="absolute top-0 bottom-0 right-0 w-1 bg-white rounded-r-md cursor-ew-resize shadow-sm"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'end');
              }}
            />
          </div>
        </div>

        {/* Hour Labels */}
        <div className="flex justify-between mt-2 px-1">
          {Array.from({ length: Math.ceil(totalHours / 2) + 1 }, (_, i) => {
            const hour = minHour + (i * 2);
            if (hour > maxHour) return null;
            return (
              <span key={hour} className="text-xs text-gray-500">
                {getTimeString(hour)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center">
        Click and drag to select your preferred time slot
      </p>
    </div>
  );
};

export default TimelineSelector;
