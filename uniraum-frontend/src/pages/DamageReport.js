import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../utils/auth-context';
import RoomService from '../services/room.service';
import BookingService from '../services/booking.service';
import './DamageReport.css';

const DamageReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useContext(AuthContext);
  
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Load rooms
    fetchRooms();
    
    // Check if room ID is provided in query params
    const searchParams = new URLSearchParams(location.search);
    const roomId = searchParams.get('roomId');
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  }, [isLoggedIn, navigate, location.search]);
  
  // Fetch room details when room is selected
  useEffect(() => {
    if (selectedRoomId) {
      const room = rooms.find(r => r.id === selectedRoomId);
      setSelectedRoom(room || null);
    } else {
      setSelectedRoom(null);
    }
  }, [selectedRoomId, rooms]);
  
  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const response = await RoomService.getAllRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
    }
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };
  
  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    // Reset file input
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoomId) {
      setError('Please select a room');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a description of the damage');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let imageUrl = null;
      
      // If image is selected, convert to base64 for now
      // In production, you would upload to a file storage service
      if (imageFile) {
        imageUrl = imagePreview;
      }
      
      // Create damage report
      await BookingService.createDamageReport({
        roomId: selectedRoomId,
        description: description.trim(),
        imageUrl: imageUrl
      });
      
      setSuccess(true);
      
      // Reset form
      setSelectedRoomId('');
      setSelectedRoom(null);
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/rooms');
      }, 3000);
      
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'Failed to submit damage report. Please try again.';
        
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isLoggedIn) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="damage-report-container">
            <div className="damage-report-header">
              <h2>Report Room Damage</h2>
              <p>Help us maintain our facilities by reporting any damage or issues you notice.</p>
            </div>
            
            <div className="damage-report-body">
              {success ? (
                <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h3>Report Submitted Successfully!</h3>
                  <p>Thank you for reporting the issue. Our maintenance team will review and address it promptly.</p>
                  <p>Redirecting you back to rooms...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Room Selection */}
                  <div className="form-group">
                    <label htmlFor="roomSelect" className="form-label">
                      Select Room <span className="required">*</span>
                    </label>
                    <select
                      id="roomSelect"
                      className="form-control"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      required
                    >
                      <option value="">Choose a room...</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.building}, Floor {room.floor}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Room Details Display */}
                  {selectedRoom && (
                    <div className="selected-room-info">
                      <h4>Selected Room Details</h4>
                      <div className="room-info-grid">
                        <div className="room-info-item">
                          <span className="label">Name:</span>
                          <span className="value">{selectedRoom.name}</span>
                        </div>
                        <div className="room-info-item">
                          <span className="label">Location:</span>
                          <span className="value">{selectedRoom.building}, Floor {selectedRoom.floor}</span>
                        </div>
                        <div className="room-info-item">
                          <span className="label">Type:</span>
                          <span className="value">{selectedRoom.type}</span>
                        </div>
                        <div className="room-info-item">
                          <span className="label">Capacity:</span>
                          <span className="value">{selectedRoom.capacity} people</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Damage Description */}
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Damage Description <span className="required">*</span>
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="5"
                      placeholder="Please describe the damage or issue in detail. Include location within the room, severity, and any other relevant information..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <small className="form-text">
                      Be as specific as possible to help our maintenance team address the issue effectively.
                    </small>
                  </div>
                  
                  {/* Image Upload */}
                  <div className="form-group">
                    <label htmlFor="imageFile" className="form-label">
                      Upload Photo (Optional)
                    </label>
                    <div className="image-upload-container">
                      {!imagePreview ? (
                        <div className="image-upload-area">
                          <input
                            type="file"
                            id="imageFile"
                            className="image-input"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <label htmlFor="imageFile" className="image-upload-label">
                            <div className="upload-icon">📷</div>
                            <div className="upload-text">
                              <strong>Click to upload an image</strong>
                              <br />
                              <small>PNG, JPG up to 5MB</small>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="image-preview-container">
                          <img src={imagePreview} alt="Damage preview" className="image-preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={removeImage}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <small className="form-text">
                      A photo can help our maintenance team better understand and address the issue.
                    </small>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {error}
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading || !selectedRoomId || !description.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Report'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageReport;