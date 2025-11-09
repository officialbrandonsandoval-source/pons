/**
 * Background Sync Scheduler
 * Automatically syncs all connected integrations on a schedule
 */

import { IntegrationManager } from './integrations/manager';
import { InsightsEngine } from '@/core/agents/insights';

export interface SyncStatus {
  isRunning: boolean;
  lastSyncTime: Date | null;
  nextSyncTime: Date | null;
  lastSyncResult: 'success' | 'error' | 'partial' | null;
  errorMessage?: string;
  syncedIntegrations: string[];
  failedIntegrations: string[];
}

export interface SyncConfig {
  intervalMinutes: number;
  retryAttempts: number;
  retryDelayMs: number;
  enableNotifications: boolean;
}

const DEFAULT_CONFIG: SyncConfig = {
  intervalMinutes: 60, // Sync every hour
  retryAttempts: 3,
  retryDelayMs: 5000, // 5 seconds between retries
  enableNotifications: true,
};

class SyncScheduler {
  private static instance: SyncScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private config: SyncConfig;
  private status: SyncStatus;
  private listeners: Array<(status: SyncStatus) => void> = [];

  private constructor() {
    this.config = this.loadConfig();
    this.status = {
      isRunning: false,
      lastSyncTime: this.loadLastSyncTime(),
      nextSyncTime: null,
      lastSyncResult: null,
      syncedIntegrations: [],
      failedIntegrations: [],
    };
  }

  static getInstance(): SyncScheduler {
    if (!SyncScheduler.instance) {
      SyncScheduler.instance = new SyncScheduler();
    }
    return SyncScheduler.instance;
  }

  /**
   * Start automatic background sync
   */
  start(): void {
    if (this.intervalId) {
      console.log('Sync scheduler already running');
      return;
    }

    console.log(`Starting sync scheduler (every ${this.config.intervalMinutes} minutes)`);
    
    // Run initial sync
    this.syncNow();

    // Schedule recurring syncs
    this.intervalId = setInterval(() => {
      this.syncNow();
    }, this.config.intervalMinutes * 60 * 1000);

    this.updateNextSyncTime();
  }

  /**
   * Stop automatic background sync
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.status.nextSyncTime = null;
      this.notifyListeners();
      console.log('Sync scheduler stopped');
    }
  }

  /**
   * Manually trigger sync now
   */
  async syncNow(): Promise<void> {
    if (this.status.isRunning) {
      console.log('Sync already in progress');
      return;
    }

    this.status.isRunning = true;
    this.status.syncedIntegrations = [];
    this.status.failedIntegrations = [];
    this.notifyListeners();

    try {
      const manager = IntegrationManager.getInstance();
      const connectedIntegrations = manager.getConnectedIntegrations();

      if (connectedIntegrations.length === 0) {
        console.log('No integrations connected, skipping sync');
        this.status.lastSyncResult = 'success';
        this.finishSync();
        return;
      }

      console.log(`Syncing ${connectedIntegrations.length} integrations...`);

      // Sync each integration with retry logic
      const syncPromises = connectedIntegrations.map(config =>
        this.syncIntegrationWithRetry(config.type)
      );

      const results = await Promise.allSettled(syncPromises);

      // Process results
      results.forEach((result, index) => {
        const integrationType = connectedIntegrations[index].type;
        if (result.status === 'fulfilled' && result.value) {
          this.status.syncedIntegrations.push(integrationType);
        } else {
          this.status.failedIntegrations.push(integrationType);
        }
      });

      // Refresh insights after sync
      const insights = InsightsEngine.getInstance();
      await insights.getInsights(true); // Force refresh

      // Determine overall result
      if (this.status.failedIntegrations.length === 0) {
        this.status.lastSyncResult = 'success';
      } else if (this.status.syncedIntegrations.length > 0) {
        this.status.lastSyncResult = 'partial';
      } else {
        this.status.lastSyncResult = 'error';
        this.status.errorMessage = 'All integrations failed to sync';
      }

      console.log('Sync completed:', {
        success: this.status.syncedIntegrations.length,
        failed: this.status.failedIntegrations.length,
      });

      // Show notification if enabled
      if (this.config.enableNotifications) {
        this.showNotification();
      }

    } catch (error) {
      console.error('Sync error:', error);
      this.status.lastSyncResult = 'error';
      this.status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.finishSync();
    }
  }

  /**
   * Sync a single integration with retry logic
   */
  private async syncIntegrationWithRetry(
    integrationType: string,
    attempt: number = 1
  ): Promise<boolean> {
    try {
      const manager = IntegrationManager.getInstance();
      const adapter = manager.getAdapter(integrationType);
      
      if (!adapter) {
        throw new Error(`Adapter not found for ${integrationType}`);
      }

      await adapter.sync();
      console.log(`✓ Synced ${integrationType}`);
      return true;

    } catch (error) {
      console.error(`✗ Failed to sync ${integrationType} (attempt ${attempt}):`, error);

      // Retry if attempts remaining
      if (attempt < this.config.retryAttempts) {
        await this.delay(this.config.retryDelayMs * attempt); // Exponential backoff
        return this.syncIntegrationWithRetry(integrationType, attempt + 1);
      }

      return false;
    }
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    // Restart scheduler if running with new interval
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current config
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Get current status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status updates
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  // Private helper methods

  private finishSync(): void {
    this.status.isRunning = false;
    this.status.lastSyncTime = new Date();
    this.saveLastSyncTime(this.status.lastSyncTime);
    this.updateNextSyncTime();
    this.notifyListeners();
  }

  private updateNextSyncTime(): void {
    if (this.intervalId) {
      const next = new Date();
      next.setMinutes(next.getMinutes() + this.config.intervalMinutes);
      this.status.nextSyncTime = next;
    } else {
      this.status.nextSyncTime = null;
    }
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync status listener:', error);
      }
    });
  }

  private showNotification(): void {
    if (typeof window === 'undefined') return;

    const { lastSyncResult, syncedIntegrations, failedIntegrations } = this.status;

    let title = '';
    let message = '';

    switch (lastSyncResult) {
      case 'success':
        title = '✓ Sync Complete';
        message = `Updated ${syncedIntegrations.length} integration(s)`;
        break;
      case 'partial':
        title = '⚠ Partial Sync';
        message = `${syncedIntegrations.length} succeeded, ${failedIntegrations.length} failed`;
        break;
      case 'error':
        title = '✗ Sync Failed';
        message = this.status.errorMessage || 'Failed to sync integrations';
        break;
    }

    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sync-notification', {
      detail: { title, message, type: lastSyncResult }
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // LocalStorage persistence

  private loadConfig(): SyncConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;

    try {
      const saved = localStorage.getItem('pons_sync_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading sync config:', error);
    }
    return DEFAULT_CONFIG;
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('pons_sync_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving sync config:', error);
    }
  }

  private loadLastSyncTime(): Date | null {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem('pons_last_sync_time');
      if (saved) {
        return new Date(saved);
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
    return null;
  }

  private saveLastSyncTime(time: Date): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('pons_last_sync_time', time.toISOString());
    } catch (error) {
      console.error('Error saving last sync time:', error);
    }
  }
}

// Export singleton instance getter
export const getSyncScheduler = () => SyncScheduler.getInstance();
