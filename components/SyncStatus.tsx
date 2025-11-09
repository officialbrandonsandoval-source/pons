'use client';

import { useEffect, useState } from 'react';
import { getSyncScheduler, SyncStatus as SyncStatusType } from '@/lib/syncScheduler';

export default function SyncStatus() {
  const [status, setStatus] = useState<SyncStatusType | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const scheduler = getSyncScheduler();
    
    // Get initial status
    setStatus(scheduler.getStatus());

    // Subscribe to updates
    const unsubscribe = scheduler.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Start scheduler if not running and integrations are connected
    if (!scheduler.isRunning()) {
      scheduler.start();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  if (!status) return null;

  const handleManualSync = async () => {
    const scheduler = getSyncScheduler();
    await scheduler.syncNow();
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatNextSync = (date: Date | null): string => {
    if (!date) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Soon';
    if (diffMins === 1) return 'In 1 minute';
    if (diffMins < 60) return `In ${diffMins} minutes`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'In 1 hour';
    return `In ${diffHours} hours`;
  };

  const getStatusColor = () => {
    if (status.isRunning) return 'text-blue-400';
    switch (status.lastSyncResult) {
      case 'success': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    if (status.isRunning) return '⟳';
    switch (status.lastSyncResult) {
      case 'success': return '✓';
      case 'partial': return '⚠';
      case 'error': return '✗';
      default: return '○';
    }
  };

  const getStatusText = () => {
    if (status.isRunning) return 'Syncing...';
    switch (status.lastSyncResult) {
      case 'success': return 'Synced';
      case 'partial': return 'Partial sync';
      case 'error': return 'Sync failed';
      default: return 'Not synced';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${status.isRunning ? 'animate-spin' : ''}`}>
            {getStatusIcon()}
          </span>
          <div>
            <div className={`font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <div className="text-xs text-gray-400">
              Last: {formatTimeAgo(status.lastSyncTime)}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Quick Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>Next: {formatNextSync(status.nextSyncTime)}</span>
        <button
          onClick={handleManualSync}
          disabled={status.isRunning}
          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sync Now
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          {/* Success */}
          {status.syncedIntegrations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-400 mb-1">
                ✓ Synced ({status.syncedIntegrations.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {status.syncedIntegrations.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Failed */}
          {status.failedIntegrations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-400 mb-1">
                ✗ Failed ({status.failedIntegrations.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {status.failedIntegrations.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.errorMessage && (
            <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
              {status.errorMessage}
            </div>
          )}

          {/* No integrations */}
          {status.syncedIntegrations.length === 0 && status.failedIntegrations.length === 0 && (
            <div className="text-xs text-gray-500 text-center py-2">
              No integrations connected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
