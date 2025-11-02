import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../utils/auth-context';
import { ThemeContext } from '../utils/theme-context';
import BookingService from '../services/booking.service';
import RoomService from '../services/room.service';
import './Home.css';

const Home = () => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    bookingsCount: 0,
    availableRoomsCount: 0
  });
  
  useEffect(() => {
    // If user is logged in, load upcoming bookings
    if (isLoggedIn) {
      fetchUserBookings();
      fetchPopularRooms();
      fetchStats();
    }
  }, [isLoggedIn]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getUserBookings();
      // Filter upcoming bookings
      const now = new Date();
      const upcoming = response.data
        .filter(booking => new Date(booking.startTime) > now && booking.status !== 'cancelled')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 3); // Only 3 upcoming bookings
      
      setUpcomingBookings(upcoming);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularRooms = async () => {
    try {
      const response = await RoomService.getAllRooms();
      // In a real system, this data would be sorted by popularity
      // Here we just select 3 rooms randomly
      const rooms = response.data
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      setPopularRooms(rooms);
    } catch (error) {
      console.error("Error fetching rooms", error);
    }
  };
  
  const fetchStats = async () => {
    try {
      const bookingsResponse = await BookingService.getUserBookings();
      const roomsResponse = await RoomService.getAllRooms();
      
      setStats({
        bookingsCount: bookingsResponse.data.filter(b => b.status !== 'cancelled').length,
        availableRoomsCount: roomsResponse.data.length
      });
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Guest view component
  const GuestView = () => (
    <div className="guest-view">
      {/* Hero Section with Gradient Background */}
      <section className="hero-section">
        <div className="container-fluid px-0">
          <div className="container">
            <div className="row align-items-center" style={{ minHeight: '500px', paddingTop: '3rem', paddingBottom: '3rem' }}>
              <div className="col-lg-6 hero-content slide-up" style={{ paddingLeft: '2rem' }}>
                <h1 className="display-4 fw-bold mb-4" style={{ marginTop: '2rem' }}>Find Your Perfect Study Space</h1>
                <p className="lead mb-4 fs-5 lh-lg" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: '400', paddingRight: '1rem' }}>
                  Book university rooms with just a few clicks. No more running around campus looking for available spaces.
                </p>
                <div className="action-buttons mt-4">
                  <Link to="/login" className="action-button primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    Get Started
                  </Link>
                  <Link to="/rooms" className="action-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 9.5A1.5 1.5 0 0 1 2.5 8h3A1.5 1.5 0 0 1 7 9.5v3A1.5 1.5 0 0 1 5.5 14h-3A1.5 1.5 0 0 1 1 12.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 8h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                    </svg>
                    Browse Rooms
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 position-relative">
                <div className="welcome-image-container slide-in-right">
                  <img src={`${process.env.PUBLIC_URL}/images/classroom.jpg`} alt="Classroom" />
                </div>
                <div className="floating-card modern-card p-4 scale-in shadow-lg">
                  <div className="d-flex align-items-center">
                    <div className="floating-icon me-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="mb-1 text-white">Student-Friendly</h5>
                      <p className="mb-0 small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Designed for students by students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container py-5">
          <h2 className="text-center mb-5 slide-up">Why Use UniRaum?</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card slide-up" style={{animationDelay: '0.1s'}}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
                <h3>Easy Search</h3>
                <p>Find rooms based on capacity, equipment, and location in seconds.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card slide-up" style={{animationDelay: '0.2s'}}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                </div>
                <h3>Quick Booking</h3>
                <p>Reserve rooms instantly with our streamlined booking process.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card slide-up" style={{animationDelay: '0.3s'}}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                </div>
                <h3>Real-time Availability</h3>
                <p>See which rooms are available right now or for future time slots.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card slide-up" style={{animationDelay: '0.4s'}}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm-8 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
                  </svg>
                </div>
                <h3>Mobile Friendly</h3>
                <p>Book rooms on the go from any device with our responsive design.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container py-5">
          <h2 className="text-center mb-5 slide-up">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="step-card slide-up" style={{animationDelay: '0.1s'}}>
                <div className="step-number">1</div>
                <h3>Create Account</h3>
                <p>Sign up with your university email to get started. It only takes a minute.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="step-card slide-up" style={{animationDelay: '0.2s'}}>
                <div className="step-number">2</div>
                <h3>Find a Room</h3>
                <p>Search for available rooms based on your specific needs and time slot.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="step-card slide-up" style={{animationDelay: '0.3s'}}>
                <div className="step-number">3</div>
                <h3>Book & Confirm</h3>
                <p>Book your chosen room and receive instant confirmation. That's it!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Background */}
      <section className="cta-section">
        <div className="container py-5 text-center">
          <h2 className="mb-4 slide-up">Ready to optimize your study time?</h2>
          <p className="lead mb-4 slide-up" style={{animationDelay: '0.1s'}}>Join UniRaum today and make room reservations easier than ever.</p>
          <div className="slide-up" style={{animationDelay: '0.2s'}}>
            <Link to="/register" className="sign-up-button mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  // User view component (for logged in users)
  const UserView = () => (
    <div className="user-view">
      {/* Welcome Banner with Gradient */}
      <div className="welcome-banner mb-4">
        <div className="container">
          <div className="row align-items-center" style={{ minHeight: '400px', paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="col-md-8" style={{ paddingLeft: '2rem' }}>
              <div className="slide-up">
                <h1 className="display-5 fw-bold mb-3" style={{ marginTop: '1.5rem' }}>Welcome, {user?.username}!</h1>
                <p className="lead mb-4 welcome-description" style={{ paddingRight: '1rem' }}>What would you like to do today?</p>
                <div className="d-flex flex-wrap gap-3 mt-4">
                  <Link to="/rooms" className="btn btn-primary find-a-room-btn btn-lg px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                    Find a Room
                  </Link>
                  <Link to="/bookings" className="btn btn-outline-light btn-lg px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    My Bookings
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 d-none d-md-block">
              <div className="welcome-image-container slide-in-right">
                <img src={`${process.env.PUBLIC_URL}/images/classroom.jpg`} alt="Classroom" />
              </div>
            </div>
          </div>
        </div>
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fillOpacity="1" d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,208C560,213,640,203,720,170.7C800,139,880,85,960,69.3C1040,53,1120,75,1200,101.3C1280,128,1360,160,1400,176L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Quick Stats Section */}
      <section className="container mb-4">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="stat-card modern-card slide-up">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
              </div>
              <div className="stat-value">{stats.bookingsCount}</div>
              <div className="stat-label">Your Bookings</div>
              <Link to="/bookings" className="stat-link">View All</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card modern-card slide-up" style={{animationDelay: '0.1s'}}>
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </div>
              <div className="stat-value">Now</div>
              <div className="stat-label">Quick Book</div>
              <Link to="/rooms" className="stat-link">Find Available</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card modern-card slide-up" style={{animationDelay: '0.2s'}}>
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V1Zm1 13.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm7-12.5H9v12h7V2Z"/>
                  <path d="M1 2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3Z"/>
                </svg>
              </div>
              <div className="stat-value">{stats.availableRoomsCount}</div>
              <div className="stat-label">Available Rooms</div>
              <Link to="/rooms" className="stat-link">View All</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container">
        <div className="row g-4">
          {/* Upcoming Bookings Card */}
          <div className="col-md-6">
            <div className="dashboard-card mb-4 slide-up">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">Upcoming Bookings</h2>
                <Link to="/bookings" className="view-all">View All</Link>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="bookings-list">
                    {upcomingBookings.map(booking => (
                      <div className="booking-item" key={booking.id}>
                        <div className="booking-room">{booking.roomName}</div>
                        <div className="booking-time">
                          <span className="time-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                          </span>
                          {formatDateTime(booking.startTime)}
                        </div>
                        <div className="booking-actions">
                          <button 
                            className="btn-cancel"
                            onClick={() => {/* Handle cancellation */}}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-bookings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="mb-3" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>               
                    <p>You don't have any upcoming bookings.</p>
                   <Link to="/rooms" className="btn btn-primary">Book a Room</Link>
                 </div>
               )}
             </div>
           </div>
         </div>

         {/* Popular Rooms Card */}
         <div className="col-md-6">
           <div className="dashboard-card mb-4 slide-up" style={{animationDelay: '0.1s'}}>
             <div className="card-header d-flex justify-content-between align-items-center">
               <h2 className="h5 mb-0">Popular Rooms</h2>
               <Link to="/rooms" className="view-all">View All</Link>
             </div>
             <div className="card-body">
               <div className="rooms-grid">
                 {popularRooms.map(room => (
                   <div className="room-card modern-card" key={room.id}>
                     <div className="room-type-badge">{room.type}</div>
                     <h3 className="room-name">{room.name}</h3>
                     <div className="room-details">
                       <div className="room-location d-flex align-items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                           <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                         </svg>
                         {room.building}, Floor {room.floor}
                       </div>                  
                       <div className="room-capacity d-flex align-items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                           <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                           <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                           <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                         </svg>
                         {room.capacity} people
                       </div>
                     </div>
                     <Link to={`/rooms/${room.id}`} className="btn btn-room">
                       View Details
                     </Link>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
       </div>
     </section>
   </div>
 );

 return (
   <div className="home-container">
     {isLoggedIn ? <UserView /> : <GuestView />}
   </div>
 );
};

export default Home;