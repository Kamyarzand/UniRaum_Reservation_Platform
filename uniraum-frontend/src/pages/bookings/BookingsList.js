import React, { useState, useEffect } from 'react';
import BookingService from '../../services/booking.service';

const BookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // بارگذاری رزروها
  useEffect(() => {
    loadBookings();
  }, []);
  
  // تابع بارگذاری رزروها
  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getUserBookings();
      console.log('Bookings response:', response.data);
      setBookings(response.data);
      setError('');
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // تابع کنسل کردن رزرو
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      await BookingService.cancelBooking(bookingId);
      // به‌روزرسانی لیست رزروها در حالت محلی
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };
  
  // تبدیل تاریخ به فرمت نمایشی
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // گروه‌بندی رزروها
  const now = new Date();
  
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.startTime) > now && booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.startTime) <= now && booking.status !== 'cancelled'
  );
  
  const cancelledBookings = bookings.filter(booking => 
    booking.status === 'cancelled'
  );
  
  // نمایش کارت رزرو
  const renderBookingCard = (booking) => (
    <div className="card mb-3" key={booking.id}>
      <div className="card-body">
        <h5 className="card-title">
          {booking.roomName || 'Room'} {booking.building && `(${booking.building}${booking.floor ? `, Floor ${booking.floor}` : ''})`}
        </h5>
        <p className="card-text">
          <strong>Start Time:</strong> {formatDate(booking.startTime)}
          <br />
          <strong>End Time:</strong> {formatDate(booking.endTime)}
          <br />
          <strong>Purpose:</strong> {booking.purpose || "Not specified"}
        </p>
        {booking.status !== 'cancelled' && new Date(booking.startTime) > now && (
          <button 
            className="btn btn-danger"
            onClick={() => handleCancelBooking(booking.id)}
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h2 className="mb-4">My Bookings</h2>
      
      {error ? (
        <div className="alert alert-danger">
          {error}
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => loadBookings()}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info">
          You don't have any bookings yet. 
          <a href="/rooms" className="alert-link ms-2">
            Find a room to book
          </a>
        </div>
      ) : (
        <div>
          {/* Upcoming Bookings */}
          <div className="mb-4">
            <h3>Upcoming Bookings</h3>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(renderBookingCard)
            ) : (
              <p className="text-muted">You don't have any upcoming bookings.</p>
            )}
          </div>
          
          {/* Past Bookings */}
          <div className="mb-4">
            <h3>Past Bookings</h3>
            {pastBookings.length > 0 ? (
              pastBookings.map(renderBookingCard)
            ) : (
              <p className="text-muted">You don't have any past bookings.</p>
            )}
          </div>
          
          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div className="mb-4">
              <h3>Cancelled Bookings</h3>
              {cancelledBookings.map(renderBookingCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsList;