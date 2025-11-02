import React, { useState, useEffect } from 'react';
import './ScrollButton.css'; // مطمئن شوید که مسیر فایل CSS صحیح باشد

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  // نمایش/عدم نمایش دکمه اسکرول بر اساس موقعیت اسکرول
  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  // اسکرول به بالای صفحه
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // اضافه کردن event listener برای اسکرول
  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);
    
    // پاکسازی event listener هنگام unmount شدن کامپوننت
    return () => {
      window.removeEventListener('scroll', toggleVisible);
    };
  }, []);

  return (
    <button 
      className={`scroll-to-top ${visible ? '' : 'hidden'}`}
      onClick={scrollToTop}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
      </svg>
    </button>
  );
};

export default ScrollButton;