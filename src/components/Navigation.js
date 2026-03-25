import React from 'react';

const Navigation = ({ activeView, onNavigate }) => {
  return (
    <div className="navigation">
      <div className="view-controls">
        <button 
          className={`view-btn ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          🏠 Home
        </button>
        <button 
          className={`view-btn ${activeView === 'monitor' ? 'active' : ''}`}
          onClick={() => onNavigate('monitor')}
        >
          📊 Monitor
        </button>
        <button 
          className={`view-btn ${activeView === 'reports' ? 'active' : ''}`}
          onClick={() => onNavigate('reports')}
        >
          📈 Reports
        </button>
        <button 
          className={`view-btn ${activeView === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          ⚙️ Admin
        </button>
      </div>
    </div>
  );
};

export default Navigation;