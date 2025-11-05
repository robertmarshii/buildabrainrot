# TASK 05: Asset Manager and Loading System

## 🎓 Lessons Learned from Previous Tasks

### From Task 01 (Asset Structure)
- Centralized manifest is single source of truth
- Consistent file paths prevent errors
- **Applied**: Asset manager will rely entirely on manifest

### From Task 02 (Image Assets)
- Images can be large; need lazy loading
- Multiple assets needed simultaneously
- **Applied**: Implement batch loading and caching

### From Task 03 (Audio Assets)
- Audio files are even larger than images
- Preloading audio prevents playback delays
- **Applied**: Smart preloading strategy for audio

### From Task 04 (URL Encoding)
- We know exact assets needed from decoded URL
- Can prioritize loading critical assets first
- **Applied**: Progressive loading (critical → nice-to-have)

### Combined Insights
- **Problem**: 100+ assets (80MB total) can't all load at once
- **Solution**: Load on-demand, cache aggressively, preload smartly
- **Challenge**: Audio must be ready before playback (iOS restrictions)
- **Strategy**: Progressive enhancement (show character → add details → enable audio)

---

## 🎯 Goal
Build a robust asset management system that efficiently loads, caches, and provides access to all image and audio assets. Must support lazy loading, batch loading, preloading, error recovery, and provide loading progress feedback for UI.

## 📋 What's Required for Completion

### 1. AssetManager Class

Core functionality:
- Load and parse manifest.json
- Fetch individual assets by ID
- Batch load multiple assets
- Cache loaded assets (memory + browser cache)
- Preload critical assets
- Track loading progress
- Handle errors and retries
- Provide asset metadata

### 2. Asset Loading Strategies

**Critical Assets** (Load first):
- Character body
- Background
- Primary music track

**Secondary Assets** (Load second):
- Accessories
- Stickers
- Sound effects

**Optional Assets** (Load last):
- Effects/animations
- Voice clips
- UI enhancements

### 3. Caching System

**Memory Cache**:
- In-memory storage of loaded assets
- Quick access for repeated use
- Cleared on page unload

**Browser Cache**:
- HTTP cache headers for static assets
- Service Worker for offline support (future)
- LocalStorage for manifest (reduce requests)

### 4. Progress Tracking

For loading UI:
- Current asset being loaded
- Percentage complete
- Estimated time remaining
- Error count

### 5. Error Handling

- Retry failed loads (3 attempts)
- Fallback to placeholder assets
- Log errors for debugging
- Don't break entire app if one asset fails

## 🛠️ Best Implementation Approach

### Phase 1: Core AssetManager Class

```javascript
// public/assets/js/AssetManager.js

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
  }

  /**
   * Initialize by loading manifest
   */
  async init() {
    try {
      // Check localStorage cache first
      const cachedManifest = localStorage.getItem('manifest-cache');
      const cacheTime = localStorage.getItem('manifest-cache-time');

      if (cachedManifest && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        // Cache for 1 hour
        if (age < 3600000) {
          this.manifest = JSON.parse(cachedManifest);
          console.log('✓ Loaded manifest from cache');
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

      console.log(`✓ Loaded manifest v${this.manifest.version}`);
    } catch (error) {
      console.error('Failed to load manifest:', error);
      throw error;
    }
  }

  /**
   * Find asset metadata by ID
   */
  findAsset(assetId) {
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
      ...(Object.values(this.manifest.audio?.sfx || {}).flat()),
      this.manifest.audio?.voices || []
    ];

    for (const category of categories) {
      const asset = category.find(a => a.id === assetId);
      if (asset) {
        this.cache.metadata.set(assetId, asset);
        return asset;
      }
    }

    return null;
  }

  /**
   * Load an image asset
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
      throw error;
    }
  }

  /**
   * Promise-based image loading
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
   */
  async _loadAudioWithRetry(asset, attempt = 1) {
    try {
      const audio = new Audio(this.baseUrl + asset.file);

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      return audio;
    } catch (error) {
      if (attempt < this.retryCount) {
        console.warn(`Retry ${attempt}/${this.retryCount} for ${asset.id}`);
        await this._sleep(1000 * attempt);
        return this._loadAudioWithRetry(asset, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Batch load multiple assets
   */
  async loadBatch(assetIds, onProgress = null) {
    const total = assetIds.length;
    let loaded = 0;
    const results = [];

    for (const id of assetIds) {
      try {
        const asset = this.findAsset(id);
        let result;

        if (asset.file.endsWith('.mp3')) {
          result = await this.loadAudio(id);
        } else {
          result = await this.loadImage(id);
        }

        results.push({ id, asset: result, success: true });
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
   */
  async preloadBrainrot(brainrotData, onProgress = null) {
    const criticalAssets = [
      brainrotData.character.body,
      brainrotData.scene.background,
      brainrotData.audio.music?.id
    ].filter(Boolean);

    const secondaryAssets = [
      ...(brainrotData.character.accessories?.map(a => a.id) || []),
      ...(brainrotData.scene.stickers?.map(s => s.id) || []),
      ...(brainrotData.audio.sfx?.map(s => s.id) || [])
    ].filter(Boolean);

    console.log('Preloading critical assets...');
    await this.loadBatch(criticalAssets, onProgress);

    console.log('Preloading secondary assets...');
    await this.loadBatch(secondaryAssets, onProgress);

    return {
      critical: criticalAssets.length,
      secondary: secondaryAssets.length,
      total: criticalAssets.length + secondaryAssets.length
    };
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      cached: {
        images: this.cache.images.size,
        audio: this.cache.audio.size
      },
      loading: this.loading.size,
      errors: this.errors.size,
      manifestVersion: this.manifest?.version
    };
  }

  /**
   * Clear cache (for development)
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
   * Utility: Sleep
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global singleton instance
window.assetManager = new AssetManager();
```

