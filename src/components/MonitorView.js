import React from 'react';
import SiteCard from './SiteCard';
import AddSiteForm from './AddSiteForm';
import EditSiteForm from './EditSiteForm';

const MonitorView = React.memo(({ 
  sites = [], 
  loading, 
  showAddForm, 
  showEditForm,
  newSite,
  editingSite,
  onRefresh,
  onCheckAll,
  onToggleForm,
  onToggleEditForm,
  onAddSite,
  onUpdateNewSite,
  onUpdateEditingSite,
  onSaveSite,
  onCheckSite,
  onDeleteSite,
  onEditSite,
  onNavigate
}) => {
  console.log('MonitorView rendered');

  // Ensure sites is always an array
  const safeSites = Array.isArray(sites) ? sites : [];

  const hasHealthData = (site) => {
    return site && site.last_status && site.last_checked;
  };

  return (
    <>
      <div className="controls">
        <div className="action-controls">
          <button 
            className="btn btn-primary" 
            onClick={onRefresh}
            disabled={loading}
          >
            🔄 Refresh All
          </button>
          <button 
            className="btn btn-success" 
            onClick={onCheckAll}
            disabled={loading}
          >
            ✅ Check All Sites Now
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onToggleForm}
            disabled={loading}
          >
            {showAddForm ? '❌ Cancel' : '➕ Add New Site'}
          </button>
          <div className="auto-refresh-indicator">
            <span className="indicator-dot"></span>
            Auto-refresh enabled
          </div>
        </div>
      </div>

      {showAddForm && (
        <AddSiteForm 
          newSite={newSite}
          loading={loading}
          onAddSite={onAddSite}
          onUpdateNewSite={onUpdateNewSite}
        />
      )}

      {showEditForm && editingSite && (
        <EditSiteForm 
          site={editingSite}
          loading={loading}
          onSaveSite={onSaveSite}
          onUpdateSite={onUpdateEditingSite}
          onCancel={onToggleEditForm}
        />
      )}

      {loading && (
        <div className="loading">Loading...</div>
      )}

      <div className="site-grid">
        {safeSites.map(site => (
          <SiteCard
            key={site.id}
            site={site}
            loading={loading}
            hasHealthData={hasHealthData(site)}
            onCheckSite={onCheckSite}
            onDeleteSite={onDeleteSite}
            onEditSite={onEditSite}
          />
        ))}
      </div>

      {safeSites.length === 0 && !loading && (
        <div className="no-sites">
          <h3>No sites configured</h3>
          <p>Add your first site to start monitoring</p>
          <button 
            className="btn btn-primary" 
            onClick={onToggleForm}
          >
            Add Your First Site
          </button>
        </div>
      )}
    </>
  );
});

export default MonitorView;