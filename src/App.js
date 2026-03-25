import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UptimeReport from './components/UptimeReport';
import HomeView from './components/HomeView';
import MonitorView from './components/MonitorView';
import AdminView from './components/AdminView';
import Navigation from './components/Navigation';
import config from './config'; 
import './App.css';

const API_BASE = `${config.API_BASE_URL}/api`;

// Custom hook for persistent state
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setPersistentState = useCallback((value) => {
    try {
      setState(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [state, setPersistentState];
};

function App() {
  const [sites, setSites] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
    healthCheckEndpoint: '',
    alertEmails: '', // Changed from alertEmail to alertEmails
    expectedStatus: 200,
    expectedResponseTime: 5000
  });

  // Use persistent state for activeView
  const [activeView, setActiveView] = usePersistentState('activeView', 'home');

  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/sites`);
      const sitesWithoutHealth = response.data.map(site => ({
        ...site,
        last_status: null,
        last_response_time: null,
        last_status_code: null,
        last_message: null,
        last_checked: null
      }));
      setSites(sitesWithoutHealth);
      setError('');
    } catch (err) {
      setError('Failed to load sites. Make sure backend is running on port 5000.');
      console.error('Error loading sites:', err);
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSitesWithHealthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/sites/health-status`);
      setSites(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading sites with health status:', err);
      setSites([]);
      await loadSites();
    } finally {
      setLoading(false);
    }
  }, [loadSites]);

  // Load SMTP configuration
  const loadSmtpConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/smtp-config`);
      setSmtpConfig(response.data);
    } catch (err) {
      console.error('Error loading SMTP configuration:', err);
      // Set default empty config if not found
      setSmtpConfig({
        smtp_server: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        from_email: '',
        use_tls: true
      });
    }
  }, []);

  // Save SMTP configuration
  const saveSmtpConfig = useCallback(async (configData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/admin/smtp-config`, configData);
      setSmtpConfig(response.data);
      setError('SMTP configuration saved successfully!');
      setTimeout(() => setError(''), 3000);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save SMTP configuration';
      setError(errorMsg);
      console.error('Error saving SMTP configuration:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Test SMTP configuration
  const testSmtpConfig = useCallback(async (testEmail) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/admin/test-smtp`, {
        test_email: testEmail
      });
      setError('SMTP test email sent successfully!');
      setTimeout(() => setError(''), 3000);
      return { success: true, message: 'Test email sent successfully' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send test email';
      setError(errorMsg);
      console.error('Error testing SMTP configuration:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'monitor' || activeView === 'reports' || activeView === 'home') {
      loadSitesWithHealthStatus();
    }
    if (activeView === 'admin') {
      loadSmtpConfig();
    }
  }, [activeView, loadSitesWithHealthStatus, loadSmtpConfig]);

  useEffect(() => {
    if (activeView === 'monitor') {
      const interval = setInterval(() => {
        loadSitesWithHealthStatus();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeView, loadSitesWithHealthStatus]);

  const checkAllSites = useCallback(async () => {
    try {
      setLoading(true);
      await axios.get(`${API_BASE}/health-check/all`);
      await loadSitesWithHealthStatus();
      setError('');
    } catch (err) {
      setError('Failed to check sites health');
      console.error('Error checking sites:', err);
    } finally {
      setLoading(false);
    }
  }, [loadSitesWithHealthStatus]);

  const checkSingleSite = useCallback(async (siteId) => {
    try {
      setSites(prevSites => 
        prevSites.map(site => 
          site.id === siteId ? { ...site, checking: true } : site
        )
      );
      
      await axios.get(`${API_BASE}/sites/${siteId}/health`);
      await loadSitesWithHealthStatus();
      setError('');
    } catch (err) {
      setError('Failed to check site health');
      console.error('Error checking site:', err);
    } finally {
      setSites(prevSites => 
        prevSites.map(site => 
          site.id === siteId ? { ...site, checking: false } : site
        )
      );
    }
  }, [loadSitesWithHealthStatus]);

  const addSite = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Process alert emails - split by comma and trim each email
      const siteData = {
        ...newSite,
        alertEmails: newSite.alertEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0)
      };
      
      await axios.post(`${API_BASE}/sites`, siteData);
      setNewSite({
        name: '',
        url: '',
        healthCheckEndpoint: '',
        alertEmails: '', // Reset to empty string
        expectedStatus: 200,
        expectedResponseTime: 5000
      });
      setShowAddForm(false);
      await loadSitesWithHealthStatus();
      setError('Site added successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Failed to add site');
      console.error('Error adding site:', err);
    } finally {
      setLoading(false);
    }
  }, [newSite, loadSitesWithHealthStatus]);

  // EDIT SITE FUNCTIONALITY
  const editSite = useCallback((site) => {
    setEditingSite({ 
      ...site,
      // Ensure all fields are properly set
      health_check_endpoint: site.health_check_endpoint || '',
      alert_emails: site.alert_emails || '',
      expected_status: site.expected_status || 200,
      expected_response_time: site.expected_response_time || 5000,
      check_interval: site.check_interval || 5, // ADDED: check_interval field
      is_active: site.is_active !== false // Default to true if not set
    });
    setShowEditForm(true);
  }, []);

  const toggleEditForm = useCallback(() => {
    setShowEditForm(prev => !prev);
    setEditingSite(null);
  }, []);

  const updateEditingSite = useCallback((updates) => {
    setEditingSite(prev => ({ ...prev, ...updates }));
  }, []);

  // FIXED: saveSite function - properly format data for backend API
  const saveSite = useCallback(async (siteId) => {
    try {
      setLoading(true);
      console.log('Saving site with ID:', siteId);
      console.log('Editing site data:', editingSite);

      // Format the data to match backend expectations
      const updateData = {
        name: editingSite.name,
        url: editingSite.url,
        healthCheckEndpoint: editingSite.health_check_endpoint || '',
        alertEmails: editingSite.alert_emails || '',
        expectedStatus: editingSite.expected_status || 200,
        expectedResponseTime: editingSite.expected_response_time || 5000,
        checkInterval: editingSite.check_interval || 5, // ADDED: checkInterval field
        isActive: editingSite.is_active !== false
      };

      console.log('Sending update data:', updateData);

      const response = await axios.put(`${API_BASE}/sites/${siteId}`, updateData);
      
      console.log('Update response:', response.data);
      
      setShowEditForm(false);
      setEditingSite(null);
      await loadSitesWithHealthStatus();
      setError('Site updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error updating site:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        setError(`Failed to update site: ${err.response.data.error || err.message}`);
      } else {
        setError('Failed to update site: Network error');
      }
    } finally {
      setLoading(false);
    }
  }, [editingSite, loadSitesWithHealthStatus]);

  const deleteSite = useCallback(async (siteId, siteName) => {
    if (window.confirm(`Are you sure you want to delete "${siteName}"?`)) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE}/sites/${siteId}`);
        setSites(prevSites => prevSites.filter(site => site.id !== siteId));
        setError(`Site "${siteName}" deleted successfully`);
        setTimeout(() => setError(''), 3000);
      } catch (err) {
        setError('Failed to delete site');
        console.error('Error deleting site:', err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const updateNewSite = useCallback((updates) => {
    setNewSite(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
  }, []);

  const navigateToView = useCallback((view) => {
    setActiveView(view);
  }, [setActiveView]);

  return (
    <div className="container">
      <div className="header">
        <h1>Site Health Monitor</h1>
        <p>Monitor your sites and health check endpoints - Auto-refreshes every 30 seconds in Monitor view</p>
      </div>

      {error && (
        <div className={`error ${error.includes('successfully') || error.includes('added') ? 'success' : ''}`}>
          {error}
        </div>
      )}

      {/* Navigation Component */}
      <Navigation 
        activeView={activeView} 
        onNavigate={navigateToView} 
      />

      {activeView === 'home' && (
        <HomeView 
          sites={sites} 
          onNavigate={navigateToView} 
        />
      )}
      
      {activeView === 'monitor' && (
        <MonitorView
          sites={sites}
          loading={loading}
          showAddForm={showAddForm}
          showEditForm={showEditForm}
          newSite={newSite}
          editingSite={editingSite}
          onRefresh={loadSitesWithHealthStatus}
          onCheckAll={checkAllSites}
          onToggleForm={toggleAddForm}
          onToggleEditForm={toggleEditForm}
          onAddSite={addSite}
          onUpdateNewSite={updateNewSite}
          onUpdateEditingSite={updateEditingSite}
          onSaveSite={saveSite}
          onCheckSite={checkSingleSite}
          onDeleteSite={deleteSite}
          onEditSite={editSite}
          onNavigate={navigateToView}
        />
      )}
      
      {activeView === 'reports' && (
        <UptimeReport onNavigate={navigateToView} />
      )}

      {activeView === 'admin' && (
        <AdminView
          smtpConfig={smtpConfig}
          loading={loading}
          onSaveSmtpConfig={saveSmtpConfig}
          onTestSmtpConfig={testSmtpConfig}
          onNavigate={navigateToView}
        />
      )}
    </div>
  );
}

export default React.memo(App);