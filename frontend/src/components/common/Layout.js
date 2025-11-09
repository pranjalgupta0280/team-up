import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <main className="container" style={{ padding: '32px 0' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;