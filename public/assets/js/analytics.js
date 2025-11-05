/**
 * ANALYTICS
 *
 * Privacy-friendly analytics tracking
 * No personal data collection, COPPA compliant
 */

class Analytics {
  /**
   * Track an event
   *
   * @param {string} category - Event category
   * @param {string} action - Event action
   * @param {string|null} label - Event label (optional)
   */
  static trackEvent(category, action, label = null) {
    // Don't track if user has Do Not Track enabled
    if (navigator.doNotTrack === '1') {
      return;
    }

    const eventData = {
      category,
      action,
      label,
      timestamp: Date.now(),
      page: window.location.pathname,
      referrer: document.referrer || 'direct'
    };

    console.log('[Analytics]', eventData);

    // Send to Google Analytics if available (gtag)
    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        non_interaction: false
      });
    }

    // Send to custom analytics endpoint (future)
    this._sendToCustomEndpoint(eventData);
  }

  /**
   * Track page view
   *
   * @param {string} page - Page identifier
   */
  static trackPageView(page) {
    this.trackEvent('pageview', 'view', page);

    // Google Analytics page view
    if (typeof gtag === 'function') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page
      });
    }
  }

  /**
   * Track creation step completion
   *
   * @param {string} step - Step name (character, scene, audio)
   */
  static trackCreationStep(step) {
    this.trackEvent('creation', 'step_completed', step);
  }

  /**
   * Track share action
   *
   * @param {string} method - Share method (copy_link, qr_code, etc.)
   */
  static trackShare(method) {
    this.trackEvent('sharing', 'share', method);
  }

  /**
   * Track download
   */
  static trackDownload() {
    this.trackEvent('content', 'download', 'image');
  }

  /**
   * Track remix action
   */
  static trackRemix() {
    this.trackEvent('creation', 'remix', 'started');
  }

  /**
   * Track error occurrence
   *
   * @param {string} error - Error message or type
   */
  static trackError(error) {
    this.trackEvent('error', 'occurred', error);

    // Also log to console
    console.error('[Analytics] Error tracked:', error);
  }

  /**
   * Track asset loading
   *
   * @param {string} assetType - Asset type (image, audio, etc.)
   * @param {number} loadTime - Load time in ms
   */
  static trackAssetLoad(assetType, loadTime) {
    this.trackEvent('performance', 'asset_loaded', `${assetType}_${loadTime}ms`);
  }

  /**
   * Track builder interaction
   *
   * @param {string} action - Interaction type
   */
  static trackBuilderInteraction(action) {
    this.trackEvent('builder', 'interaction', action);
  }

  /**
   * Send to custom analytics endpoint
   *
   * @private
   * @param {Object} data - Event data
   */
  static _sendToCustomEndpoint(data) {
    // Only send in production
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return;
    }

    // Send to custom endpoint (implement when backend ready)
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(error => {
      // Fail silently - analytics should never break the app
      console.debug('Analytics endpoint failed:', error);
    });
  }

  /**
   * Get session ID (anonymous)
   *
   * @returns {string} Anonymous session ID
   */
  static getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');

    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    return sessionId;
  }

  /**
   * Initialize analytics on page load
   */
  static init() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackEvent('performance', 'page_load', `${Math.round(loadTime)}ms`);
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.message || 'Unknown error');
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason || 'Unhandled promise rejection');
    });

    console.log('[Analytics] Initialized - Session:', this.getSessionId());
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  Analytics.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
