import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../utils/auth-context';
import RoomService from '../../services/room.service';
import BookingService from '../../services/booking.service';
import TimePicker from '../../components/common/TimePicker';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useContext(AuthContext);
  
  // References for input fields
  const dateInputRef = useRef(null);
  const scheduleDateRef = useRef(null);
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking state
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [endDate, setEndDate] = useState(''); // New state for end date
  const [purpose, setPurpose] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showNextDayConfirm, setShowNextDayConfirm] = useState(false); // New state for confirmation dialog
  
  // Responsibility popup state
  const [showResponsibilityPopup, setShowResponsibilityPopup] = useState(false);
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);
  
  // Room availability schedule
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Load room details and check for query parameters
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await RoomService.getRoomById(id);
        setRoom(response.data);
        setError('');
        
        // Check for query parameters
        const searchParams = new URLSearchParams(location.search);
        const date = searchParams.get('date');
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        
        if (date) {
          setBookingDate(date);
          setEndDate(date); // Initialize end date to be the same as booking date
          setScheduleDate(date);
        }
        if (start) setStartTime(start);
        if (end) setEndTime(end);
        
        // Check if we need to show next day confirmation immediately
        // This is for when we come from the room list with invalid times
        if (date && start && end && start > end) {
          setShowNextDayConfirm(true);
          setBookingError('End time is earlier than start time. Did you mean the next day?');
        }
        
      } catch (error) {
        setError('Failed to load room details. Please try again later.');
        console.error('Error loading room details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetails();
  }, [id, location.search]);
  
  // Load room schedule when scheduleDate changes or when showSchedule becomes true
  useEffect(() => {
    if (showSchedule && id && scheduleDate) {
      fetchRoomSchedule();
    }
  }, [showSchedule, scheduleDate, id]);
  
  // Set end date to booking date when booking date changes
  useEffect(() => {
    if (bookingDate) {
      setEndDate(bookingDate);
      
      // If we have times set already, validate them
      if (startTime && endTime) {
        validateTimes(startTime, endTime);
      }
    }
  }, [bookingDate]);
  
  // Fetch room schedule for selected date
  const fetchRoomSchedule = async () => {
    try {
      setLoadingSchedule(true);
      
      // Create date range for the entire day
      const startOfDay = `${scheduleDate}T00:00:00`;
      const endOfDay = `${scheduleDate}T23:59:59`;
      
      const response = await RoomService.getRoomBookings(id, startOfDay, endOfDay);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching room schedule:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };
  
  // Format date for backend
  const formatDateTime = (date, time) => {
    return `${date}T${time}:00`;
  };
  
  // Handle start time change with validation
  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    
    // If end time is set, validate
    if (endTime) {
      validateTimes(newStartTime, endTime);
    }
  };
  
  // Handle end time change with validation
  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
    
    // If start time is set, validate
    if (startTime) {
      validateTimes(startTime, newEndTime);
    }
  };
  
  // Validate that start time is before end time
  const validateTimes = (start, end) => {
    // Clear any previous errors and confirmations
    setBookingError('');
    setShowNextDayConfirm(false);
    
    // Check if on same day and end time is earlier than start time
    if (endDate === bookingDate && end <= start) {
      setShowNextDayConfirm(true);
      setBookingError('End time is earlier than start time. Did you mean the next day?');
    }
  };
  
  // Handle next day confirmation
  const handleNextDayConfirm = () => {
    // Calculate next day's date
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    
    // Update end date to next day
    setEndDate(nextDayStr);
    setShowNextDayConfirm(false);
    setBookingError('');
  };
  
  // Click handlers for opening date pickers
  const handleDateFieldClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleScheduleDateFieldClick = () => {
    if (scheduleDateRef.current) {
      scheduleDateRef.current.showPicker();
    }
  };
  
  // Handle form submission (shows responsibility popup)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Reset errors and success message
    setBookingError('');
    setBookingSuccess(false);
    
    // Validate times
    if (!startTime || !endTime) {
      setBookingError('Start time and end time are required');
      return;
    }
    
    // If end time is before start time on the same day and not confirmed
    if (endDate === bookingDate && endTime <= startTime && !showNextDayConfirm) {
      setShowNextDayConfirm(true);
      setBookingError('End time is earlier than start time. Did you mean the next day?');
      return;
    }
    
    // Show responsibility popup before proceeding
    setShowResponsibilityPopup(true);
  };
  
  // Handle actual booking creation after responsibility acceptance
  const handleConfirmBooking = async () => {
    try {
      const formattedStartTime = formatDateTime(bookingDate, startTime);
      const formattedEndTime = formatDateTime(endDate, endTime);
      
      // Check if the room is available at the selected time
      const response = await RoomService.getRoomBookings(
        id, 
        formattedStartTime, 
        formattedEndTime
      );
      
      // If there are any bookings for this time period, the room is not available
      if (response.data && response.data.length > 0) {
        setBookingError('This room is already booked for the selected time period. Please choose a different time or room.');
        setShowResponsibilityPopup(false);
        return;
      }
      
      await BookingService.createBooking({
        roomId: id,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        purpose: purpose,
        responsibilityAccepted: true
      });
      
      setBookingSuccess(true);
      setShowResponsibilityPopup(false);
      
      // Refresh schedule if it's being displayed
      if (showSchedule && scheduleDate === bookingDate) {
        fetchRoomSchedule();
      }
      
      // Reset form
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setEndDate('');
      setPurpose('');
      setResponsibilityAccepted(false);
      
      // Navigate to bookings page after successful booking
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'Failed to create booking. Please try again.';
        
      setBookingError(errorMessage);
      setShowResponsibilityPopup(false);
    }
  };
  
  // Handle responsibility popup close
  const handleCloseResponsibilityPopup = () => {
    setShowResponsibilityPopup(false);
    setResponsibilityAccepted(false);
  };
  
  // Check if a time slot is available based on existing bookings
  const isTimeSlotAvailable = (selectedDate, start, end) => {
    if (!bookings.length) return true;
    
    const selectedStart = new Date(`${selectedDate}T${start}`);
    const selectedEnd = new Date(`${selectedDate}T${end}`);
    
    return !bookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Check if there's an overlap
      return (
        (selectedStart >= bookingStart && selectedStart < bookingEnd) ||
        (selectedEnd > bookingStart && selectedEnd <= bookingEnd) ||
        (selectedStart <= bookingStart && selectedEnd >= bookingEnd)
      );
    });
  };
  
  // Format time from ISO string to display format
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  
  // Generate time slots for schedule display
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  // Get time slots
  const timeSlots = generateTimeSlots();
  
  // Check if a time slot is booked
  const isTimeSlotBooked = (timeSlot) => {
    const slotStart = new Date(`${scheduleDate}T${timeSlot}`);
    
    return bookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Check if the time slot falls within a booking
      return slotStart >= bookingStart && slotStart < bookingEnd;
    });
  };
  
  // Get booking details for a time slot
  const getBookingForTimeSlot = (timeSlot) => {
    const slotStart = new Date(`${scheduleDate}T${timeSlot}`);
    
    return bookings.find(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return slotStart >= bookingStart && slotStart < bookingEnd;
    });
  };
  
  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning" role="alert">
          Room not found
        </div>
      </div>
    );
  }
  
  return (
    <div className="container my-4 room-detail-container">
      <div className="row">
        <div className="col-md-8">
          <h2 className="room-title">{room.name}</h2>
          <h5 className="room-location">{room.building}, Floor {room.floor}</h5>
          
          {/* Room Details Card - با استایل‌های جدید */}
          <div className="detail-card mb-4">
            <div className="detail-card-header">
              <h3>Room Details</h3>
            </div>
            <div className="detail-card-body">
              <div className="room-info-item">
                <div className="room-info-label">Type:</div>
                <div className="room-info-value">{room.type}</div>
              </div>
              <div className="room-info-item">
                <div className="room-info-label">Capacity:</div>
                <div className="room-info-value">{room.capacity} people</div>
              </div>
              <div className="room-info-item">
                <div className="room-info-label">Has Computers:</div>
                <div className="room-info-value">{room.hasComputers ? 'Yes' : 'No'}</div>
              </div>
              <div className="room-info-item">
                <div className="room-info-label">Has Projector:</div>
                <div className="room-info-value">{room.hasProjector ? 'Yes' : 'No'}</div>
              </div>
              {room.description && (
                <div className="room-info-item">
                  <div className="room-info-label">Description:</div>
                  <div className="room-info-value">{room.description}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Room Schedule Section - با استایل‌های جدید */}
          <div className="detail-card mb-4">
            <div className="detail-card-header d-flex justify-content-between align-items-center">
              <h3>Room Schedule</h3>
              <button 
                className="schedule-button" 
                onClick={() => setShowSchedule(!showSchedule)}
              >
                {showSchedule ? 'Hide Schedule' : 'Show Schedule'}
              </button>
            </div>
            
            {showSchedule && (
              <div className="detail-card-body">
                <div className="mb-3">
                  <label htmlFor="scheduleDate" className="form-label">Date</label>
                  <div className="d-flex">
                    <input
                      ref={scheduleDateRef}
                      type="date"
                      className="form-control"
                      id="scheduleDate"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      onClick={handleScheduleDateFieldClick}
                      min={today}
                      style={{ cursor: 'pointer' }}
                    />
                    <button 
                      className="schedule-button ms-2"
                      onClick={fetchRoomSchedule}
                      disabled={loadingSchedule}
                    >
                      {loadingSchedule ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Refresh'
                      )}
                    </button>
                  </div>
                </div>
                
                {loadingSchedule ? (
                  <div className="text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading schedule...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map(slot => {
                          const isBooked = isTimeSlotBooked(slot);
                          const booking = isBooked ? getBookingForTimeSlot(slot) : null;
                          
                          return (
                            <tr key={slot}>
                              <td>{slot}</td>
                              <td>
                                {isBooked ? (
                                  <>
                                    <span className="booking-status status-booked">Booked</span>
                                    <small className="ms-2">
                                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </small>
                                  </>
                                ) : (
                                  <span className="booking-status status-available">Available</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-md-4">
          {/* Booking Form Card - با استایل‌های جدید */}
          <div className="booking-form">
            <div className="booking-form-header">
              <h3>Book This Room</h3>
            </div>
            <div className="booking-form-body">
              {!isLoggedIn ? (
                <div className="alert alert-info">
                  Please <a href="/login">log in</a> to book this room.
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit}>
                  <div className="form-group">
                    <label htmlFor="bookingDate" className="form-label">Date</label>
                    <input
                      ref={dateInputRef}
                      type="date"
                      className="form-control"
                      id="bookingDate"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      onClick={handleDateFieldClick}
                      min={today}
                      style={{ cursor: 'pointer' }}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="startTime" className="form-label">Start Time</label>
                    <TimePicker
                      value={startTime}
                      onChange={handleStartTimeChange}
                      placeholder="Select start time"
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endTime" className="form-label">End Time</label>
                    <TimePicker
                      value={endTime}
                      onChange={handleEndTimeChange}
                      placeholder="Select end time"
                      className="form-control"
                    />
                  </div>
                  
                  {/* Next day confirmation dialog */}
                  {showNextDayConfirm && (
                    <div className="alert alert-warning mb-3">
                      <p>End time is earlier than start time. Does your booking end on the next day?</p>
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={handleNextDayConfirm}
                        >
                          Yes, ends next day
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setEndTime('');
                            setShowNextDayConfirm(false);
                            setBookingError('');
                          }}
                        >
                          No, I'll fix the time
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Display booking date range if end date is different */}
                  {endDate !== bookingDate && !showNextDayConfirm && (
                    <div className="alert alert-info mb-3">
                      Your booking will start on {bookingDate} and end on {endDate}.
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="purpose" className="form-label">Purpose</label>
                    <textarea
                      className="form-control"
                      id="purpose"
                      rows="3"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  {bookingError && !showNextDayConfirm && (
                    <div className="alert alert-danger mb-3">
                      <strong>Booking Error:</strong> {bookingError}
                      {bookingError.includes('already have a booking during this time period') && (
                        <div className="mt-2">
                          <small>
                            <i className="bi bi-info-circle"></i> You can only book one room at a time. Please select a different time or check your existing bookings.
                          </small>
                          <div className="mt-2">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate('/bookings')}
                            >
                              View My Bookings
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {bookingSuccess && (
                    <div className="alert alert-success mb-3">
                      Booking created successfully! Redirecting to your bookings...
                    </div>
                  )}
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="booking-button"
                      disabled={bookingSuccess || (bookingError && !showNextDayConfirm)}
                    >
                      Book Now
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Responsibility Confirmation Popup */}
      {showResponsibilityPopup && (
        <div className="responsibility-popup-overlay">
          <div className="responsibility-popup">
            <div className="responsibility-popup-header">
              <h4>Room Responsibility Agreement</h4>
            </div>
            <div className="responsibility-popup-body">
              <div className="responsibility-warning">
                <div className="responsibility-icon">⚠️</div>
                <div className="responsibility-text">
                  <p><strong>Important Notice:</strong></p>
                  <p>By booking this room, you accept full responsibility for its condition during your reservation period. You will be held accountable for any damage or issues that occur.</p>
                  <ul>
                    <li>You are responsible for the room's cleanliness and proper use</li>
                    <li>Any damage during your booking time will be traced back to you</li>
                    <li>Please report any existing issues before using the room</li>
                    <li>Leave the room in the same condition as you found it</li>
                  </ul>
                </div>
              </div>
              
              <div className="responsibility-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={responsibilityAccepted}
                    onChange={(e) => setResponsibilityAccepted(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  I understand and accept full responsibility for the room condition during my reservation.
                </label>
              </div>
            </div>
            
            <div className="responsibility-popup-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseResponsibilityPopup}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={handleConfirmBooking}
                disabled={!responsibilityAccepted}
              >
                Accept & Book Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;