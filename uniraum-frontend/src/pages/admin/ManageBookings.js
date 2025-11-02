import React, { useState, useEffect, useRef } from 'react';
import BookingService from '../../services/booking.service';
import RoomService from '../../services/room.service';
import './admin.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // Store all bookings for filtering
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    status: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);
  
  // Refs for date pickers
  const dateInputRef = useRef(null);
  
  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [filterDate, filterRoom, filterUser, filterStatus, allBookings]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Use the new admin endpoint
      const response = await BookingService.getAllBookings();
      setAllBookings(response.data);
      setBookings(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch bookings. Make sure you have admin permissions.');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRooms = async () => {
    try {
      const response = await RoomService.getAllRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...allBookings];
    
    if (filterDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
        return bookingDate === filterDate;
      });
    }
    
    if (filterRoom) {
      filtered = filtered.filter(booking => 
        booking.roomId === filterRoom
      );
    }
    
    if (filterUser) {
      filtered = filtered.filter(booking => 
        booking.username && booking.username.toLowerCase().includes(filterUser.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    setBookings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await BookingService.deleteBooking(id);
        setSuccess('Booking deleted successfully');
        fetchBookings(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete booking');
        setTimeout(() => setError(''), 3000);
      }
    }
  };
  
  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      startTime: new Date(booking.startTime).toISOString().slice(0, 16),
      endTime: new Date(booking.endTime).toISOString().slice(0, 16),
      purpose: booking.purpose,
      status: booking.status
    });
    setShowEditModal(true);
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose: editForm.purpose,
        status: editForm.status
      };
      
      await BookingService.updateBooking(editingBooking.id, updatedData);
      setSuccess('Booking updated successfully');
      setShowEditModal(false);
      fetchBookings(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update booking');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const clearFilters = () => {
    setFilterDate('');
    setFilterRoom('');
    setFilterUser('');
    setFilterStatus('all');
  };
  
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: 'bg-success',
      cancelled: 'bg-danger',
      pending: 'bg-warning',
      completed: 'bg-info'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Handle date field click to open picker
  const handleDateFieldClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };
  
  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  
  if (loading && bookings.length === 0) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Manage Bookings ({allBookings.length} total)</h3>
              <button className="btn btn-outline-secondary" onClick={fetchBookings}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-3 mb-2">
                  <label className="form-label">Filter by Date</label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="form-control"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    onClick={handleDateFieldClick}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                
                <div className="col-md-3 mb-2">
                  <label className="form-label">Filter by Room</label>
                  <select
                    className="form-select"
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                  >
                    <option value="">All Rooms</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.building}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-3 mb-2">
                  <label className="form-label">Filter by User</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                  />
                </div>
                
                <div className="col-md-3 mb-2">
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
                <small className="text-muted">
                  Showing {bookings.length} of {allBookings.length} bookings
                </small>
              </div>
              
              {/* Bookings Table */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Room</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBookings.length > 0 ? (
                      currentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td>{booking.id}</td>
                          <td>{booking.username || 'Unknown'}</td>
                          <td>
							  <div>
								{booking.roomName || 'Unknown Room'}
								{booking.building && (
								  <>
									<br />
									<small className="text-muted">
									  {booking.building}, Floor {booking.floor}
									</small>
								  </>
								)}
							  </div>
							</td>
                          <td>{formatDateTime(booking.startTime)}</td>
                          <td>{formatDateTime(booking.endTime)}</td>
                          <td>
                            <span title={booking.purpose}>
                              {booking.purpose.length > 30 
                                ? booking.purpose.substring(0, 30) + '...' 
                                : booking.purpose}
                            </span>
                          </td>
                          <td>{getStatusBadge(booking.status)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(booking)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(booking.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          {bookings.length === 0 && allBookings.length > 0 
                            ? 'No bookings match the current filters'
                            : 'No bookings found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Booking</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Purpose</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.purpose}
                      onChange={(e) => setEditForm({...editForm, purpose: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      required
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal backdrop */}
      {showEditModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default ManageBookings;