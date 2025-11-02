import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../utils/auth-context';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) {
    // User is not logged in
    return <Navigate to="/login" />;
  }

  if (roles && roles.length > 0) {
    // Check if user has required role
    const hasRequiredRole = roles.includes(user.role);
    if (!hasRequiredRole) {
      // User is logged in but doesn't have required role
      return <Navigate to="/" />;
    }
  }

  // User is logged in and has required role (if specified)
  return children;
};

export default PrivateRoute;