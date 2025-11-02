import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../utils/auth-context';
import UserService from '../../services/user.service';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form data for editing
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Profile picture states
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureError, setPictureError] = useState('');
  const [pictureSuccess, setPictureSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  // Format date properly regardless of format
  const formatDate = (dateValue) => {
    try {
      let date;
      
      // If it's null or undefined
      if (!dateValue) {
        return 'Not available';
      }
      
      // If it's a Firebase Timestamp with seconds
      if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      // If it's a Firebase Timestamp with _seconds
      else if (dateValue._seconds) {
        date = new Date(dateValue._seconds * 1000);
      }
      // If it's already a string (ISO format)
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // If it's a number (timestamp)
      else if (typeof dateValue === 'number') {
        // Check if it's in seconds or milliseconds
        date = dateValue > 1000000000000 ? new Date(dateValue) : new Date(dateValue * 1000);
      }
      // If it's already a Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Default case
      else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format the date nicely
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date format error';
    }
  };
  
  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await UserService.getUserProfile();
        setProfile(response.data);
        
        // Initialize form data
        setUsername(response.data.username);
        setEmail(response.data.email);
        
        setError('');
      } catch (error) {
        setError('Failed to load profile. Please try again later.');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle profile picture upload
  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPictureError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPictureError('File size must be less than 5MB');
      return;
    }
    
    try {
      setUploadingPicture(true);
      setPictureError('');
      setPictureSuccess(false);
      
      const response = await UserService.uploadProfilePicture(file);
      
      // Update profile state with new picture
      setProfile(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      
      setPictureSuccess(true);
      setTimeout(() => setPictureSuccess(false), 3000);
      
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'Failed to upload profile picture. Please try again.';
        
      setPictureError(errorMessage);
    } finally {
      setUploadingPicture(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle profile picture delete
  const handlePictureDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }
    
    try {
      setUploadingPicture(true);
      setPictureError('');
      
      await UserService.deleteProfilePicture();
      
      // Remove picture from profile state
      setProfile(prev => ({
        ...prev,
        profilePicture: null
      }));
      
      setPictureSuccess(true);
      setTimeout(() => setPictureSuccess(false), 3000);
      
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'Failed to delete profile picture. Please try again.';
        
      setPictureError(errorMessage);
    } finally {
      setUploadingPicture(false);
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setUpdateError('');
    setUpdateSuccess(false);
    
    // Validate
    if (password && password !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }
    
    // Validate email domain
    if (email && !email.endsWith('@ostfalia.de')) {
      setUpdateError('Only Ostfalia University emails (@ostfalia.de) are allowed');
      return;
    }
    
    try {
      // Prepare update data
      const updateData = {};
      
      if (username !== profile.username) {
        updateData.username = username;
      }
      
      if (email !== profile.email) {
        updateData.email = email;
      }
      
      if (password) {
        updateData.password = password;
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        setUpdateError('No changes detected');
        return;
      }
      
      await UserService.updateUserProfile(updateData);
      
      setUpdateSuccess(true);
      setEditing(false);
      
      // Reset password fields
      setPassword('');
      setConfirmPassword('');
      
      // Reload profile
      const response = await UserService.getUserProfile();
      setProfile(response.data);
      
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'Failed to update profile. Please try again.';
        
      setUpdateError(errorMessage);
    }
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
  
  return (
    <div className="container">
      <h2 className="mb-4">User Profile</h2>
      
      {updateSuccess && (
        <div className="alert alert-success">
          Profile updated successfully!
        </div>
      )}
      
      {pictureSuccess && (
        <div className="alert alert-success">
          Profile picture updated successfully!
        </div>
      )}
      
      <div className="row">
        {/* Profile Picture Section */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Profile Picture</h5>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="img-fluid rounded-circle"
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover',
                      border: '3px solid var(--accent-primary)'
                    }}
                  />
                ) : (
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto"
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '3px solid var(--border)'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                      <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {pictureError && (
                <div className="alert alert-danger alert-sm">
                  {pictureError}
                </div>
              )}
              
              <div className="d-grid gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  style={{ display: 'none' }}
                />
                
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingPicture}
                >
                  {uploadingPicture ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                      </svg>
                      Upload Picture
                    </>
                  )}
                </button>
                
                {profile.profilePicture && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handlePictureDelete}
                    disabled={uploadingPicture}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                    Remove Picture
                  </button>
                )}
              </div>
              
              <small className="text-muted mt-2 d-block">
                Max size: 5MB. Formats: JPG, PNG, GIF
              </small>
            </div>
          </div>
        </div>
        
        {/* Profile Information Section */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <small className="form-text text-muted">
                      You must use an Ostfalia University email (@ostfalia.de)
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!password}
                    />
                  </div>
                  
                  {updateError && (
                    <div className="alert alert-danger">
                      {updateError}
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Username:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p>
                      <strong>Account Created:</strong>{' '}
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;