import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminDamageReports.css';

const AdminDamageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingReport, setDeletingReport] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  // Fetch all damage reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/damage-reports');
      setReports(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setError('Failed to fetch damage reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update report status
  const updateReportStatus = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/damage-reports/${reportId}/status`, {
        status: newStatus
      });
      
      // Update the report in the list
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        )
      );
      
      // Update selected report if it's the same one
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
      
    } catch (error) {
      console.error('Error updating report status:', error);
      setError('Failed to update report status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this damage report? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingReport(true);
      await api.delete(`/damage-reports/${reportId}`);
      
      // Remove report from the list
      setReports(prevReports =>
        prevReports.filter(report => report.id !== reportId)
      );
      
      // Close modal if deleted report was selected
      if (selectedReport && selectedReport.id === reportId) {
        setShowModal(false);
        setSelectedReport(null);
      }
      
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report. Please try again.');
    } finally {
      setDeletingReport(false);
    }
  };
  
  // Open report details modal
  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };
  
  // Filter reports based on status and search term
  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      report.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'resolved': return 'status-resolved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Get status options for dropdown
  const getStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'pending', label: 'Pending' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'rejected', label: 'Rejected' }
    ];
    
    return allStatuses.filter(status => status.value !== currentStatus);
  };
  
  if (loading) {
    return (
      <div className="container my-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading damage reports...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container my-4">
      <div className="admin-damage-reports">
        <div className="page-header">
          <h2>Damage Reports Management</h2>
          <p>Review and manage damage reports submitted by users</p>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="filters-section">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                <select
                  id="statusFilter"
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="searchTerm" className="form-label">Search</label>
                <input
                  type="text"
                  id="searchTerm"
                  className="form-control"
                  placeholder="Search by room, building, user, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="stats-section">
          <div className="row">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-number">{reports.length}</div>
                <div className="stat-label">Total Reports</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card pending">
                <div className="stat-number">{reports.filter(r => r.status === 'pending').length}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card resolved">
                <div className="stat-number">{reports.filter(r => r.status === 'resolved').length}</div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reports Table */}
        <div className="reports-table-container">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <div className="no-reports-icon">📋</div>
              <h4>No Reports Found</h4>
              <p>There are no damage reports matching your current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Reporter</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <div className="room-info">
                          <strong>{report.roomName}</strong>
                          <small>{report.building}</small>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <strong>{report.userName}</strong>
                          <small>{report.userEmail}</small>
                        </div>
                      </td>
                      <td>
                        <div className="description-preview">
                          {report.description.length > 100 
                            ? `${report.description.substring(0, 100)}...`
                            : report.description
                          }
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <small>{formatDate(report.createdAt)}</small>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => openReportModal(report)}
                          >
                            View
                          </button>
                          {report.status !== 'resolved' && report.status !== 'rejected' && (
                            <div className="status-dropdown">
                              <select
                                className="form-control form-control-sm"
                                value=""
                                onChange={(e) => updateReportStatus(report.id, e.target.value)}
                                disabled={updatingStatus}
                              >
                                <option value="">Change Status</option>
                                {getStatusOptions(report.status).map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() => deleteReport(report.id)}
                            disabled={deletingReport}
                          >
                            {deletingReport ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Damage Report Details</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-section">
                  <h4>Room Information</h4>
                  <p><strong>Room:</strong> {selectedReport.roomName}</p>
                  <p><strong>Building:</strong> {selectedReport.building}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Reporter Information</h4>
                  <p><strong>Name:</strong> {selectedReport.userName}</p>
                  <p><strong>Email:</strong> {selectedReport.userEmail}</p>
                  <p><strong>Report Date:</strong> {formatDate(selectedReport.createdAt)}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Damage Description</h4>
                  <p>{selectedReport.description}</p>
                </div>
                
                {selectedReport.imageUrl && (
                  <div className="detail-section">
                    <h4>Photo Evidence</h4>
                    <img 
                      src={selectedReport.imageUrl} 
                      alt="Damage evidence" 
                      className="damage-image"
                    />
                  </div>
                )}
                
                <div className="detail-section">
                  <h4>Current Status</h4>
                  <span className={`status-badge ${getStatusBadgeClass(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="status-actions">
                <div className="modal-action-buttons">
                  {selectedReport.status !== 'resolved' && selectedReport.status !== 'rejected' && (
                    <div className="status-update-section">
                      <h5>Update Status:</h5>
                      <div className="status-buttons">
                        {getStatusOptions(selectedReport.status).map(option => (
                          <button
                            key={option.value}
                            className={`btn-status ${option.value}`}
                            onClick={() => updateReportStatus(selectedReport.id, option.value)}
                            disabled={updatingStatus}
                          >
                            {updatingStatus ? 'Updating...' : option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="delete-section">
                    <button
                      className="btn-delete-modal"
                      onClick={() => deleteReport(selectedReport.id)}
                      disabled={deletingReport}
                    >
                      {deletingReport ? 'Deleting...' : 'Delete Report'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDamageReports;