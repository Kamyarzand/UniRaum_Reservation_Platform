import React, { useState, useRef, useEffect } from 'react';
import './TimePicker.css';

const TimePicker = ({ value, onChange, placeholder = "Select time", disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const dropdownRef = useRef(null);

  // Generate hours (24-hour format)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Generate minutes (every 15 minutes)
  const minutes = ['00', '15', '30', '45'];

  // Parse current value when component mounts or value changes
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    } else {
      setSelectedHour('');
      setSelectedMinute('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    if (selectedMinute) {
      const newTime = `${hour}:${selectedMinute}`;
      onChange(newTime);
    }
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    if (selectedHour) {
      const newTime = `${selectedHour}:${minute}`;
      onChange(newTime);
      setIsOpen(false);
    }
  };

  const displayValue = selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : '';

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`time-picker ${className}`} ref={dropdownRef}>
      <div 
        className={`time-picker-input ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
      >
        <span className={`time-display ${!displayValue ? 'placeholder' : ''}`}>
          {displayValue || placeholder}
        </span>
        <div className="time-picker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="time-picker-dropdown">
          <div className="time-picker-section">
            <div className="time-picker-header">Hour</div>
            <div className="time-picker-options">
              {hours.map(hour => (
                <div
                  key={hour}
                  className={`time-picker-option ${selectedHour === hour ? 'selected' : ''}`}
                  onClick={() => handleHourSelect(hour)}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
          
          <div className="time-picker-section">
            <div className="time-picker-header">Minute</div>
            <div className="time-picker-options">
              {minutes.map(minute => (
                <div
                  key={minute}
                  className={`time-picker-option ${selectedMinute === minute ? 'selected' : ''}`}
                  onClick={() => handleMinuteSelect(minute)}
                >
                  {minute}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;