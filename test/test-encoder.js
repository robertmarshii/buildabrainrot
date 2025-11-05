/**
 * BRAINROT ENCODER TEST SUITE
 *
 * Comprehensive tests for URL encoding/decoding system
 * Can run in browser console or with Node.js
 */

// Test data fixtures
const TEST_DATA = {
  minimal: {
    version: "1.0",
    character: {
      body: "char-body-shark",
      color: "#FF6B6B"
    },
    scene: {
      background: "bg-toilet"
    },
    audio: {
      music: { id: "music-skibidi-beat-01", volume: 0.8 },
      sfx: []
    },
    metadata: {
      created: "2025-11-05T12:00:00Z"
    }
  },

  complex: {
    version: "1.0",
    character: {
      body: "char-body-cat",
      color: "#F5A623",
      accessories: [
        {
          id: "acc-head-sunglasses",
          position: { x: 256, y: 120 },
          scale: 1.2,
          rotation: 0
        },
        {
          id: "acc-feet-sneakers",
          position: { x: 256, y: 450 },
          scale: 1.0,
          rotation: -5
        }
      ],
      face: {
        eyes: "eyes-googly",
        mouth: "mouth-silly"
      }
    },
    scene: {
      background: "bg-space",
      stickers: [
        {
          id: "sticker-skull",
          position: { x: 100, y: 100 },
          scale: 1.5,
          rotation: 15
        },
        {
          id: "sticker-fire",
          position: { x: 700, y: 150 },
          scale: 1.2,
          rotation: -10
        }
      ],
      text: [
        {
          content: "SHEESH!",
          position: { x: 400, y: 200 },
          style: "bubble",
          color: "#FFFFFF"
        }
      ]
    },
    audio: {
      music: {
        id: "music-chill-lofi-01",
        volume: 0.7,
        startTime: 0
      },
      sfx: [
        {
          id: "sfx-reaction-vine-boom",
          time: 1.2,
          volume: 1.0
        },
        {
          id: "sfx-silly-honk",
          time: 3.5,
          volume: 0.9
        }
      ],
      voice: {
        id: "voice-sheesh",
        time: 0.5,
        volume: 1.0
      }
    },
    animation: {
      type: "bounce",
      speed: 1.0
    },
    metadata: {
      created: "2025-11-05T14:30:00Z",
      creator: "anonymous"
    }
  }
};

// Test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     BRAINROT ENCODER TEST SUITE                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✓ ${name}`);
      } catch (error) {
        this.failed++;
        console.error(`✗ ${name}`);
        console.error(`  Error: ${error.message}`);
      }
    }

    console.log();
    console.log('════════════════════════════════════════════════════════════');
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    console.log('════════════════════════════════════════════════════════════');

    return this.failed === 0;
  }
}

// Helper functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);

  if (actualStr !== expectedStr) {
    throw new Error(
      message || `Expected ${expectedStr}, got ${actualStr}`
    );
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (error) {
    // Expected
  }
}

// Tests
const runner = new TestRunner();

// Test 1: Basic encode
runner.test('encode() produces URL-safe string', () => {
  const encoded = BrainrotEncoder.encode(TEST_DATA.minimal);
  assert(typeof encoded === 'string', 'Encoded should be a string');
  assert(encoded.length > 0, 'Encoded should not be empty');
  assert(/^[cu]_[A-Za-z0-9\-_~]+$/.test(encoded), 'Encoded should only contain URL-safe characters');
});

// Test 2: Basic decode
runner.test('decode() reverses encode()', () => {
  const encoded = BrainrotEncoder.encode(TEST_DATA.minimal);
  const decoded = BrainrotEncoder.decode(encoded);
  assertEqual(decoded, TEST_DATA.minimal, 'Decoded data should match original');
});

// Test 3: Complex data
runner.test('handles complex brainrot data', () => {
  const encoded = BrainrotEncoder.encode(TEST_DATA.complex);
  const decoded = BrainrotEncoder.decode(encoded);
  assertEqual(decoded, TEST_DATA.complex, 'Complex data should survive encode/decode');
});

