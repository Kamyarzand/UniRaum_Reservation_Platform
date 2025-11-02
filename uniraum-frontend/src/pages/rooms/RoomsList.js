import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RoomService from '../../services/room.service';
import './RoomsList.css'; // اطمینان از import شدن فایل CSS

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [availableRoomIds, setAvailableRoomIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // References for input fields
  const dateInputRef = useRef(null);
  const startTimeInputRef = useRef(null);
  const endTimeInputRef = useRef(null);
  
  // Room filters
  const [filters, setFilters] = useState({
    building: '',
    type: '',
    capacity: '',
    hasComputers: false,
    hasProjector: false
  });

  // Time filters
  const [timeFilter, setTimeFilter] = useState({
    useTimeFilter: false,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    endDate: new Date().toISOString().split('T')[0] // New: added end date
  });
  
  // Next day confirmation
  const [showNextDayConfirm, setShowNextDayConfirm] = useState(false);
  
  // Fetch rooms on component mount
  useEffect(() => {
    loadAllRooms();
  }, []);
  
  // Set end date to date when date changes
  useEffect(() => {
    setTimeFilter({
      ...timeFilter,
      endDate: timeFilter.date
    });
  }, [timeFilter.date]);
  
  // Check availability whenever time filter changes
  useEffect(() => {
    if (timeFilter.useTimeFilter && rooms.length > 0 && 
        timeFilter.date && timeFilter.startTime && timeFilter.endTime) {
      // Only check availability if we're not waiting for next day confirmation
      if (!showNextDayConfirm) {
        validateAndCheckAvailability();
      }
    }
  }, [timeFilter.date, timeFilter.startTime, timeFilter.endTime, timeFilter.useTimeFilter, timeFilter.endDate]);
  
  const loadAllRooms = async () => {
    try {
      setLoading(true);
      const response = await RoomService.getAllRooms();
      setRooms(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load rooms. Please try again later.');
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate time inputs and check availability if valid
  const validateAndCheckAvailability = () => {
    // Reset error
    setError('');
    
    // Check if end time is before start time on the same day
    if (timeFilter.endDate === timeFilter.date && timeFilter.endTime < timeFilter.startTime) {
      setShowNextDayConfirm(true);
      setError('End time is earlier than start time. Does your booking end on the next day?');
      return;
    }
    
    // If we get here, times are valid, so check availability
    checkAvailability();
  };

  const checkAvailability = async () => {
    try {
      setSearchLoading(true);

      const startDateTime = `${timeFilter.date}T${timeFilter.startTime}:00`;
      const endDateTime = `${timeFilter.endDate}T${timeFilter.endTime}:00`;

      // Prepare filter parameters
      const filterParams = {
        capacity: filters.capacity || undefined,
        type: filters.type || undefined,
        building: filters.building || undefined,
        hasComputers: filters.hasComputers || undefined,
        hasProjector: filters.hasProjector || undefined
      };

      const response = await RoomService.getAvailableRooms(
        startDateTime,
        endDateTime,
        filterParams
      );

      // Extract IDs of available rooms
      const availableIds = response.data.map(room => room.id);
      setAvailableRoomIds(availableIds);
      setError('');
    } catch (error) {
      console.error('Error checking room availability:', error);
      setError('Failed to check room availability. Please try again later.');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle next day confirmation
  const handleNextDayConfirm = () => {
    // Calculate next day's date
    const nextDay = new Date(timeFilter.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    
    // Update end date to next day
    setTimeFilter({
      ...timeFilter,
      endDate: nextDayStr
    });
    
    setShowNextDayConfirm(false);
    setError('');
    
    // Now check availability with the corrected dates
    checkAvailability();
  };
  
  // Handle cancel next day confirmation
  const handleCancelNextDay = () => {
    setShowNextDayConfirm(false);
    setError('End time must be after start time');
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkbox inputs, use the checked property
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFilters({
      ...filters,
      [name]: inputValue
    });
  };

  // Handle time filter change
  const handleTimeFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkbox inputs, use the checked property
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Reset next day confirmation when changing times
    if (name === 'startTime' || name === 'endTime' || name === 'date') {
      setShowNextDayConfirm(false);
    }
    
    setTimeFilter({
      ...timeFilter,
      [name]: inputValue
    });
  };

  // Click handlers for opening date/time pickers
  const handleDateFieldClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleStartTimeFieldClick = () => {
    if (startTimeInputRef.current) {
      startTimeInputRef.current.showPicker();
    }
  };

  const handleEndTimeFieldClick = () => {
    if (endTimeInputRef.current) {
      endTimeInputRef.current.showPicker();
    }
  };

  // Apply filters to rooms based on room properties
  const filteredRooms = rooms.filter(room => {
    return (
      (!filters.building || room.building.includes(filters.building)) &&
      (!filters.type || room.type === filters.type) &&
      (!filters.capacity || room.capacity >= parseInt(filters.capacity)) &&
      (!filters.hasComputers || room.hasComputers) &&
      (!filters.hasProjector || room.hasProjector)
    );
  });
  
  // Get unique building names
  const buildings = [...new Set(rooms.map(room => room.building))];
  
  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Check if a room is available at the selected time
  const isRoomAvailable = (roomId) => {
    if (!timeFilter.useTimeFilter) return true;
    return availableRoomIds.includes(roomId);
  };

  // Generate URL with time parameters
  const getRoomDetailsUrl = (roomId) => {
    if (timeFilter.useTimeFilter) {
      return `/rooms/${roomId}?date=${timeFilter.date}&start=${timeFilter.startTime}&end=${timeFilter.endTime}`;
    }
    return `/rooms/${roomId}`;
  };
  
  // Handle the search button submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Reset any previous errors and next day confirmation
    setError('');
    setShowNextDayConfirm(false);
    
    if (timeFilter.useTimeFilter) {
      validateAndCheckAvailability();
    }
  };
  
  return (
    <div className="container">
      <h2 className="mb-4">Available Rooms</h2>
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            {/* Time filter toggle */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="useTimeFilter"
                name="useTimeFilter"
                checked={timeFilter.useTimeFilter}
                onChange={handleTimeFilterChange}
              />
              <label className="form-check-label" htmlFor="useTimeFilter">
                Check room availability for a specific time
              </label>
            </div>

            {/* Time filter section */}
            {timeFilter.useTimeFilter && (
              <div className="row mb-3 border-bottom pb-3">
                <div className="col-md-4 mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={timeFilter.date}
                    onChange={handleTimeFilterChange}
                    min={today}
                    style={{ 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={handleDateFieldClick}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="startTime" className="form-label">Start Time</label>
                  <input
                    ref={startTimeInputRef}
                    type="time"
                    className="form-control"
                    id="startTime"
                    name="startTime"
                    value={timeFilter.startTime}
                    onChange={handleTimeFilterChange}
                    style={{ 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={handleStartTimeFieldClick}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="endTime" className="form-label">End Time</label>
                  <input
                    ref={endTimeInputRef}
                    type="time"
                    className="form-control"
                    id="endTime"
                    name="endTime"
                    value={timeFilter.endTime}
                    onChange={handleTimeFilterChange}
                    style={{ 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={handleEndTimeFieldClick}
                  />
                </div>
                
                {/* Display booking date range if end date is different */}
                {timeFilter.endDate !== timeFilter.date && !showNextDayConfirm && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-info mb-0">
                      Your search will be for bookings that start on {timeFilter.date} and end on {timeFilter.endDate}.
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <h5 className="card-title">Filter Rooms</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="building" className="form-label">Building</label>
                <select 
                  name="building"
                  id="building"
                  className="form-select"
                  value={filters.building}
                  onChange={handleFilterChange}
                >
                  <option value="">All Buildings</option>
                  {buildings.map((building, index) => (
                    <option key={index} value={building}>{building}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-4 mb-3">
                <label htmlFor="type" className="form-label">Room Type</label>
                <select 
                  name="type"
                  id="type"
                  className="form-select"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="lecture">Lecture Room</option>
                  <option value="lab">Laboratory</option>
                  <option value="meeting">Meeting Room</option>
                </select>
              </div>
              
              <div className="col-md-4 mb-3">
                <label htmlFor="capacity" className="form-label">Min. Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  id="capacity"
                  className="form-control"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hasComputers"
                    name="hasComputers"
                    checked={filters.hasComputers}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="hasComputers">
                    Has Computers
                  </label>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hasProjector"
                    name="hasProjector"
                    checked={filters.hasProjector}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="hasProjector">
                    Has Projector
                  </label>
                </div>
              </div>
            </div>
            
            {timeFilter.useTimeFilter && (
              <div className="d-grid mt-3">
                <button type="submit" className="btn btn-primary">
                  {searchLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Search Available Rooms
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Next day confirmation */}
      {showNextDayConfirm && (
        <div className="alert alert-warning mb-4">
          <p>End time is earlier than start time. Does your booking end on the next day?</p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={handleNextDayConfirm}
            >
              Yes, ends next day
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={handleCancelNextDay}
            >
              No, I'll fix the time
            </button>
          </div>
        </div>
      )}
      
      {/* Error message if present (and not showing next day confirmation) */}
      {error && !showNextDayConfirm && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}
      
      {/* Availability Check Status */}
      {timeFilter.useTimeFilter && searchLoading && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Checking room availability...</span>
          </div>
        </div>
      )}
      
      {/* Room List */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredRooms.length > 0 ? (
            filteredRooms.map(room => {
              const available = isRoomAvailable(room.id);
              return (
                <div className="col-md-4 mb-4" key={room.id}>
                  <div className={`card h-100 room-card ${available || !timeFilter.useTimeFilter ? '' : 'border-danger'}`}>
                    <div className="card-body">
                      <h5 className="card-title">{room.name}</h5>
                      {/* تغییر اینجا: اضافه کردن کلاس building-address برای آدرس کلاس‌ها */}
                      <h6 className="card-subtitle mb-2 building-address">
                        {room.building}, Floor {room.floor}
                      </h6>
                      <p className="card-text">
                        <strong>Type:</strong> {room.type}<br />
                        <strong>Capacity:</strong> {room.capacity} people<br />
                        <strong>Features:</strong> {room.hasComputers ? 'Computers, ' : ''}
                        {room.hasProjector ? 'Projector' : 'No projector'}
                      </p>
                      {timeFilter.useTimeFilter && (
                        <div className={`alert ${available ? 'alert-success' : 'alert-danger'}`}>
                          <small>
                            {available 
                              ? 'Available at selected time' 
                              : 'Not available at selected time (already booked)'}
                          </small>
                        </div>
                      )}
                    </div>
                    <div className="card-footer bg-transparent border-top-0">
                      {available || !timeFilter.useTimeFilter ? (
                        <Link 
                          to={getRoomDetailsUrl(room.id)} 
                          className="btn btn-primary w-100 btn-view-details" // اضافه کردن کلاس btn-view-details
                        >
                          View Details
                        </Link>
                      ) : (
                        <button 
                          className="btn btn-secondary w-100" 
                          disabled
                        >
                          Room Not Available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <div className="alert alert-info" role="alert">
                No rooms match your filter criteria. Try changing the filters.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomsList;