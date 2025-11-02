import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../utils/auth-context';
import { ThemeContext } from '../../utils/theme-context';
import UserService from '../../services/user.service';

const Navbar = () => {
  const { isLoggedIn, isAdmin, logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  // اضافه کردن وضعیت برای منوی کشویی ادمین
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Load user profile to get profile picture
  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserProfile = async () => {
        try {
          const response = await UserService.getUserProfile();
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // تابع برای تغییر وضعیت منوی کشویی
  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  // Component for user avatar
  const UserAvatar = ({ size = 28 }) => {
    if (userProfile?.profilePicture) {
      return (
        <img
          src={userProfile.profilePicture}
          alt="Profile"
          className="rounded-circle me-1"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: 'cover',
            border: '2px solid var(--accent-primary)'
          }}
        />
      );
    }
    
    return (
      <div
        className="rounded-circle me-1 d-flex align-items-center justify-content-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          fontSize: `${size * 0.5}px`,
          fontWeight: '600'
        }}
      >
        {(user?.username || 'U').charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark' : 'navbar-light'} navbar-modern`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src={`${process.env.PUBLIC_URL}/images/logo.png`}
            alt="UniRaum Logo"
            width="32"
            height="32"
            className="me-2"
            style={{
              filter: theme === 'dark' ? 'brightness(1.2)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
          <span className="fw-bold">UniRaum</span>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
                  <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
                </svg>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to="/rooms">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M8 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V1Zm1 13.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm7-12.5H9v12h7V2Z"/>
                  <path d="M1 2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3Z"/>
                </svg>
                Rooms
              </Link>
            </li>
            {isLoggedIn && !isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/bookings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/damage-report">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                      <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                    </svg>
                    Report Damage
                  </Link>
                </li>
              </>
            )}
            
            {isLoggedIn && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="/bookings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  My Bookings
                </Link>
              </li>
            )}
            
            {/* Admin Dropdown Menu - با تغییرات جدید */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <span
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  role="button"
                  onClick={toggleAdminDropdown}
                  style={{ cursor: 'pointer' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M9.828 4a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.173 2H2.5a1 1 0 0 0-1 .981L1.546 4h-1L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3v1z"/>
                    <path d="M13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zM2.19 3A2 2 0 0 0 .198 5.181l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H2.19z"/>
                  </svg>
                  Admin
                </span>
                <ul className={`dropdown-menu ${adminDropdownOpen ? 'show' : ''}`} style={{ display: adminDropdownOpen ? 'block' : 'none' }}>
                  <li>
                    <Link 
                      className="dropdown-item d-flex align-items-center" 
                      to="/admin/users"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                      </svg>
                      Manage Users
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item d-flex align-items-center" 
                      to="/admin/rooms"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M8 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V1Zm1 13.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm7-12.5H9v12h7V2Z"/>
                        <path d="M1 2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3Z"/>
                      </svg>
                      Manage Rooms
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item d-flex align-items-center" 
                      to="/admin/bookings"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                      </svg>
                      Manage Bookings
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item d-flex align-items-center" 
                      to="/admin/damage-reports"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
                      </svg>
                      Damage Reports
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          
          {/* بقیه کد بدون تغییر */}
          <ul className="navbar-nav">
            {/* Theme Toggle Button */}
            <li className="nav-item me-2">
              <button 
                className="nav-link btn btn-link d-flex align-items-center" 
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                    </svg>
                    Light
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                    </svg>
                    Dark
                  </>
                )}
              </button>
            </li>
            
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/login">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/register">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/profile">
                    <UserAvatar size={24} />
                    {user?.username || 'Profile'}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link d-flex align-items-center"
                    onClick={handleLogout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;