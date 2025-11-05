/**
 * LOADING UI COMPONENT
 *
 * Provides visual feedback during asset loading
 * Shows progress bar, percentage, and current asset name
 */

class LoadingUI {
  constructor(containerId = 'loading-container') {
    this.containerId = containerId;
    this.container = null;
    this.visible = false;
  }

  /**
   * Show loading UI
   *
   * @param {Object} options - Display options
   */
  show(options = {}) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }

    this.container = container;

    const title = options.title || 'Loading Your Brainrot...';
    const subtitle = options.subtitle || 'This will only take a moment';

    container.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h2 class="loading-title">${title}</h2>
          <p class="loading-subtitle">${subtitle}</p>

          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>

          <div class="loading-stats">
            <p class="loading-status" id="loading-status">Initializing...</p>
            <p class="loading-percentage" id="loading-percentage">0%</p>
          </div>
        </div>
      </div>
    `;

    container.style.display = 'flex';
    this.visible = true;
  }

  /**
   * Update progress
   *
   * @param {Object} progress - Progress data
   * @param {number} progress.percentage - Completion percentage (0-100)
   * @param {string} progress.currentAsset - Current asset being loaded
   * @param {number} progress.loaded - Number of loaded assets
   * @param {number} progress.total - Total assets to load
   */
  update(progress) {
    if (!this.visible) {
      return;
    }

    const fill = document.getElementById('progress-fill');
    const status = document.getElementById('loading-status');
    const percentage = document.getElementById('loading-percentage');

    if (fill) {
      const percent = Math.min(100, Math.max(0, progress.percentage || 0));
      fill.style.width = percent + '%';
    }

    if (status && progress.currentAsset) {
      // Try to get asset name from manifest
      let assetName = progress.currentAsset;
      if (typeof assetManager !== 'undefined') {
        const asset = assetManager.findAsset(progress.currentAsset);
        if (asset && asset.name) {
          assetName = asset.name;
        }
      }

      // Format loading message
      const phase = progress.phase ? ` (${progress.phase})` : '';
      const count = progress.loaded && progress.total ? ` (${progress.loaded}/${progress.total})` : '';
      status.textContent = `Loading ${assetName}${phase}${count}`;
    }

    if (percentage) {
      const percent = Math.round(progress.percentage || 0);
      percentage.textContent = percent + '%';
    }
  }

  /**
   * Show completion message
   *
   * @param {Object} options - Completion options
   */
  showComplete(options = {}) {
    if (!this.visible) {
      return;
    }

    const message = options.message || 'All assets loaded!';
    const duration = options.duration || 500;

    const status = document.getElementById('loading-status');
    const percentage = document.getElementById('loading-percentage');
    const fill = document.getElementById('progress-fill');

    if (fill) {
      fill.style.width = '100%';
    }

    if (status) {
      status.textContent = message;
    }

    if (percentage) {
      percentage.textContent = '100%';
    }

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Show error message
   *
   * @param {string} message - Error message
   * @param {Object} options - Error display options
   */
  showError(message, options = {}) {
    if (!this.visible) {
      this.show();
    }

    const status = document.getElementById('loading-status');
    const percentage = document.getElementById('loading-percentage');

    if (status) {
      status.textContent = message;
      status.style.color = '#ff4444';
    }

    if (percentage) {
      percentage.textContent = '✗';
      percentage.style.color = '#ff4444';
    }

    // Show retry button if provided
    if (options.onRetry) {
      const retryButton = document.createElement('button');
      retryButton.textContent = 'Retry';
      retryButton.className = 'btn btn-primary';
      retryButton.style.marginTop = '20px';
      retryButton.onclick = () => {
        options.onRetry();
      };

      const loadingContent = document.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.appendChild(retryButton);
      }
    }
  }

  /**
   * Hide loading UI
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.visible = false;
    }
  }

  /**
   * Check if loading UI is visible
   *
   * @returns {boolean}
   */
  isVisible() {
    return this.visible;
  }
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingUI;
}
