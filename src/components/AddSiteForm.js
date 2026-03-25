import React from 'react';

const AddSiteForm = React.memo(({ newSite, loading, onAddSite, onUpdateNewSite }) => {
  console.log('AddSiteForm rendered');

  return (
    <div className="add-site-form">
      <h3>Add New Site to Monitor</h3>
      <form onSubmit={onAddSite}>
        <div className="form-group">
          <label>Site Name:</label>
          <input
            type="text"
            value={newSite.name}
            onChange={(e) => onUpdateNewSite({ name: e.target.value })}
            required
            placeholder="Enter site name"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Site URL:</label>
          <input
            type="url"
            value={newSite.url}
            onChange={(e) => onUpdateNewSite({ url: e.target.value })}
            placeholder="https://example.com"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Health Check Endpoint (optional):</label>
          <input
            type="url"
            value={newSite.healthCheckEndpoint}
            onChange={(e) => onUpdateNewSite({ healthCheckEndpoint: e.target.value })}
            placeholder="https://example.com/health"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Alert Emails (optional):</label>
          <input
            type="text"
            value={newSite.alertEmails}
            onChange={(e) => onUpdateNewSite({ alertEmails: e.target.value })}
            placeholder="alerts@example.com, admin@example.com, team@example.com"
            disabled={loading}
          />
          <small style={{color: '#64748b', fontSize: '0.85em', marginTop: '5px', display: 'block'}}>
            Enter multiple email addresses separated by commas. All users will receive alerts when this site goes down (requires SMTP configuration)
          </small>
        </div>
        <div className="form-group">
          <label>Expected Status Code:</label>
          <input
            type="number"
            value={newSite.expectedStatus}
            onChange={(e) => onUpdateNewSite({ expectedStatus: parseInt(e.target.value) })}
            min="100"
            max="599"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Expected Response Time (ms):</label>
          <input
            type="number"
            value={newSite.expectedResponseTime}
            onChange={(e) => onUpdateNewSite({ expectedResponseTime: parseInt(e.target.value) })}
            min="100"
            max="30000"
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Adding...' : 'Add Site'}
        </button>
      </form>
    </div>
  );
});

export default AddSiteForm;