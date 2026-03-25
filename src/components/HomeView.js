import React from 'react';

const HomeView = React.memo(({ sites = [], onNavigate }) => {
  console.log('HomeView rendered');
  
  const safeSites = Array.isArray(sites) ? sites : [];
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="cta-section">
          <h2>Ready to Start Monitoring?</h2>
          <p>Choose how you want to get started:</p>
          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => onNavigate('monitor')}
            >
              🖥️ Go to Monitor
            </button>
            <button 
              className="btn btn-success btn-large"
              onClick={() => onNavigate('reports')}
            >
              📊 View Reports
            </button>
          </div>
        </div>

        <div className="quick-stats">
          <h3>Current Status</h3>
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-number">{safeSites.length}</span>
              <span className="stat-label">Monitored Sites</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {safeSites.filter(site => site && site.last_status === 'up').length}
              </span>
              <span className="stat-label">Sites Online</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {safeSites.filter(site => site && site.last_status === 'down').length}
              </span>
              <span className="stat-label">Sites Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HomeView;