### Phase 2: Loading UI Component

```javascript
// public/assets/js/LoadingUI.js

class LoadingUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  show() {
    this.container.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-content">
          <h2>Loading Your Brainrot...</h2>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <p id="loading-status">Initializing...</p>
          <p id="loading-percentage">0%</p>
        </div>
      </div>
    `;
    this.container.style.display = 'flex';
  }

  update(progress) {
    const fill = document.getElementById('progress-fill');
    const status = document.getElementById('loading-status');
    const percentage = document.getElementById('loading-percentage');

    if (fill) {
      fill.style.width = progress.percentage + '%';
    }

    if (status) {
      const asset = assetManager.findAsset(progress.currentAsset);
      status.textContent = `Loading ${asset?.name || progress.currentAsset}...`;
    }

    if (percentage) {
      percentage.textContent = Math.round(progress.percentage) + '%';
    }
  }

  hide() {
    this.container.style.display = 'none';
  }
}
```

### Phase 3: Usage Examples

```javascript
// Example: Initialize and load a brainrot
async function loadBrainrot(brainrotData) {
  const loading = new LoadingUI('loading-container');

  try {
    loading.show();

    // Initialize asset manager
    await assetManager.init();

    // Preload all assets with progress
    await assetManager.preloadBrainrot(brainrotData, (progress) => {
      loading.update(progress);
    });

    loading.hide();

    // Now render the brainrot
    renderBrainrot(brainrotData);
  } catch (error) {
    console.error('Failed to load brainrot:', error);
    showErrorMessage('Failed to load brainrot. Please try again.');
  }
}

// Example: Load single asset
async function loadCharacterBody(bodyId) {
  try {
    const image = await assetManager.loadImage(bodyId);
    // Use the image
    ctx.drawImage(image, x, y);
  } catch (error) {
    console.error('Failed to load character:', error);
    // Use placeholder
    ctx.fillText('?', x, y);
  }
}
```

### Phase 4: HTTP Cache Headers (PHP)

```php
// public/index.php or .htaccess
<?php
// Set cache headers for static assets
if (preg_match('/\.(png|jpg|mp3|json)$/', $_SERVER['REQUEST_URI'])) {
    // Cache for 1 week
    header('Cache-Control: public, max-age=604800, immutable');
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 604800) . ' GMT');
}
?>
```

```apache
# .htaccess
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 week"
  ExpiresByType audio/mpeg "access plus 1 week"
  ExpiresByType application/json "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(png|jpg|jpeg|gif|mp3)$">
    Header set Cache-Control "public, max-age=604800, immutable"
  </FilesMatch>
