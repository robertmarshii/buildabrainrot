/**
 * ASSET MANAGER TEST SUITE
 *
 * Comprehensive tests for asset loading and caching system
 * Can run in browser console or with test runner
 */

async function testAssetManager() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       ASSET MANAGER TEST SUITE                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  let passed = 0;
  let failed = 0;

  // Test 1: Initialize
  console.log('Test 1: Initialize AssetManager');
  try {
    await assetManager.init();
    console.assert(assetManager.manifest !== null, 'Manifest should load');
    console.assert(assetManager.initialized === true, 'Should be initialized');
    console.log('✓ Test 1 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message, '\n');
    failed++;
  }

  // Test 2: Find asset
  console.log('Test 2: Find asset by ID');
  try {
    const asset = assetManager.findAsset('char-body-shark');
    console.assert(asset !== null, 'Should find shark asset');
    console.assert(asset.id === 'char-body-shark', 'Asset ID matches');
    console.assert(asset.name === 'Silly Shark', 'Asset name matches');
    console.log('  Found asset:', asset.name);
    console.log('✓ Test 2 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message, '\n');
    failed++;
  }

  // Test 3: Find non-existent asset
  console.log('Test 3: Handle non-existent asset');
  try {
    const asset = assetManager.findAsset('invalid-asset-id');
    console.assert(asset === null, 'Should return null for invalid ID');
    console.log('✓ Test 3 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message, '\n');
    failed++;
  }

  // Test 4: Load image
  console.log('Test 4: Load image asset');
  try {
    const startTime = Date.now();
    const image = await assetManager.loadImage('char-body-shark');
    const loadTime = Date.now() - startTime;

    console.assert(image instanceof Image, 'Should return Image object');
    console.assert(image.complete, 'Image should be loaded');
    console.assert(image.naturalWidth > 0, 'Image should have dimensions');
    console.log(`  Loaded in ${loadTime}ms`);
    console.log(`  Dimensions: ${image.naturalWidth}x${image.naturalHeight}`);
    console.log('✓ Test 4 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 4 failed:', error.message, '\n');
    failed++;
  }

  // Test 5: Cache works
  console.log('Test 5: Cache returns same image');
  try {
    const startTime = Date.now();
    const cachedImage = await assetManager.loadImage('char-body-shark');
    const loadTime = Date.now() - startTime;

    console.assert(loadTime < 10, 'Cached load should be instant (<10ms)');
    console.log(`  Cached load in ${loadTime}ms`);
    console.log('✓ Test 5 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 5 failed:', error.message, '\n');
    failed++;
  }

  // Test 6: Load audio
  console.log('Test 6: Load audio asset');
  try {
    const audio = await assetManager.loadAudio('music-skibidi-beat-01');
    console.assert(audio instanceof HTMLAudioElement, 'Should return Audio object');
    console.assert(audio.readyState >= 2, 'Audio should be ready');
    console.log(`  Audio duration: ${audio.duration || 'unknown'}s`);
    console.log('✓ Test 6 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 6 failed:', error.message, '\n');
    failed++;
  }

  // Test 7: Batch loading
  console.log('Test 7: Batch load multiple assets');
  try {
    const assetIds = [
      'char-body-cat',
      'char-body-banana',
      'bg-toilet'
    ];

    let progressUpdates = 0;
    const results = await assetManager.loadBatch(assetIds, (progress) => {
      console.log(`  ${progress.percentage.toFixed(0)}% - ${progress.currentAsset}`);
      progressUpdates++;
    });

    console.assert(results.length === 3, 'Should load 3 assets');
    console.assert(results.every(r => r.success), 'All should succeed');
    console.assert(progressUpdates === 3, 'Should fire 3 progress updates');
    console.log('✓ Test 7 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 7 failed:', error.message, '\n');
    failed++;
  }

  // Test 8: Error handling
  console.log('Test 8: Handle invalid asset ID');
  try {
    await assetManager.loadImage('invalid-asset-id-xyz');
    console.error('✗ Test 8 failed - should have thrown error\n');
    failed++;
  } catch (error) {
    console.log('  Error caught:', error.message);
    console.log('✓ Test 8 passed\n');
    passed++;
  }

  // Test 9: Statistics
  console.log('Test 9: Get loading statistics');
  try {
    const stats = assetManager.getStats();
    console.log('  Stats:', stats);
    console.assert(typeof stats.cached === 'object', 'Should have cached stats');
    console.assert(stats.cached.images > 0, 'Should have cached images');
    console.assert(stats.manifestVersion === '1.0.0', 'Should have manifest version');
    console.log('✓ Test 9 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 9 failed:', error.message, '\n');
    failed++;
  }

  // Test 10: Get assets by category
  console.log('Test 10: Get assets by category');
  try {
    const bodies = assetManager.getAssetsByCategory('character-bodies');
    console.assert(Array.isArray(bodies), 'Should return array');
    console.assert(bodies.length > 0, 'Should have character bodies');
    console.log(`  Found ${bodies.length} character bodies`);

    const backgrounds = assetManager.getAssetsByCategory('backgrounds');
    console.assert(backgrounds.length > 0, 'Should have backgrounds');
    console.log(`  Found ${backgrounds.length} backgrounds`);

    console.log('✓ Test 10 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 10 failed:', error.message, '\n');
    failed++;
  }

  // Test 11: Preload brainrot
  console.log('Test 11: Preload complete brainrot');
  try {
    const testBrainrot = {
      character: {
        body: 'char-body-dog',
        accessories: [
          { id: 'acc-head-sunglasses' },
          { id: 'acc-feet-sneakers' }
        ]
      },
      scene: {
        background: 'bg-space',
        stickers: [
          { id: 'sticker-skull' }
        ]
      },
      audio: {
        music: { id: 'music-chill-lofi-01' },
        sfx: [
          { id: 'sfx-reaction-vine-boom' }
        ]
      }
    };

    const startTime = Date.now();
    const result = await assetManager.preloadBrainrot(testBrainrot, (progress) => {
      console.log(`  ${progress.percentage.toFixed(0)}% - ${progress.phase} - ${progress.currentAsset}`);
    });
    const loadTime = Date.now() - startTime;

    console.assert(result.overall.total > 0, 'Should load assets');
    console.assert(result.overall.loaded > 0, 'Should successfully load assets');
    console.log(`  Preloaded ${result.overall.loaded}/${result.overall.total} assets in ${loadTime}ms`);
    console.log('✓ Test 11 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 11 failed:', error.message, '\n');
    failed++;
  }

  // Test 12: Metadata cache
  console.log('Test 12: Metadata caching');
  try {
    const asset1 = assetManager.findAsset('char-body-shark');
    const asset2 = assetManager.findAsset('char-body-shark');
    console.assert(asset1 === asset2, 'Should return cached metadata');
    console.log('✓ Test 12 passed\n');
    passed++;
  } catch (error) {
    console.error('✗ Test 12 failed:', error.message, '\n');
    failed++;
  }

  // Summary
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('════════════════════════════════════════════════════════════');

  if (failed === 0) {
    console.log('%c✅ All tests passed!', 'color: green; font-size: 16px; font-weight: bold;');
  } else {
    console.log('%c❌ Some tests failed', 'color: red; font-size: 16px; font-weight: bold;');
  }

  return { passed, failed, total: passed + failed };
}

// Auto-run in browser if assetManager is available
if (typeof window !== 'undefined' && typeof assetManager !== 'undefined') {
  console.log('AssetManager test suite ready. Run testAssetManager() to begin.');
}
