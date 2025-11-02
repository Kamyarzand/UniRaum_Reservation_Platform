import React, { useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeContext } from '../../utils/theme-context';

const Layout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const [showButton, setShowButton] = useState(false);
  
  // نمایش دکمه زمانی که صفحه اسکرول می‌شود
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 100) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    
    // اضافه کردن event listener
    window.addEventListener('scroll', handleScroll);
    
    // فراخوانی handler در ابتدا
    handleScroll();
    
    // پاک کردن event listener در cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // اسکرول به بالا با jQuery
  const scrollToTop = () => {
    // بررسی اینکه آیا jQuery وجود دارد
    if (window.jQuery) {
      window.jQuery('html, body').animate({
        scrollTop: 0
      }, 800); // 800 میلی‌ثانیه = مدت زمان انیمیشن (عدد بزرگتر = حرکت آهسته‌تر)
    } else {
      // اگر jQuery موجود نباشد، از روش ساده استفاده می‌کنیم
      window.scrollTo(0, 0);
    }
  };
  
  // کامپوننت دکمه اسکرول
  const ScrollButton = () => {
    //if (!showButton) return null;
    
    return (
      <a 
        href="#"
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
        }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: theme === 'dark' ? '#4cc9f0' : '#4361ee',
          color: 'white',
          border: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          opacity: 0.9,
          transition: 'all 0.3s',
          textDecoration: 'none'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="currentColor" 
          viewBox="0 0 16 16"
        >
          <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
        </svg>
      </a>
    );
  };
  
  return (
    <div className={`${theme}-theme d-flex flex-column min-vh-100`} id="top">
      <Navbar />
      <main className="flex-grow-1 py-4">
        {children}
      </main>
      <Footer />
      <ScrollButton />
    </div>
  );
};

export default Layout;