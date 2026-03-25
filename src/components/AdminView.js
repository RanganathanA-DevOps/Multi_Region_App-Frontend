import React, { useState, useEffect } from 'react';

const AdminView = ({ smtpConfig, loading, onSaveSmtpConfig, onTestSmtpConfig, onNavigate }) => {
  const [formData, setFormData] = useState({
    smtp_server: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    use_tls: true
  });
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (smtpConfig) {
      setFormData({
        smtp_server: smtpConfig.smtp_server || '',
        smtp_port: smtpConfig.smtp_port || 587,
        smtp_username: smtpConfig.smtp_username || '',
        smtp_password: smtpConfig.smtp_password || '',
        from_email: smtpConfig.from_email || '',
        use_tls: smtpConfig.use_tls !== false
      });
    }
  }, [smtpConfig]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveSmtpConfig(formData);
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }
    
    setIsTesting(true);
    await onTestSmtpConfig(testEmail);
    setIsTesting(false);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Settings</h2>
        <p>Configure SMTP server settings for email alerts</p>
      </div>

      <div className="admin-content">
        <div className="smtp-config-section">
          <h3>SMTP Server Configuration</h3>
          
          <form onSubmit={handleSubmit} className="smtp-config-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="smtp_server">SMTP Server *</label>
                <input
                  type="text"
                  id="smtp_server"
                  name="smtp_server"
                  value={formData.smtp_server}
                  onChange={handleInputChange}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="smtp_port">SMTP Port *</label>
                <input
                  type="number"
                  id="smtp_port"
                  name="smtp_port"
                  value={formData.smtp_port}
                  onChange={handleInputChange}
                  placeholder="587"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="smtp_username">SMTP Username *</label>
              <input
                type="text"
                id="smtp_username"
                name="smtp_username"
                value={formData.smtp_username}
                onChange={handleInputChange}
                placeholder="your-email@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtp_password">SMTP Password *</label>
              <input
                type="password"
                id="smtp_password"
                name="smtp_password"
                value={formData.smtp_password}
                onChange={handleInputChange}
                placeholder="Your SMTP password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="from_email">From Email *</label>
              <input
                type="email"
                id="from_email"
                name="from_email"
                value={formData.from_email}
                onChange={handleInputChange}
                placeholder="noreply@yourdomain.com"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="use_tls"
                  checked={formData.use_tls}
                  onChange={handleInputChange}
                />
                Use TLS/SSL
              </label>
            </div>

            <div className="form-buttons">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save SMTP Configuration'}
              </button>
            </div>
          </form>
        </div>

        <div className="smtp-test-section">
          <h3>Test SMTP Configuration</h3>
          <p>Send a test email to verify your SMTP settings</p>
          
          <form onSubmit={handleTest} className="test-smtp-form">
            <div className="form-group">
              <label htmlFor="test_email">Test Email Address *</label>
              <input
                type="email"
                id="test_email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading || isTesting || !testEmail}
              >
                {isTesting ? 'Sending Test...' : 'Send Test Email'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-info">
          <h4>SMTP Configuration Tips</h4>
          <ul>
            <li><strong>Gmail:</strong> smtp.gmail.com, Port 587, Use TLS enabled</li>
            <li><strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com, Port 587, Use TLS enabled</li>
            <li><strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587, Use TLS enabled</li>
            <li>For Gmail, you may need to use an "App Password" instead of your regular password</li>
            <li>Ensure your email provider allows SMTP access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminView;