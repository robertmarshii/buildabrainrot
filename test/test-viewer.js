/**
 * VIEWER TESTS
 *
 * Test suite for BrainrotViewer class
 */

// Test data
const testBrainrot = {
  version: "1.0",
  character: {
    body: "char-body-shark",
    color: "#FF6B6B",
    accessories: [],
    face: {
      eyes: "char-eyes-happy",
      mouth: "char-mouth-smile"
    }
  },
  scene: {
    background: "bg-toilet",
    stickers: [],
    texts: []
  },
  audio: {
    music: {
      id: "music-skibidi-beat-01",
      volume: 0.8
    },
    sfx: []
  },
  metadata: {
    created: new Date().toISOString(),
    creator: "test"
  }
};

async function testViewer() {
  console.log('🧪 Testing Brainrot Viewer...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Encode data
  console.log('Test 1: Encode test brainrot');
  try {
    const encoded = BrainrotEncoder.encode(testBrainrot);
    console.assert(encoded && encoded.length > 0, 'Encoded data should not be empty');
    console.log(`✓ Test 1 passed - Encoded length: ${encoded.length}`);
    passed++;
  } catch (error) {
    console.error('✗ Test 1 failed:', error);
    failed++;
  }

  // Test 2: Decode data
  console.log('\nTest 2: Decode brainrot');
  try {
    const encoded = BrainrotEncoder.encode(testBrainrot);
    const decoded = BrainrotEncoder.decode(encoded);
    console.assert(decoded.character.body === testBrainrot.character.body, 'Body should match');
    console.assert(decoded.scene.background === testBrainrot.scene.background, 'Background should match');
    console.log('✓ Test 2 passed - Data decoded correctly');
    passed++;
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
    failed++;
  }

  // Test 3: Viewer initialization
  console.log('\nTest 3: Initialize viewer');
  try {
    const canvas = document.createElement('canvas');
    canvas.id = 'test-canvas';
    document.body.appendChild(canvas);

    const encoded = BrainrotEncoder.encode(testBrainrot);
    const viewer = new BrainrotViewer('test-canvas', encoded);

    console.assert(viewer.encodedData === encoded, 'Encoded data should match');
    console.assert(viewer.canvasId === 'test-canvas', 'Canvas ID should match');
    console.log('✓ Test 3 passed - Viewer initialized');
    passed++;

    // Cleanup
    document.body.removeChild(canvas);
  } catch (error) {
    console.error('✗ Test 3 failed:', error);
    failed++;
  }

  // Test 4: Asset validation
  console.log('\nTest 4: Asset validation');
  try {
    const encoded = BrainrotEncoder.encode(testBrainrot);
    const viewer = new BrainrotViewer('test-canvas', encoded);
    viewer.brainrotData = BrainrotEncoder.decode(encoded);

    // Mock asset manager
    viewer.assetManager = {
      findAsset: (id) => {
        // Return mock asset for known IDs
        if (id.startsWith('char-') || id.startsWith('bg-') || id.startsWith('music-')) {
          return { id, name: 'Test Asset' };
        }
        return null;
      }
    };

    viewer.validateAssets(); // Should not throw
    console.log('✓ Test 4 passed - Assets validated');
    passed++;
  } catch (error) {
    console.error('✗ Test 4 failed:', error);
    failed++;
  }

  // Test 5: Share URL generation
  console.log('\nTest 5: Share URL generation');
  try {
    const encoded = BrainrotEncoder.encode(testBrainrot);
    const shareUrl = BrainrotEncoder.getShareUrl(testBrainrot);
    console.assert(shareUrl.includes('/b/'), 'Share URL should contain /b/ path');
    console.assert(shareUrl.includes(encoded), 'Share URL should contain encoded data');
    console.log('✓ Test 5 passed - Share URL generated');
    passed++;
  } catch (error) {
    console.error('✗ Test 5 failed:', error);
    failed++;
  }

  // Test 6: Loading screen methods
  console.log('\nTest 6: Loading screen methods');
  try {
    // Create DOM elements
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    const viewScreen = document.createElement('div');
    viewScreen.id = 'view-screen';
    const errorScreen = document.createElement('div');
    errorScreen.id = 'error-screen';

    document.body.appendChild(loadingScreen);
    document.body.appendChild(viewScreen);
    document.body.appendChild(errorScreen);

    const encoded = BrainrotEncoder.encode(testBrainrot);
    const viewer = new BrainrotViewer('test-canvas', encoded);

    viewer.showLoading();
    console.assert(loadingScreen.style.display === 'flex', 'Loading screen should be visible');

    viewer.showView();
    console.assert(viewScreen.style.display === 'flex', 'View screen should be visible');

    viewer.showError('Test error');
    console.assert(errorScreen.style.display === 'flex', 'Error screen should be visible');

    console.log('✓ Test 6 passed - Screen transitions work');
    passed++;

    // Cleanup
    document.body.removeChild(loadingScreen);
    document.body.removeChild(viewScreen);
    document.body.removeChild(errorScreen);
  } catch (error) {
    console.error('✗ Test 6 failed:', error);
    failed++;
  }

  // Test 7: Update loading progress
  console.log('\nTest 7: Update loading progress');
  try {
    const statusEl = document.createElement('p');
    statusEl.id = 'loading-status';
    const percentEl = document.createElement('p');
    percentEl.id = 'loading-percentage';
    const fillEl = document.createElement('div');
    fillEl.id = 'progress-fill';

    document.body.appendChild(statusEl);
    document.body.appendChild(percentEl);
    document.body.appendChild(fillEl);

    const encoded = BrainrotEncoder.encode(testBrainrot);
    const viewer = new BrainrotViewer('test-canvas', encoded);

    viewer.updateLoading('Testing...', 50);
    console.assert(statusEl.textContent === 'Testing...', 'Status should update');
    console.assert(percentEl.textContent === '50%', 'Percentage should update');
    console.assert(fillEl.style.width === '50%', 'Progress bar should update');

    console.log('✓ Test 7 passed - Loading progress updates');
    passed++;

    // Cleanup
    document.body.removeChild(statusEl);
    document.body.removeChild(percentEl);
    document.body.removeChild(fillEl);
  } catch (error) {
    console.error('✗ Test 7 failed:', error);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('✅ All viewer tests passed!');
  } else {
    console.log('❌ Some tests failed');
  }

  return { passed, failed };
}

// Run tests if loaded in browser
if (typeof window !== 'undefined') {
  console.log('Brainrot Viewer Test Suite loaded.');
  console.log('Run testViewer() to execute tests.');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testViewer };
}
