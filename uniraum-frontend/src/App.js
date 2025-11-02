import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './theme.css';
import { AuthProvider } from './utils/auth-context';
import { ThemeProvider } from './utils/theme-context';
import 'bootstrap/dist/css/bootstrap.min.css';
// Layout Components
import Layout from './components/layout/Layout';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoomsList from './pages/rooms/RoomsList';
import RoomDetails from './pages/rooms/RoomDetails';
import BookingsList from './pages/bookings/BookingsList';
import Profile from './pages/profile/Profile';
import DamageReport from './pages/DamageReport';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import ManageRooms from './pages/admin/ManageRooms';
import ManageBookings from './pages/admin/ManageBookings';
import AdminDamageReports from './pages/admin/AdminDamageReports';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/rooms" element={<RoomsList />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/bookings" 
                  element={
                    <PrivateRoute>
                      <BookingsList />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/damage-report" 
                  element={
                    <PrivateRoute>
                      <DamageReport />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/users" 
                  element={
                    <PrivateRoute roles={['admin']}>
                      <ManageUsers />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/admin/rooms" 
                  element={
                    <PrivateRoute roles={['admin']}>
                      <ManageRooms />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/admin/bookings" 
                  element={
                    <PrivateRoute roles={['admin']}>
                      <ManageBookings />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/admin/damage-reports" 
                  element={
                    <PrivateRoute roles={['admin']}>
                      <AdminDamageReports />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;