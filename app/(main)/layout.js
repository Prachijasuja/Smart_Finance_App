
import React from 'react';
import './MainLayout.css';

const Mainlayout = ({ children }) => {
  return (
    <div className="container">
      {children}
    </div>
  );
};

export default Mainlayout;
