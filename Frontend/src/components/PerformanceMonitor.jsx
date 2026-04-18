import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';


const PerformanceMonitor = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  // Cache functionality was removed in PostgreSQL migration
  const location = useLocation();

  // Hide on login and signup pages by default
  const shouldHide = ['/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    // Placeholder - caching removed in PostgreSQL migration
    // Cache functionality was part of Firebase implementation
  }, []);

  // Cache clear functions removed in PostgreSQL migration
  const clearAllCache = () => {
    // Placeholder - caching removed in PostgreSQL migration
  };

  const clearStudentsCache = () => {
    // Placeholder - caching removed in PostgreSQL migration
  };

  const clearAdminsCache = () => {
    // Placeholder - caching removed in PostgreSQL migration
  };

  const clearReceiptsCache = () => {
    // Placeholder - caching removed in PostgreSQL migration
  };

  // Don't render on login/signup pages
  if (shouldHide) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: isExpanded ? '15px' : '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      minWidth: isExpanded ? '200px' : 'auto',
      transition: 'all 0.3s ease'
    }}>
      {isExpanded ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>Performance Monitor</h4>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Cache:</strong> Disabled (PostgreSQL migration)
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Cache Controls:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
              <button 
                onClick={clearStudentsCache}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Clear Students Cache
              </button>
              <button 
                onClick={clearAdminsCache}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Clear Admins Cache
              </button>
              <button 
                onClick={clearReceiptsCache}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Clear Receipts Cache
              </button>
              <button 
                onClick={clearAllCache}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Clear All Cache
              </button>
            </div>
          </div>

          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            <div>Cache helps improve performance by storing frequently accessed data.</div>
            <div>Clear cache if you experience stale data issues.</div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px' }}>📊 Off</span>
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ⚙️
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
