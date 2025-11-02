import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/user.service';
import AuthService from '../../services/auth.service';
import './admin.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // State for user form
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Form data
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  
  // Form errors
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // State for dropdown management
  const [openDropdown, setOpenDropdown] = useState(null);

  // Make sure only admins can access this page
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      navigate('/');
    }
  }, [navigate]);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load users. Please try again later.');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

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
        month: 'short',
        day: 'numeric'
      });
      
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setFormError('');
    setFormSuccess('');

    // Validate form
    if (formMode === 'create' || userData.password) {
      if (userData.password !== userData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    // Validate email domain
    if (!userData.email.endsWith('@ostfalia.de')) {
      setFormError('Only Ostfalia University emails (@ostfalia.de) are allowed');
      return;
    }

    try {
      if (formMode === 'create') {
        // Create new user
        await UserService.createUser({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role
        });
        
        setFormSuccess('User created successfully!');
      } else {
        // Update existing user
        const updateData = {
          username: userData.username,
          email: userData.email,
          role: userData.role
        };
        
        // Only include password if provided
        if (userData.password) {
          updateData.password = userData.password;
        }
        
        await UserService.updateUser(selectedUserId, updateData);
        setFormSuccess('User updated successfully!');
      }
      
      // Refresh user list
      fetchUsers();
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (error) {
      const errorMessage = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        'An error occurred. Please try again.';
        
      setFormError(errorMessage);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      // Call API to update user role
      await UserService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Close dropdown
      setOpenDropdown(null);
      
      // Show success message
      alert('User role updated successfully!');
      
    } catch (error) {
      alert('Failed to update user role. Please try again.');
      console.error('Error updating user role:', error);
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = (e, userId) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  // Handle edit user
  const handleEditUser = async (userId) => {
    try {
      const response = await UserService.getUserById(userId);
      const user = response.data;
      
      setSelectedUserId(userId);
      setUserData({
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role
      });
      
      setFormMode('edit');
      setShowForm(true);
      setFormError('');
      setFormSuccess('');
      
    } catch (error) {
      alert('Failed to load user details. Please try again.');
      console.error('Error loading user details:', error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await UserService.deleteUser(userId);
      
      // Update local state by removing the deleted user
      setUsers(users.filter(user => user.id !== userId));
      
      alert('User deleted successfully!');
      
    } catch (error) {
      alert('Failed to delete user. Please try again.');
      console.error('Error deleting user:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setUserData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });
    
    setSelectedUserId(null);
    setFormMode('create');
    setShowForm(false);
    setFormError('');
    setFormSuccess('');
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
        <h2>Manage Users</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>
      
      {/* User Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">
              {formMode === 'create' ? 'Add New User' : 'Edit User'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Must be an Ostfalia University email (@ostfalia.de)
                  </small>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    {formMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    required={formMode === 'create'}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    required={formMode === 'create' || userData.password !== ''}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {formError && (
                <div className="alert alert-danger mb-3">
                  {formError}
                </div>
              )}
              
              {formSuccess && (
                <div className="alert alert-success mb-3">
                  {formSuccess}
                </div>
              )}
              
              <div className="d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {formMode === 'create' ? 'Create User' : 'Update User'}
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
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">User List</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => fetchUsers()}
                >
                  Refresh
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #dee2e6'
                            }}
                          >
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={`${user.username}'s profile`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <div 
                              style={{
                                display: user.profilePicture ? 'none' : 'block',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#6c757d'
                              }}
                            >
                              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                          </div>
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' 
                              ? 'bg-danger' 
                              : user.role === 'teacher' 
                                ? 'bg-warning' 
                                : 'bg-info'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {/* Custom Dropdown */}
                            <div className="btn-group me-2" style={{ position: 'relative' }}>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => toggleDropdown(e, user.id)}
                              >
                                Change Role ▼
                              </button>
                              {openDropdown === user.id && (
                                <div 
                                  className="dropdown-menu show"
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    zIndex: 1000,
                                    display: 'block',
                                    minWidth: '140px',
                                    backgroundColor: 'white',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '0.375rem',
                                    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                                  }}
                                >
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleRoleChange(user.id, 'student')}
                                    disabled={user.role === 'student'}
                                    style={{
                                      cursor: user.role === 'student' ? 'not-allowed' : 'pointer',
                                      opacity: user.role === 'student' ? 0.5 : 1
                                    }}
                                  >
                                    Student
                                  </button>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleRoleChange(user.id, 'teacher')}
                                    disabled={user.role === 'teacher'}
                                    style={{
                                      cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
                                      opacity: user.role === 'teacher' ? 0.5 : 1
                                    }}
                                  >
                                    Teacher
                                  </button>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                    disabled={user.role === 'admin'}
                                    style={{
                                      cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                                      opacity: user.role === 'admin' ? 0.5 : 1
                                    }}
                                  >
                                    Admin
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <button 
                              className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => handleEditUser(user.id)}
                            >
                              Edit
                            </button>
                            
                            {(() => {
                              const currentUser = AuthService.getCurrentUser();
                              // Don't show delete button for current admin user
                              if (currentUser && currentUser.id === user.id) {
                                return null;
                              }
                              
                              return (
                                <button 
                                  className="btn btn-sm btn-outline-danger" 
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </button>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            <h5>Roles Explanation</h5>
            <ul className="mb-0">
              <li><strong>Student:</strong> Can book rooms.</li>
              <li><strong>Teacher:</strong> Can book rooms with priority.</li>
              <li><strong>Admin:</strong> Full system access, including user management.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageUsers;