import React from 'react';

const SiteCard = React.memo(({ site, loading, hasHealthData, onCheckSite, onDeleteSite, onEditSite }) => {
  console.log(`SiteCard ${site?.id} rendered`);

  // Safe access to site properties
  const siteId = site?.id;
  const siteName = site?.name || 'Unknown Site';
  const siteUrl = site?.health_check_endpoint || site?.url || 'No URL';
  const alertEmails = site?.alert_emails;
  const lastStatus = site?.last_status;
  const lastResponseTime = site?.last_response_time;
  const lastMessage = site?.last_message;
  const lastStatusCode = site?.last_status_code;
  const lastChecked = site?.last_checked;
  const isChecking = site?.checking;

  const getStatusClass = (status) => {
    switch (status) {
      case 'up': return 'status-up';
      case 'down': return 'status-down';
      case 'degraded': return 'status-degraded';
      default: return 'status-unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'up': return 'Online';
      case 'down': return 'Offline';
      case 'degraded': return 'Degraded';
      default: return 'Not Checked';
    }
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className={`site-card ${hasHealthData ? lastStatus : ''}`}>
      <div className="site-header">
        <div className="site-name">{siteName}</div>
        <div className="site-header-actions">
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => onEditSite(site)}
            disabled={loading}
            title="Edit site"
          >
            ✏️
          </button>
          <button 
            className="btn btn-danger btn-small"
            onClick={() => onDeleteSite(siteId, siteName)}
            disabled={loading}
            title="Delete site"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="site-url">
        {siteUrl}
      </div>
      
      {alertEmails && (
        <div className="site-email" style={{fontSize: '0.85em', color: '#64748b', marginBottom: '8px'}}>
          📧 {alertEmails}
        </div>
      )}
      
      <div className="health-status">
        <span className={getStatusClass(hasHealthData ? lastStatus : '')}>
          {getStatusText(hasHealthData ? lastStatus : '')}
        </span>
      </div>

      {hasHealthData && (
        <>
          <div className="response-time">
            ⏱️ Response time: {lastResponseTime}ms
          </div>
          <div className="status-message">
            {lastMessage}
          </div>
          <div className="status-code">
            🔢 Status code: {lastStatusCode}
          </div>
        </>
      )}
      
      <div className="last-checked">
        ⏰ Last checked: {formatLastChecked(lastChecked)}
      </div>
      
      <div className="site-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onCheckSite(siteId)}
          disabled={isChecking || loading}
        >
          {isChecking ? 'Checking...' : '🔄 Check Now'}
        </button>
      </div>
    </div>
  );
});

export default SiteCard;