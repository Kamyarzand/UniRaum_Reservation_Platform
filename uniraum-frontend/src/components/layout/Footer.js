import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-modern py-4 mt-auto">
      <div className="container text-center">
        <p>&copy; {currentYear} UniRaum - University Room Booking System</p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;