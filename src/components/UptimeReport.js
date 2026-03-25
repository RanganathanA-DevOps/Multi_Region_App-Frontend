import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import config from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = `${config.API_BASE_URL}/api`;

const UptimeReport = ({ onNavigate }) => {
  const [uptimeData, setUptimeData] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [uptimeRes, overviewRes, incidentsRes] = await Promise.all([
        axios.get(`${API_BASE}/reports/uptime?period=${period}`),
        axios.get(`${API_BASE}/reports/overview?period=${period}`),
        axios.get(`${API_BASE}/reports/incidents?period=${period}`)
      ]);
      
      setUptimeData(uptimeRes.data || []);
      setOverviewData(overviewRes.data || {});
      setIncidents(incidentsRes.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Failed to load reports. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getUptimeColor = (percentage) => {
    if (percentage >= 99.9) return '#4CAF50';
    if (percentage >= 99) return '#8BC34A';
    if (percentage >= 95) return '#FFC107';
    if (percentage >= 90) return '#FF9800';
    return '#F44336';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      case 'degraded': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // Overview Chart Data
  const statusDistributionChart = overviewData?.statusDistribution ? {
    labels: overviewData.statusDistribution.map(item => item.status.toUpperCase()),
    datasets: [
      {
        data: overviewData.statusDistribution.map(item => item.count),
        backgroundColor: overviewData.statusDistribution.map(item => getStatusColor(item.status)),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      data: [1],
      backgroundColor: ['#9E9E9E'],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const responseTimeChart = uptimeData?.length > 0 ? {
    labels: uptimeData.map(site => site.name),
    datasets: [
      {
        label: 'Average Response Time (ms)',
        data: uptimeData.map(site => site.avg_response_time || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      label: 'Average Response Time (ms)',
      data: [0],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const uptimeChart = uptimeData?.length > 0 ? {
    labels: uptimeData.map(site => site.name),
    datasets: [
      {
        label: 'Uptime Percentage',
        data: uptimeData.map(site => site.uptime_percentage || 0),
        backgroundColor: uptimeData.map(site => getUptimeColor(site.uptime_percentage || 0)),
        borderColor: uptimeData.map(site => getUptimeColor(site.uptime_percentage || 0)),
        borderWidth: 1,
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      label: 'Uptime Percentage',
      data: [0],
      backgroundColor: ['#9E9E9E'],
      borderColor: ['#9E9E9E'],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-container">
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="reports-header">
        <h2>Site Monitoring Reports</h2>
        <div className="period-selector">
          <label>Time Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'uptime' ? 'active' : ''}`}
          onClick={() => setActiveTab('uptime')}
        >
          Uptime Report
        </button>
        <button 
          className={`tab-button ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          Incidents
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Overall Uptime</h3>
              <div className="stat-value" style={{ color: getUptimeColor(overviewData?.overall?.overall_uptime_percentage || 0) }}>
                {overviewData?.overall?.overall_uptime_percentage || 0}%
              </div>
              <div className="stat-label">Availability</div>
            </div>
            <div className="stat-card">
              <h3>Monitored Sites</h3>
              <div className="stat-value">{overviewData?.overall?.total_monitored_sites || 0}</div>
              <div className="stat-label">Active Sites</div>
            </div>
            <div className="stat-card">
              <h3>Total Checks</h3>
              <div className="stat-value">{overviewData?.overall?.total_checks || 0}</div>
              <div className="stat-label">Health Checks</div>
            </div>
            <div className="stat-card">
              <h3>Avg Response Time</h3>
              <div className="stat-value">{Math.round(overviewData?.overall?.avg_response_time || 0)}ms</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Status Distribution</h3>
              <Doughnut 
                data={statusDistributionChart} 
                options={chartOptions}
                height={250}
              />
            </div>
            <div className="chart-container">
              <h3>Response Times by Site</h3>
              <Bar 
                data={responseTimeChart} 
                options={barChartOptions}
                height={250}
              />
            </div>
          </div>

          <div className="slow-sites">
            <h3>Slowest Sites</h3>
            <div className="sites-list">
              {overviewData?.topSlowestSites?.length > 0 ? (
                overviewData.topSlowestSites.map((site, index) => (
                  <div key={index} className="site-item">
                    <span className="site-name">{site.name}</span>
                    <span className="response-time">{Math.round(site.avg_response_time)}ms</span>
                  </div>
                ))
              ) : (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'uptime' && (
        <div className="uptime-tab">
          <div className="uptime-table">
            <table>
              <thead>
                <tr>
                  <th>Site Name</th>
                  <th>URL</th>
                  <th>Uptime %</th>
                  <th>Successful Checks</th>
                  <th>Total Checks</th>
                  <th>Avg Response Time</th>
                  <th>Last Check</th>
                </tr>
              </thead>
              <tbody>
                {uptimeData.length > 0 ? (
                  uptimeData.map(site => (
                    <tr key={site.id}>
                      <td>{site.name}</td>
                      <td className="url-cell">{site.url}</td>
                      <td>
                        <span 
                          className="uptime-badge"
                          style={{ backgroundColor: getUptimeColor(site.uptime_percentage || 0) }}
                        >
                          {site.uptime_percentage || 0}%
                        </span>
                      </td>
                      <td>{site.successful_checks || 0}</td>
                      <td>{site.total_checks || 0}</td>
                      <td>{Math.round(site.avg_response_time || 0)}ms</td>
                      <td>{site.last_check ? new Date(site.last_check).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                      No data available for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="chart-container full-width">
            <h3>Uptime Percentage by Site</h3>
            <Bar 
              data={uptimeChart} 
              options={barChartOptions}
              height={300}
            />
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="incidents-tab">
          <h3>Recent Incidents</h3>
          {incidents.length === 0 ? (
            <div className="no-incidents">No incidents reported in the selected period.</div>
          ) : (
            <div className="incidents-list">
              {incidents.map((incident, index) => (
                <div key={index} className={`incident-item ${incident.status}`}>
                  <div className="incident-header">
                    <span className="site-name">{incident.site_name}</span>
                    <span className={`status-badge ${incident.status}`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="incident-details">
                    <div>Start: {new Date(incident.start_time).toLocaleString()}</div>
                    <div>End: {incident.end_time ? new Date(incident.end_time).toLocaleString() : 'Ongoing'}</div>
                    <div>Duration: {incident.duration_minutes || 0} minutes</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UptimeReport;