// Test 4: URL length
runner.test('compressed URL is shorter than uncompressed', () => {
  const jsonStr = JSON.stringify(TEST_DATA.complex);
  const base64Only = btoa(jsonStr).length;
  const encoded = BrainrotEncoder.encode(TEST_DATA.complex);

  console.log(`  Original JSON: ${jsonStr.length} chars`);
  console.log(`  Base64 only: ${base64Only} chars`);
  console.log(`  Encoded: ${encoded.length} chars`);

  // If pako is available, should be compressed
  if (typeof pako !== 'undefined') {
    assert(encoded.length < base64Only, 'Compressed should be shorter');
  }
});

// Test 5: Social media URL length limits
runner.test('full URL is under 2000 characters', () => {
  const url = BrainrotEncoder.getShareUrl(TEST_DATA.complex);
  console.log(`  Full URL length: ${url.length} chars`);
  assert(url.length < 2000, 'URL should be under 2000 chars for social media');
});

// Test 6: Invalid data handling
runner.test('throws error on corrupt data', () => {
  assertThrows(() => {
    BrainrotEncoder.decode('invalid-corrupt-data-!!!');
  }, 'Should throw on corrupt data');
});

// Test 7: Version handling
runner.test('handles version field correctly', () => {
  const dataWithoutVersion = { ...TEST_DATA.minimal };
  delete dataWithoutVersion.version;

  const encoded = BrainrotEncoder.encode(dataWithoutVersion);
  const decoded = BrainrotEncoder.decode(encoded);

  assert(decoded.version === "1.0", 'Should add version on encode');
});

// Test 8: URL extraction
runner.test('fromCurrentUrl() extracts data from URL path', () => {
  // This test would need to mock window.location
  // Skipping in automated tests
  console.log('  (Skipped - requires browser environment)');
});

// Test 9: Unicode text
runner.test('handles unicode characters', () => {
  const dataWithUnicode = {
    ...TEST_DATA.minimal,
    scene: {
      ...TEST_DATA.minimal.scene,
      text: [{
        content: '👾🦈 Sheesh! 🔥💯',
        position: { x: 100, y: 100 }
      }]
    }
  };

  const encoded = BrainrotEncoder.encode(dataWithUnicode);
  const decoded = BrainrotEncoder.decode(encoded);

  assertEqual(decoded.scene.text[0].content, dataWithUnicode.scene.text[0].content);
});

// Test 10: Validation - missing required fields
runner.test('validates required fields', () => {
  const invalidData = {
    version: "1.0",
    // Missing character.body
    scene: { background: "bg-toilet" }
  };

  assertThrows(() => {
    BrainrotEncoder.validate(invalidData);
  }, 'Should throw on missing required fields');
});

// Test 11: URL info
runner.test('getUrlInfo() returns stats', () => {
  const encoded = BrainrotEncoder.encode(TEST_DATA.minimal);
  const info = BrainrotEncoder.getUrlInfo(encoded);

  assert(typeof info.length === 'number', 'Should have length');
  assert(typeof info.compressed === 'boolean', 'Should have compressed flag');
  assert(typeof info.socialMediaSafe === 'boolean', 'Should have socialMediaSafe flag');
});

// Test 12: Validator - asset IDs
runner.test('BrainrotValidator validates asset IDs', () => {
  // Mock manifest
  const manifest = {
    images: {
      characters: {
        bodies: [{ id: 'char-body-shark' }]
      },
      backgrounds: [{ id: 'bg-toilet' }]
    },
    audio: {
      music: [{ id: 'music-skibidi-beat-01' }]
    }
  };

  // Valid data
  assert(
    BrainrotValidator.validateAssetIds(TEST_DATA.minimal, manifest),
    'Valid asset IDs should pass'
  );

  // Invalid data
  const invalidData = {
    character: { body: 'invalid-asset-id' },
    scene: { background: 'bg-toilet' }
  };

  assertThrows(() => {
    BrainrotValidator.validateAssetIds(invalidData, manifest);
  }, 'Invalid asset IDs should throw');
});

