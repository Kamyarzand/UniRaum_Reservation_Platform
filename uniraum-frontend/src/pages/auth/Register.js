import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import { ThemeContext } from '../../utils/theme-context';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successful, setSuccessful] = useState(false);
  
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setSuccessful(false);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate email domain
    if (!email.endsWith('@ostfalia.de')) {
      setMessage('Only Ostfalia University emails (@ostfalia.de) are allowed');
      setLoading(false);
      return;
    }
    
    try {
      const response = await AuthService.signup(username, email, password);
      setMessage(response.data.message);
      setSuccessful(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const resMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      setMessage(resMessage);
      setSuccessful(false);
      setLoading(false);
    }
  };

  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '100vh',
        backgroundImage: `url('${process.env.PUBLIC_URL}/images/classroom.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Overlay for better readability */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}
      ></div>
      
      <div className="col-12 col-md-8 col-lg-6 col-xl-5" style={{ zIndex: 2 }}>
        <div 
          className={`card auth-form ${theme === 'dark' ? 'bg-dark' : ''}`}
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="card-header" style={{ backgroundColor: 'transparent', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
            <h3 className="text-center" style={{ color: theme === 'dark' ? '#ffffff' : '#212529' }}>Register</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleRegister}>
              {!successful && (
                <>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label" style={{ color: theme === 'dark' ? '#ffffff' : '#212529' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      className={`form-control ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        color: theme === 'dark' ? '#ffffff' : '#212529'
                      }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label" style={{ color: theme === 'dark' ? '#ffffff' : '#212529' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        color: theme === 'dark' ? '#ffffff' : '#212529'
                      }}
                    />
                    <small className="form-text" style={{ color: theme === 'dark' ? '#b0b0b0' : '#6c757d' }}>
                      You must use an Ostfalia University email (@ostfalia.de)
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label" style={{ color: theme === 'dark' ? '#ffffff' : '#212529' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6"
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        color: theme === 'dark' ? '#ffffff' : '#212529'
                      }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label" style={{ color: theme === 'dark' ? '#ffffff' : '#212529' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        color: theme === 'dark' ? '#ffffff' : '#212529'
                      }}
                    />
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary" 
                      type="submit" 
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                        border: 'none',
                        padding: '12px',
                        fontWeight: '600',
                        borderRadius: '8px'
                      }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Register'
                      )}
                    </button>
                  </div>
                </>
              )}
              
              {message && (
                <div 
                  className={
                    "alert " + (successful ? "alert-success" : "alert-danger") + " mt-3"
                  } 
                  role="alert"
                  style={{
                    backgroundColor: successful 
                      ? 'rgba(46, 196, 182, 0.2)' 
                      : 'rgba(231, 29, 54, 0.2)',
                    border: successful 
                      ? '1px solid rgba(46, 196, 182, 0.3)' 
                      : '1px solid rgba(231, 29, 54, 0.3)',
                    color: theme === 'dark' ? '#ffffff' : (successful ? '#0f5132' : '#721c24')
                  }}
                >
                  {message}
                </div>
              )}
              
              <div className="mt-3 text-center">
                <p style={{ color: theme === 'dark' ? '#e0e0e0' : '#495057' }}>
                  Already have an account? <Link to="/login" style={{ color: '#4361ee', fontWeight: '600' }}>Login here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;