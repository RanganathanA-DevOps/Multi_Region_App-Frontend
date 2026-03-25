import React from 'react';

const EditSiteForm = React.memo(({ site, loading, onSaveSite, onUpdateSite, onCancel }) => {
  console.log('EditSiteForm rendered');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSite(site.id);
  };

  const handleChange = (field, value) => {
    onUpdateSite({ [field]: value });
  };

  return (
    <div className="edit-site-form">
      <h3>Edit Site: {site.name}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Site Name:</label>
          <input
            type="text"
            value={site.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Enter site name"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Site URL:</label>
          <input
            type="url"
            value={site.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Health Check Endpoint (optional):</label>
          <input
            type="url"
            value={site.health_check_endpoint || ''}
            onChange={(e) => handleChange('health_check_endpoint', e.target.value)}
            placeholder="https://example.com/health"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Alert Emails (optional):</label>
          <input
            type="text"
            value={site.alert_emails || ''}
            onChange={(e) => handleChange('alert_emails', e.target.value)}
            placeholder="alerts@example.com, admin@example.com, team@example.com"
            disabled={loading}
          />
          <small style={{color: '#64748b', fontSize: '0.85em', marginTop: '5px', display: 'block'}}>
            Enter multiple email addresses separated by commas
          </small>
        </div>
        <div className="form-group">
          <label>Expected Status Code:</label>
          <input
            type="number"
            value={site.expected_status || 200}
            onChange={(e) => handleChange('expected_status', parseInt(e.target.value))}
            min="100"
            max="599"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Expected Response Time (ms):</label>
          <input
            type="number"
            value={site.expected_response_time || 5000}
            onChange={(e) => handleChange('expected_response_time', parseInt(e.target.value))}
            min="100"
            max="30000"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Check Interval (minutes):</label>
          <input
            type="number"
            value={site.check_interval || 5}
            onChange={(e) => handleChange('check_interval', parseInt(e.target.value))}
            min="1"
            max="60"
            disabled={loading}
          />
          <small style={{color: '#64748b', fontSize: '0.85em', marginTop: '5px', display: 'block'}}>
            How often to check this site (1-60 minutes)
          </small>
        </div>
        <div className="form-group">
          <label>Site Status:</label>
          <select
            value={site.is_active !== false}
            onChange={(e) => handleChange('is_active', e.target.value === 'true')}
            disabled={loading}
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

export default EditSiteForm;