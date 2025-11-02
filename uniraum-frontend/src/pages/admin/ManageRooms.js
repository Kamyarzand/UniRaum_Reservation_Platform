import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomService from '../../services/room.service';
import AuthService from '../../services/auth.service';
import './admin.css';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form state for new room
  const [showForm, setShowForm] = useState(false);
  const [roomData, setRoomData] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    type: 'lecture',
    hasComputers: false,
    hasProjector: false,
    description: ''
  });

  // Edit and delete states
  const [editMode, setEditMode] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Make sure only admins can access this page
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      navigate('/');
    }
  }, [navigate]);

  // Load rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkbox inputs, use the checked property
    const inputValue = type === 'checkbox' ? checked : value;
    
    setRoomData({
      ...roomData,
      [name]: inputValue
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert numeric fields
      const roomToSubmit = {
        ...roomData,
        floor: parseInt(roomData.floor),
        capacity: parseInt(roomData.capacity)
      };
      
      if (editMode) {
        // Update existing room
        await RoomService.updateRoom(selectedRoomId, roomToSubmit);
        alert('Room updated successfully!');
      } else {
        // Create new room
        await RoomService.createRoom(roomToSubmit);
        alert('Room created successfully!');
      }
      
      // Reset form and refresh rooms list
      setRoomData({
        name: '',
        building: '',
        floor: '',
        capacity: '',
        type: 'lecture',
        hasComputers: false,
        hasProjector: false,
        description: ''
      });
      
      setSelectedRoomId(null);
      setEditMode(false);
      setShowForm(false);
      fetchRooms();
      
    } catch (error) {
      alert(editMode ? 'Failed to update room. Please try again.' : 'Failed to create room. Please try again.');
      console.error(editMode ? 'Error updating room:' : 'Error creating room:', error);
    }
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    setRoomData({
      name: room.name,
      building: room.building,
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
      type: room.type,
      hasComputers: room.hasComputers,
      hasProjector: room.hasProjector,
      description: room.description || ''
    });
    
    setSelectedRoomId(room.id);
    setEditMode(true);
    setShowForm(true);
  };

  // Handle delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      await RoomService.deleteRoom(roomId);
      fetchRooms(); // Refresh the rooms list
    } catch (error) {
      alert('Failed to delete room. There might be bookings associated with this room.');
      console.error('Error deleting room:', error);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setRoomData({
      name: '',
      building: '',
      floor: '',
      capacity: '',
      type: 'lecture',
      hasComputers: false,
      hasProjector: false,
      description: ''
    });
    
    setSelectedRoomId(null);
    setEditMode(false);
    setShowForm(false);
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

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Rooms</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (editMode) {
              handleCancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm ? 'Cancel' : 'Add New Room'}
        </button>
      </div>
      
      {/* New Room Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">{editMode ? 'Edit Room' : 'Add New Room'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">Room Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={roomData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="building" className="form-label">Building</label>
                  <input
                    type="text"
                    className="form-control"
                    id="building"
                    name="building"
                    value={roomData.building}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="floor" className="form-label">Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    id="floor"
                    name="floor"
                    value={roomData.floor}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="capacity" className="form-label">Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    id="capacity"
                    name="capacity"
                    value={roomData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Room Type</label>
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={roomData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="lecture">Lecture Room</option>
                  <option value="lab">Laboratory</option>
                  <option value="meeting">Meeting Room</option>
                </select>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasComputers"
                      name="hasComputers"
                      checked={roomData.hasComputers}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="hasComputers">
                      Has Computers
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hasProjector"
                      name="hasProjector"
                      checked={roomData.hasProjector}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="hasProjector">
                      Has Projector
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={roomData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="d-flex justify-content-between mt-3">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={editMode ? handleCancelEdit : () => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editMode ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Room List</h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => fetchRooms()}
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Features</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td>{room.name}</td>
                      <td>{room.building}, Floor {room.floor}</td>
                      <td>{room.type}</td>
                      <td>{room.capacity}</td>
                      <td>
                        {room.hasComputers && 
                          <span className="badge bg-info me-1">Computers</span>
                        }
                        {room.hasProjector && 
                          <span className="badge bg-success me-1">Projector</span>
                        }
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditRoom(room)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;