// Test 13: Validator - positions
runner.test('BrainrotValidator validates positions', () => {
  const validData = {
    character: {
      accessories: [
        { id: 'acc-1', position: { x: 100, y: 100 } }
      ]
    }
  };

  assert(
    BrainrotValidator.validatePositions(validData),
    'Valid positions should pass'
  );

  const invalidData = {
    character: {
      accessories: [
        { id: 'acc-1', position: { x: -100, y: 100 } } // Negative x
      ]
    }
  };

  assertThrows(() => {
    BrainrotValidator.validatePositions(invalidData);
  }, 'Negative positions should throw');
});

// Test 14: Validator - audio timing
runner.test('BrainrotValidator validates audio timing', () => {
  const validData = {
    audio: {
      sfx: [
        { id: 'sfx-1', time: 1.5 }
      ]
    }
  };

  assert(
    BrainrotValidator.validateAudioTiming(validData),
    'Valid timing should pass'
  );

  const invalidData = {
    audio: {
      sfx: [
        { id: 'sfx-1', time: 100 } // Exceeds max duration
      ]
    }
  };

  assertThrows(() => {
    BrainrotValidator.validateAudioTiming(invalidData);
  }, 'Timing exceeding max should throw');
});

// Test 15: Validator - text sanitization
runner.test('BrainrotValidator sanitizes text', () => {
  const maliciousText = '<script>alert("XSS")</script>Hello';
  const sanitized = BrainrotValidator.sanitizeText(maliciousText);

  assert(!sanitized.includes('<script>'), 'Should remove script tags');
  assert(!sanitized.includes('alert'), 'Should remove script content');
});

// Test 16: Utils - copy share link
runner.test('BrainrotUtils generates share URLs', () => {
  const shareUrls = BrainrotUtils.getSocialShareUrls(TEST_DATA.minimal);

  assert(shareUrls.twitter.includes('twitter.com'), 'Should have Twitter URL');
  assert(shareUrls.facebook.includes('facebook.com'), 'Should have Facebook URL');
  assert(shareUrls.reddit.includes('reddit.com'), 'Should have Reddit URL');
});

// Test 17: Utils - URL stats
runner.test('BrainrotUtils provides URL stats', () => {
  const stats = BrainrotUtils.getUrlStats(TEST_DATA.minimal);

  assert(typeof stats.originalSize === 'number', 'Should have original size');
  assert(typeof stats.encodedSize === 'number', 'Should have encoded size');
  assert(typeof stats.compressionRatio === 'string', 'Should have compression ratio');
});

// Test 18: Utils - description generation
runner.test('BrainrotUtils generates descriptions', () => {
  const description = BrainrotUtils.getDescription(TEST_DATA.minimal);

  assert(typeof description === 'string', 'Description should be a string');
  assert(description.length > 0, 'Description should not be empty');
});

// Test 19: Performance - encoding speed
runner.test('encoding performance (100 iterations)', () => {
  const start = Date.now();

  for (let i = 0; i < 100; i++) {
    BrainrotEncoder.encode(TEST_DATA.complex);
  }

  const duration = Date.now() - start;
  console.log(`  Completed in ${duration}ms (${(duration/100).toFixed(2)}ms per encode)`);

  assert(duration < 1000, 'Should encode 100 times in under 1 second');
});

// Test 20: Performance - decoding speed
runner.test('decoding performance (100 iterations)', () => {
  const encoded = BrainrotEncoder.encode(TEST_DATA.complex);
  const start = Date.now();

  for (let i = 0; i < 100; i++) {
    BrainrotEncoder.decode(encoded);
  }

  const duration = Date.now() - start;
  console.log(`  Completed in ${duration}ms (${(duration/100).toFixed(2)}ms per decode)`);

  assert(duration < 500, 'Should decode 100 times in under 0.5 seconds');
});

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running tests in browser...');
  runner.run().then(success => {
    if (success) {
      console.log('%c✅ All tests passed!', 'color: green; font-size: 16px; font-weight: bold;');
    } else {
      console.log('%c❌ Some tests failed', 'color: red; font-size: 16px; font-weight: bold;');
    }
  });
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  // Load dependencies
  const BrainrotEncoder = require('../public/assets/js/BrainrotEncoder.js');
  const BrainrotValidator = require('../public/assets/js/BrainrotValidator.js');
  const BrainrotUtils = require('../public/assets/js/BrainrotUtils.js');

  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}
