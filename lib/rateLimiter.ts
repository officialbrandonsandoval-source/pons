/**
 * Rate Limiter for API calls
 * Tracks and enforces rate limits to prevent exceeding API quotas
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  identifier: string; // Unique identifier for this rate limit
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: Date;
  isLimited: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Clean up expired records every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if a request is allowed under the rate limit
   */
  async checkLimit(config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const record = this.records.get(config.identifier);

    // No existing record or expired - allow and create new
    if (!record || now >= record.resetTime) {
      this.records.set(config.identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if under limit
    if (record.count < config.maxRequests) {
      record.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(config: RateLimitConfig): RateLimitStatus {
    const now = Date.now();
    const record = this.records.get(config.identifier);

    if (!record || now >= record.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: new Date(now + config.windowMs),
        isLimited: false,
      };
    }

    const remaining = Math.max(0, config.maxRequests - record.count);

    return {
      remaining,
      resetTime: new Date(record.resetTime),
      isLimited: remaining === 0,
    };
  }

  /**
   * Wait until rate limit resets (for retries)
   */
  async waitForReset(config: RateLimitConfig): Promise<void> {
    const status = this.getStatus(config);
    
    if (!status.isLimited) {
      return;
    }

    const waitTime = status.resetTime.getTime() - Date.now();
    
    if (waitTime > 0) {
      console.log(`Rate limited for ${config.identifier}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.records.delete(identifier);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.records.clear();
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.records.forEach((record, key) => {
      if (now >= record.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.records.delete(key));
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.records.clear();
  }
}

// Export singleton instance getter
export const getRateLimiter = () => RateLimiter.getInstance();

// Common rate limit configurations for popular APIs
export const RATE_LIMITS = {
  // Twitter API v2 (per app, per 15 minutes)
  TWITTER_READ: {
    maxRequests: 450,
    windowMs: 15 * 60 * 1000,
  },
  TWITTER_WRITE: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000,
  },

  // Instagram Graph API (per user, per hour)
  INSTAGRAM: {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000,
  },

  // LinkedIn API (per member, per day)
  LINKEDIN: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000,
  },

  // Facebook Graph API (per app, per hour)
  FACEBOOK: {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000,
  },

  // Plaid API (per item, per day)
  PLAID: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000,
  },

  // OpenAI API (conservative default)
  OPENAI: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },

  // Generic conservative default
  DEFAULT: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
};

/**
 * Decorator function to add rate limiting to async functions
 */
export function withRateLimit(config: RateLimitConfig) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const limiter = getRateLimiter();
      const allowed = await limiter.checkLimit(config);

      if (!allowed) {
        const status = limiter.getStatus(config);
        throw new Error(
          `Rate limit exceeded for ${config.identifier}. Resets at ${status.resetTime.toLocaleTimeString()}`
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