</IfModule>
```

### Phase 5: Service Worker (Future Enhancement)

```javascript
// public/service-worker.js
const CACHE_NAME = 'brainrot-v1';
const ASSETS_TO_CACHE = [
  '/assets/manifest.json',
  '/assets/js/AssetManager.js',
  // ... critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## ✅ Completion Checks

### Automated Tests

```javascript
// test/test-asset-manager.js

async function testAssetManager() {
  console.log('Testing AssetManager...\n');

  // Test 1: Initialize
  console.log('Test 1: Initialize');
  await assetManager.init();
  console.assert(assetManager.manifest !== null, 'Manifest should load');
  console.log('✓ Test 1 passed\n');

  // Test 2: Find asset
  console.log('Test 2: Find asset');
  const asset = assetManager.findAsset('char-body-shark');
  console.assert(asset !== null, 'Should find shark asset');
  console.assert(asset.id === 'char-body-shark', 'Asset ID matches');
  console.log('✓ Test 2 passed\n');

  // Test 3: Load image
  console.log('Test 3: Load image');
  const image = await assetManager.loadImage('char-body-shark');
  console.assert(image instanceof Image, 'Should return Image object');
  console.assert(image.complete, 'Image should be loaded');
  console.log('✓ Test 3 passed\n');

  // Test 4: Cache works
  console.log('Test 4: Cache works');
  const cachedImage = await assetManager.loadImage('char-body-shark');
  console.assert(cachedImage === image, 'Should return cached image');
  console.log('✓ Test 4 passed\n');

  // Test 5: Load audio
  console.log('Test 5: Load audio');
  const audio = await assetManager.loadAudio('music-skibidi-beat-01');
  console.assert(audio instanceof HTMLAudioElement, 'Should return Audio object');
  console.log('✓ Test 5 passed\n');

  // Test 6: Batch loading
  console.log('Test 6: Batch loading');
  const results = await assetManager.loadBatch([
    'char-body-cat',
    'char-body-banana',
    'bg-toilet'
  ], (progress) => {
    console.log(`  ${progress.percentage.toFixed(0)}% - ${progress.currentAsset}`);
  });
  console.assert(results.length === 3, 'Should load 3 assets');
  console.assert(results.every(r => r.success), 'All should succeed');
  console.log('✓ Test 6 passed\n');

  // Test 7: Error handling
  console.log('Test 7: Error handling');
  try {
    await assetManager.loadImage('invalid-asset-id');
    console.error('✗ Should have thrown error');
  } catch (e) {
    console.log('✓ Test 7 passed - error caught:', e.message, '\n');
  }

  // Test 8: Statistics
  console.log('Test 8: Statistics');
  const stats = assetManager.getStats();
  console.log('Stats:', stats);
  console.assert(stats.cached.images > 0, 'Should have cached images');
  console.log('✓ Test 8 passed\n');

  console.log('✅ All AssetManager tests passed!');
}
```

### Performance Benchmarks

```javascript
// test/benchmark-asset-manager.js

async function benchmarkAssetManager() {
  await assetManager.init();

  // Benchmark 1: Cold load (no cache)
  assetManager.clearCache();
  console.time('cold-load-10-images');
  await assetManager.loadBatch([
    'char-body-shark',
    'char-body-cat',
    // ... 8 more
  ]);
  console.timeEnd('cold-load-10-images');
  // Target: < 2 seconds

  // Benchmark 2: Warm load (cached)
  console.time('warm-load-10-images');
  await assetManager.loadBatch([
    'char-body-shark',
    'char-body-cat',
    // ... 8 more
  ]);
  console.timeEnd('warm-load-10-images');
  // Target: < 10ms

  // Benchmark 3: Full brainrot preload
  const testBrainrot = {
    character: {
      body: 'char-body-shark',
      accessories: [
        { id: 'acc-head-sunglasses' },
        { id: 'acc-feet-sneakers' }
      ]
    },
    scene: {
      background: 'bg-toilet',
      stickers: [
        { id: 'sticker-skull' }
      ]
    },
    audio: {
      music: { id: 'music-skibidi-beat-01' },
      sfx: [
        { id: 'sfx-reaction-vine-boom' }
      ]
    }
  };

  assetManager.clearCache();
  console.time('full-brainrot-preload');
  await assetManager.preloadBrainrot(testBrainrot);
  console.timeEnd('full-brainrot-preload');
  // Target: < 3 seconds
}
```

### Manual Checks

- [ ] AssetManager initializes without errors
- [ ] Manifest loads (check network tab)
- [ ] Images load and display correctly
- [ ] Audio loads and plays correctly
- [ ] Progress callback fires during batch load
- [ ] Failed assets don't crash entire system
- [ ] Cache reduces subsequent load times
- [ ] Loading UI shows accurate progress
- [ ] Stats show correct cache counts

### Browser Compatibility

- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari (iOS audio restrictions)
- [ ] Works on mobile devices
- [ ] Cache persistence across page reloads

## 📊 Success Criteria

Task 05 is complete when:
1. ✅ AssetManager class fully functional
2. ✅ Can load images and audio by ID
3. ✅ Batch loading works with progress callbacks
4. ✅ Caching reduces repeated load times by 90%+
5. ✅ Error handling prevents crashes on missing assets
6. ✅ Retry logic attempts 3 times before failing
7. ✅ LoadingUI component provides user feedback
8. ✅ All automated tests pass
9. ✅ HTTP cache headers configured
10. ✅ Performance benchmarks meet targets

## 🎓 Key Deliverables

- `/public/assets/js/AssetManager.js` (core class)
- `/public/assets/js/LoadingUI.js` (UI component)
- `/test/test-asset-manager.js` (test suite)
- `/test/benchmark-asset-manager.js` (performance tests)
- Updated `.htaccess` with cache headers
- Documentation on usage
- Example integration code

## ⚠️ Common Pitfalls to Avoid

1. **No Retry Logic**: Network hiccups cause permanent failures
2. **Memory Leaks**: Not clearing references to large assets
3. **Race Conditions**: Multiple calls load same asset twice
4. **No Progress Feedback**: Users think app is frozen
5. **Synchronous Loading**: Blocks UI thread
6. **Missing Error Handling**: One failed asset breaks everything
7. **No Cache Invalidation**: Old assets persist after updates
8. **iOS Audio Issues**: Not handling autoplay restrictions

## 🔗 Dependencies for Next Task

Task 06 will need:
- ✅ AssetManager to load character parts
- ✅ Manifest data for browsing available assets
- ✅ Loading system for UI feedback
- ✅ Cache system for performance

## 🚀 Future Enhancements

- Service Worker for offline support
- Predictive preloading (load likely next assets)
- Image lazy loading with Intersection Observer
- WebP/AVIF format support with fallbacks
- Asset CDN integration
- Progressive image loading (blur-up)
- Asset versioning and updates
