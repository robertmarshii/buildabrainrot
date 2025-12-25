/**
 * ASSET MANAGER
 *
 * Centralized asset loading and caching system for Build a Brainrot
 * Handles images, audio, and metadata with smart caching and retry logic
 */

class AssetManager {
  constructor() {
    this.manifest = null;
    this.cache = {
      images: new Map(),
      audio: new Map(),
      metadata: new Map()
    };
    this.loading = new Map(); // Track in-progress loads
    this.errors = new Map();  // Track failed loads
    this.retryCount = 3;
    this.baseUrl = '/assets/';
    this.initialized = false;
  }

  /**
   * Initialize by loading manifest
   *
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Check localStorage cache first
      const cachedManifest = localStorage.getItem('manifest-cache');
      const cacheTime = localStorage.getItem('manifest-cache-time');

      if (cachedManifest && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        // Cache for 1 hour
        if (age < 3600000) {
          this.manifest = JSON.parse(cachedManifest);
          this.initialized = true;
          console.log('✓ Loaded manifest from cache (v' + this.manifest.version + ')');
          return;
        }
      }

      // Fetch fresh manifest
      const response = await fetch(this.baseUrl + 'manifest.json');
      if (!response.ok) {
        throw new Error(`Manifest fetch failed: ${response.status}`);
      }

      this.manifest = await response.json();

      // Cache in localStorage
      localStorage.setItem('manifest-cache', JSON.stringify(this.manifest));
      localStorage.setItem('manifest-cache-time', Date.now().toString());

      this.initialized = true;
      console.log(`✓ Loaded manifest v${this.manifest.version}`);
    } catch (error) {
      console.error('Failed to load manifest:', error);
      throw error;
    }
  }

  /**
   * Find asset metadata by ID
   *
   * @param {string} assetId - Asset ID to find
   * @returns {Object|null} Asset metadata or null
   */
  findAsset(assetId) {
    if (!this.manifest) {
      console.warn('Manifest not loaded yet');
      return null;
    }

    // Check cache first
    if (this.cache.metadata.has(assetId)) {
      return this.cache.metadata.get(assetId);
    }

    // Search through manifest
    const categories = [
      this.manifest.images?.characters?.bodies || [],
      this.manifest.images?.characters?.accessories || [],
      this.manifest.images?.characters?.faces || [],
      this.manifest.images?.backgrounds || [],
      this.manifest.images?.stickers || [],
      this.manifest.audio?.music || [],
      ...(this.manifest.audio?.sfx ? Object.values(this.manifest.audio.sfx).flat() : []),
      this.manifest.audio?.voices || []
    ];

    for (const category of categories) {
      if (!Array.isArray(category)) continue;

      const asset = category.find(a => a && a.id === assetId);
      if (asset) {
        this.cache.metadata.set(assetId, asset);
        return asset;
      }
    }

    // Debug: log what we're searching for
    console.warn(`Asset not found: ${assetId}. Searched ${categories.length} categories.`);

    return null;
  }

  /**
   * Load an image asset
   *
   * @param {string} assetId - Asset ID to load
   * @returns {Promise<Image>} Loaded image
   */
  async loadImage(assetId) {
    // Check cache first
    if (this.cache.images.has(assetId)) {
      return this.cache.images.get(assetId);
    }

    // Check if already loading
    if (this.loading.has(assetId)) {
      return this.loading.get(assetId);
    }

    // Get asset metadata
    const asset = this.findAsset(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    // Start loading
    const loadPromise = this._loadImageWithRetry(asset);
    this.loading.set(assetId, loadPromise);

    try {
      const image = await loadPromise;
      this.cache.images.set(assetId, image);
      this.loading.delete(assetId);
      return image;
    } catch (error) {
      this.loading.delete(assetId);
      this.errors.set(assetId, error);
      throw error;
    }
  }

  /**
   * Load image with retry logic
   *
   * @private
   * @param {Object} asset - Asset metadata
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Image>}
   */
  async _loadImageWithRetry(asset, attempt = 1) {
    try {
      const image = await this._loadImagePromise(this.baseUrl + asset.file);
      return image;
    } catch (error) {
      if (attempt < this.retryCount) {
        console.warn(`Retry ${attempt}/${this.retryCount} for ${asset.id}`);
        await this._sleep(1000 * attempt); // Exponential backoff
        return this._loadImageWithRetry(asset, attempt + 1);
      }
      throw new Error(`Failed to load ${asset.id} after ${this.retryCount} attempts`);
    }
  }

  /**
   * Promise-based image loading
   *
   * @private
   * @param {string} src - Image source URL
   * @returns {Promise<Image>}
   */
  _loadImagePromise(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });
  }

  /**
   * Load an audio asset
   *
   * @param {string} assetId - Asset ID to load
   * @returns {Promise<HTMLAudioElement>} Loaded audio
   */
  async loadAudio(assetId) {
    // Check cache first
    if (this.cache.audio.has(assetId)) {
      return this.cache.audio.get(assetId);
    }

    // Check if already loading
    if (this.loading.has(assetId)) {
      return this.loading.get(assetId);
    }

    // Get asset metadata
    const asset = this.findAsset(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    // Start loading
    const loadPromise = this._loadAudioWithRetry(asset);
    this.loading.set(assetId, loadPromise);

    try {
      const audio = await loadPromise;
      this.cache.audio.set(assetId, audio);
      this.loading.delete(assetId);
      return audio;
    } catch (error) {
      this.loading.delete(assetId);
      this.errors.set(assetId, error);
      throw error;
    }
  }

  /**
   * Load audio with retry logic
   *
   * @private
   * @param {Object} asset - Asset metadata
   * @param {number} attempt - Current attempt number
   * @returns {Promise<HTMLAudioElement>}
   */
  async _loadAudioWithRetry(asset, attempt = 1) {
    try {
      const audio = new Audio(this.baseUrl + asset.file);

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 5000); // 5 second timeout (reduced from 10)

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });

        // Also resolve on 'canplay' event (less strict than canplaythrough)
        audio.addEventListener('canplay', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          // Log actual error for debugging
          console.warn(`Audio load error for ${asset.id}:`, e);
          reject(new Error('Audio load error'));
        }, { once: true });

        audio.load();
      });

      return audio;
    } catch (error) {
      if (attempt < 2) { // Reduced retries from 3 to 2
        console.warn(`Retry ${attempt}/2 for ${asset.id}`);
        await this._sleep(500); // Faster retry
        return this._loadAudioWithRetry(asset, attempt + 1);
      }
      // Return a silent audio element instead of throwing
      console.warn(`Audio ${asset.id} failed to load, using silent placeholder`);
      const silentAudio = new Audio();
      silentAudio._isSilent = true; // Mark as silent for debugging
      return silentAudio;
    }
  }

  /**
   * Batch load multiple assets
   *
   * @param {string[]} assetIds - Array of asset IDs to load
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Array of load results
   */
  async loadBatch(assetIds, onProgress = null) {
    const total = assetIds.length;
    let loaded = 0;
    const results = [];

    for (const id of assetIds) {
      try {
        const asset = this.findAsset(id);
        if (!asset) {
          throw new Error(`Asset not found: ${id}`);
        }

        let result;

        // Determine type by file extension
        if (asset.file.match(/\.(mp3|ogg|wav)$/)) {
          result = await this.loadAudio(id);
        } else if (asset.file.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
          result = await this.loadImage(id);
        } else {
          throw new Error(`Unknown asset type: ${asset.file}`);
        }

        results.push({ id, asset: result, metadata: asset, success: true });
      } catch (error) {
        console.error(`Failed to load ${id}:`, error);
        results.push({ id, error, success: false });
      }

      loaded++;
      if (onProgress) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100,
          currentAsset: id
        });
      }
    }

    return results;
  }

  /**
   * Preload critical assets for a brainrot
   *
   * @param {Object} brainrotData - Brainrot data to preload assets for
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Loading statistics
   */
  async preloadBrainrot(brainrotData, onProgress = null) {
    // Critical assets (load first)
    const criticalAssets = [
      brainrotData.character?.body,
      brainrotData.scene?.background,
      brainrotData.audio?.music?.id
    ].filter(Boolean);

    // Secondary assets (load second)
    const secondaryAssets = [
      ...(brainrotData.character?.accessories?.map(a => a.id) || []),
      ...(brainrotData.scene?.stickers?.map(s => s.id) || []),
      ...(brainrotData.audio?.sfx?.map(s => s.id) || []),
      brainrotData.audio?.voice?.id
    ].filter(Boolean);

    const totalAssets = criticalAssets.length + secondaryAssets.length;
    let loadedAssets = 0;

    // Progress wrapper to account for both phases
    const progressWrapper = (progress) => {
      const overallProgress = {
        loaded: loadedAssets + progress.loaded,
        total: totalAssets,
        percentage: ((loadedAssets + progress.loaded) / totalAssets) * 100,
        currentAsset: progress.currentAsset,
        phase: loadedAssets < criticalAssets.length ? 'critical' : 'secondary'
      };

      if (onProgress) {
        onProgress(overallProgress);
      }
    };

    console.log('Preloading critical assets...');
    const criticalResults = await this.loadBatch(criticalAssets, progressWrapper);
    loadedAssets = criticalAssets.length;

    console.log('Preloading secondary assets...');
    const secondaryResults = await this.loadBatch(secondaryAssets, progressWrapper);

    const criticalSuccesses = criticalResults.filter(r => r.success).length;
    const secondarySuccesses = secondaryResults.filter(r => r.success).length;

    return {
      critical: {
        total: criticalAssets.length,
        loaded: criticalSuccesses,
        failed: criticalAssets.length - criticalSuccesses
      },
      secondary: {
        total: secondaryAssets.length,
        loaded: secondarySuccesses,
        failed: secondaryAssets.length - secondarySuccesses
      },
      overall: {
        total: totalAssets,
        loaded: criticalSuccesses + secondarySuccesses,
        failed: (criticalAssets.length - criticalSuccesses) + (secondaryAssets.length - secondarySuccesses)
      }
    };
  }

  /**
   * Get loading statistics
   *
   * @returns {Object} Current statistics
   */
  getStats() {
    return {
      cached: {
        images: this.cache.images.size,
        audio: this.cache.audio.size,
        metadata: this.cache.metadata.size
      },
      loading: this.loading.size,
      errors: this.errors.size,
      manifestVersion: this.manifest?.version,
      initialized: this.initialized
    };
  }

  /**
   * Get all available assets by category
   *
   * @param {string} category - Category name (e.g., 'character-bodies', 'backgrounds')
   * @returns {Array} Array of assets in that category
   */
  getAssetsByCategory(category) {
    if (!this.manifest) {
      return [];
    }

    const categoryMap = {
      'character-bodies': this.manifest.images?.characters?.bodies || [],
      'character-accessories': this.manifest.images?.characters?.accessories || [],
      'backgrounds': this.manifest.images?.backgrounds || [],
      'stickers': this.manifest.images?.stickers || [],
      'music': this.manifest.audio?.music || [],
      'sfx': this.manifest.audio?.sfx ? Object.values(this.manifest.audio.sfx).flat() : [],
      'voices': this.manifest.audio?.voices || []
    };

    return categoryMap[category] || [];
  }

  /**
   * Clear cache (for development/debugging)
   */
  clearCache() {
    this.cache.images.clear();
    this.cache.audio.clear();
    this.cache.metadata.clear();
    localStorage.removeItem('manifest-cache');
    localStorage.removeItem('manifest-cache-time');
    console.log('✓ Cache cleared');
  }

  /**
   * Clear specific asset from cache
   *
   * @param {string} assetId - Asset ID to clear
   */
  clearAsset(assetId) {
    this.cache.images.delete(assetId);
    this.cache.audio.delete(assetId);
    this.cache.metadata.delete(assetId);
    this.errors.delete(assetId);
  }

  /**
   * Get error details
   *
   * @returns {Array} Array of errors
   */
  getErrors() {
    return Array.from(this.errors.entries()).map(([id, error]) => ({
      assetId: id,
      message: error.message
    }));
  }

  /**
   * Utility: Sleep
   *
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global singleton instance
if (typeof window !== 'undefined') {
  window.assetManager = new AssetManager();
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetManager;
}
