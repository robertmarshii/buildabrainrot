# TASK 04: URL Encoding/Decoding System for Brainrot Sharing

## 🎓 Lessons Learned from Previous Tasks

### From Task 01 (Asset Structure)
- Consistent naming conventions make systems predictable
- Centralized configuration (manifest) beats scattered logic
- **Applied**: URL encoding will reference asset IDs from manifest

### From Task 02 (Image Assets)
- Asset relationships matter (accessories work with certain bodies)
- Validation prevents bad combinations
- **Applied**: URL decoder will validate asset compatibility

### From Task 03 (Audio Assets)
- File sizes add up quickly
- Duration/timing metadata is critical
- **Applied**: URL must encode audio timing info, optimize for size

### Combined Learning
- **Data Size**: Images (50MB) + Audio (30MB) = can't embed raw data
- **Asset References**: Have 100+ unique asset IDs to encode
- **Complexity**: Need to encode: body, accessories, colors, positions, audio tracks, SFX timing, text, animations
- **Shareability**: URLs must be short enough for social media (~2000 char limit)

---

## 🎯 Goal
Create a robust URL encoding/decoding system that can represent complete brainrot creations as shareable links. System must be compact, human-debuggable (if needed), secure against injection attacks, and extensible for future features.

## 📋 What's Required for Completion

### 1. Brainrot Data Structure

Define canonical format for brainrot data:
```javascript
// Complete brainrot object
const BrainrotData = {
  version: "1.0",                    // Schema version for future compatibility
  character: {
    body: "char-body-shark",         // Asset ID
    color: "#FF6B6B",                // Hex color
    accessories: [
      {
        id: "acc-head-sunglasses",
        position: {x: 256, y: 120},  // Optional override
        scale: 1.0,
        rotation: 0
      },
      {
        id: "acc-feet-sneakers",
        position: {x: 256, y: 450}
      }
    ],
    face: {
      eyes: "eyes-googly",
      mouth: "mouth-silly"
    }
  },
  scene: {
    background: "bg-toilet",
    stickers: [
      {
        id: "sticker-skull",
        position: {x: 100, y: 100},
        scale: 1.5,
        rotation: 15
      }
    ],
    text: [
      {
        content: "sheesh!",
        position: {x: 300, y: 200},
        style: "bubble",             // Font style
        color: "#FFFFFF"
      }
    ]
  },
  audio: {
    music: {
      id: "music-skibidi-beat-01",
      volume: 0.8,
      startTime: 0
    },
    sfx: [
      {
        id: "sfx-reaction-vine-boom",
        time: 1.2,                   // When to play (seconds)
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
    type: "bounce",                  // Animation preset
    speed: 1.0
  },
  metadata: {
    created: "2025-11-05T12:00:00Z",
    creator: "anonymous",            // For future user accounts
    views: 0
  }
};
```

### 2. Encoding Strategies (Compare and Choose)

#### Option A: Base64 JSON (Simple, debuggable)
```javascript
const encoded = btoa(JSON.stringify(brainrotData));
// URL: /b/eyJjaGFyYWN0ZXI...
// Pros: Simple, preserves structure
// Cons: Long URLs (~1500-2500 chars), not optimized
```

#### Option B: Compressed Base64 (Recommended)
```javascript
// Use pako.js for gzip compression
const json = JSON.stringify(brainrotData);
const compressed = pako.deflate(json, { to: 'string' });
const encoded = btoa(compressed);
// URL: /b/H4sIAAAAAAAAA...
// Pros: 60-70% smaller, still Base64
// Cons: Requires pako.js library (11KB)
```

#### Option C: Custom Binary Format (Maximum optimization)
```javascript
// Pack data into binary buffer
const buffer = new ArrayBuffer(256);
const view = new DataView(buffer);
// Write asset IDs as integers (after mapping)
// Write colors as RGB (3 bytes instead of 7 chars)
// Pros: Smallest possible (<200 bytes)
// Cons: Complex, hard to debug, not human-readable
```

#### Option D: Hybrid Approach (Best of both)
```javascript
// Use short codes for common assets
const shortCodes = {
  'char-body-shark': 's1',
  'char-body-cat': 'c1',
  // ...
};
// Then compress
// Pros: Readable + compressed
// Cons: Requires maintaining short code map
```

**Recommendation**: Start with **Option B** (Compressed Base64), migrate to **Option D** if needed.

### 3. URL Structure

```
Format: https://buildabrainrot.com/b/{encoded-data}

Examples:
/b/H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVRKi1OLUpVslIqLU4...
/view?d=H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVRKi1OLU...
/share/{short-id}  (future: database-backed short URLs)
```

### 4. Encoder Module

```javascript
// lib/BrainrotEncoder.js
class BrainrotEncoder {
  static VERSION = "1.0";

  /**
   * Encode brainrot data to URL-safe string
   */
  static encode(brainrotData) {
    // Add version if not present
    const data = {
      version: this.VERSION,
      ...brainrotData
    };

    // Convert to JSON
    const json = JSON.stringify(data);

    // Compress with pako
    const compressed = pako.deflate(json, { to: 'string' });

    // Base64 encode
    const base64 = btoa(compressed);

    // Make URL-safe (replace +/= with -_~)
    const urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '~');

    return urlSafe;
  }

  /**
   * Decode URL string to brainrot data
   */
  static decode(encoded) {
    try {
      // Reverse URL-safe encoding
      const base64 = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/~/g, '=');

      // Base64 decode
      const compressed = atob(base64);

      // Decompress
      const json = pako.inflate(compressed, { to: 'string' });

      // Parse JSON
      const data = JSON.parse(json);

      // Validate version
      if (!data.version || data.version !== this.VERSION) {
        console.warn('Version mismatch:', data.version);
      }

      // Validate data structure
      this.validate(data);

      return data;
    } catch (error) {
      throw new Error(`Failed to decode brainrot: ${error.message}`);
    }
  }

  /**
   * Validate decoded data structure
   */
  static validate(data) {
    if (!data.character || !data.character.body) {
      throw new Error('Invalid brainrot: missing character body');
    }

    if (!data.scene || !data.scene.background) {
      throw new Error('Invalid brainrot: missing background');
    }

    // Check asset IDs exist in manifest
    // (requires manifest to be loaded)

    return true;
  }

  /**
   * Get shareable URL for brainrot
   */
  static getShareUrl(brainrotData, baseUrl = window.location.origin) {
    const encoded = this.encode(brainrotData);
    return `${baseUrl}/b/${encoded}`;
  }

  /**
   * Extract brainrot data from current URL
   */
  static fromCurrentUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/b\/(.+)/);

    if (match) {
      return this.decode(match[1]);
    }

    // Try query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.has('d')) {
      return this.decode(params.get('d'));
    }

    throw new Error('No brainrot data found in URL');
  }
}
```

### 5. URL Router (PHP)

```php
// public/b.php or handled by .htaccess
<?php
// Extract encoded data from URL
$encoded = $_GET['id'] ?? null;

if (!$encoded) {
    http_response_code(400);
    die('Missing brainrot ID');
}

// Validate format (basic security)
if (!preg_match('/^[A-Za-z0-9\-_~]+$/', $encoded)) {
    http_response_code(400);
    die('Invalid brainrot ID');
}

// Load view page
include 'view-brainrot.php';
?>
```

```apache
# .htaccess
RewriteEngine On
RewriteRule ^b/([A-Za-z0-9\-_~]+)$ /view-brainrot.php?id=$1 [L,QSA]
```

### 6. Security Measures

```javascript
class BrainrotValidator {
  /**
   * Validate asset IDs against manifest
   */
  static validateAssetIds(data, manifest) {
    const allIds = [
      data.character.body,
      ...data.character.accessories.map(a => a.id),
      data.scene.background,
      ...data.scene.stickers.map(s => s.id),
      data.audio.music?.id,
      ...data.audio.sfx.map(s => s.id)
    ].filter(Boolean);

    const invalidIds = allIds.filter(id => {
      return !this.assetExistsInManifest(id, manifest);
    });

    if (invalidIds.length > 0) {
      throw new Error(`Invalid asset IDs: ${invalidIds.join(', ')}`);
    }
  }

  /**
   * Sanitize user text input
   */
  static sanitizeText(text) {
    // Remove HTML tags
    const clean = text.replace(/<[^>]*>/g, '');

    // Limit length
    return clean.substring(0, 100);
  }

  /**
   * Validate numeric ranges
   */
  static validatePositions(data) {
    const canvas = { width: 1920, height: 1080 };

    // Check all positions are within bounds
    [...data.character.accessories, ...data.scene.stickers].forEach(item => {
      if (item.position) {
        if (item.position.x < 0 || item.position.x > canvas.width ||
            item.position.y < 0 || item.position.y > canvas.height) {
          throw new Error(`Position out of bounds: ${JSON.stringify(item.position)}`);
        }
      }
    });
  }

  /**
   * Prevent timing attacks
   */
  static validateAudioTiming(data) {
    const maxDuration = 30; // seconds

    data.audio.sfx.forEach(sfx => {
      if (sfx.time < 0 || sfx.time > maxDuration) {
        throw new Error(`Invalid SFX timing: ${sfx.time}`);
      }
    });
  }
}
```

## 🛠️ Best Implementation Approach

### Phase 1: Setup Dependencies

```bash
# Download pako.js (gzip compression)
cd public/assets/js
curl -O https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js

# Or use CDN in HTML
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
```

### Phase 2: Implement Core Encoder/Decoder

1. Create `/public/assets/js/BrainrotEncoder.js`
2. Add pako.js dependency
3. Implement encode() and decode() methods
4. Add error handling

### Phase 3: Add URL Routing

1. Create `/public/view-brainrot.php` (view page)
2. Update `.htaccess` for clean URLs
3. Add security validation

### Phase 4: Create Test Suite

```javascript
// test/test-encoder.js
function testEncoder() {
  const testData = {
    version: "1.0",
    character: {
      body: "char-body-shark",
      color: "#FF6B6B"
    },
    scene: {
      background: "bg-toilet"
    },
    audio: {
      music: { id: "music-skibidi-beat-01" },
      sfx: []
    }
  };

  console.log('Test 1: Basic encode/decode');
  const encoded = BrainrotEncoder.encode(testData);
  console.log('Encoded length:', encoded.length);
  const decoded = BrainrotEncoder.decode(encoded);
  console.assert(JSON.stringify(decoded) === JSON.stringify(testData), 'Data mismatch');
  console.log('✓ Test 1 passed');

  console.log('\nTest 2: Complex data');
  const complexData = {
    /* ... full brainrot with all features ... */
  };
  const encoded2 = BrainrotEncoder.encode(complexData);
  console.log('Complex encoded length:', encoded2.length);
  console.assert(encoded2.length < 2000, 'URL too long for social media');
  console.log('✓ Test 2 passed');

  console.log('\nTest 3: Invalid data handling');
  try {
    BrainrotEncoder.decode('invalid-data-here');
    console.error('✗ Should have thrown error');
  } catch (e) {
    console.log('✓ Test 3 passed - error caught:', e.message);
  }

  console.log('\n✅ All tests passed!');
}
```

### Phase 5: Create Helper Functions

```javascript
// Convenience methods
class BrainrotUtils {
  static copyShareLink(brainrotData) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    navigator.clipboard.writeText(url);
    return url;
  }

  static generateQRCode(brainrotData) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    // Use QR code library
    return QRCode.toDataURL(url);
  }

  static getEmbedCode(brainrotData) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    return `<iframe src="${url}" width="600" height="400"></iframe>`;
  }
}
```

## ✅ Completion Checks

### Automated Tests

```bash
# Run encoder tests
node test/test-encoder.js

# Test URL routing
curl -I http://localhost:7777/b/H4sIAAAAAAAAA
# Should return 200 OK

# Test invalid URLs
curl -I http://localhost:7777/b/invalid<script>
# Should return 400 Bad Request
```

### Manual Checks

- [ ] Encode sample brainrot, verify URL length < 2000 chars
- [ ] Decode sample URL, verify all data intact
- [ ] Share URL works when pasted in new browser
- [ ] Invalid URLs show error page, don't crash
- [ ] URLs work with query params (?d=...) and path (/b/...)
- [ ] URL routing works with .htaccess
- [ ] Compression reduces size by 50%+ vs plain JSON

### Unit Tests

```javascript
// Complete test suite
describe('BrainrotEncoder', () => {
  test('encode produces URL-safe string', () => {
    const data = getTestData();
    const encoded = BrainrotEncoder.encode(data);
    expect(encoded).toMatch(/^[A-Za-z0-9\-_~]+$/);
  });

  test('decode reverses encode', () => {
    const data = getTestData();
    const encoded = BrainrotEncoder.encode(data);
    const decoded = BrainrotEncoder.decode(encoded);
    expect(decoded).toEqual(data);
  });

  test('handles unicode text', () => {
    const data = { text: '👾🦈 Sheesh! 🔥' };
    const encoded = BrainrotEncoder.encode(data);
    const decoded = BrainrotEncoder.decode(encoded);
    expect(decoded.text).toBe(data.text);
  });

  test('validates version mismatch', () => {
    const oldData = { version: "0.9", /* ... */ };
    const encoded = BrainrotEncoder.encode(oldData);
    // Should warn but still work
    const decoded = BrainrotEncoder.decode(encoded);
    expect(decoded.version).toBe("0.9");
  });

  test('throws on corrupt data', () => {
    expect(() => {
      BrainrotEncoder.decode('corrupt!!!');
    }).toThrow();
  });

  test('validates asset IDs', () => {
    const data = { character: { body: 'invalid-asset-id' } };
    expect(() => {
      BrainrotValidator.validateAssetIds(data, manifest);
    }).toThrow('Invalid asset IDs');
  });
});
```

### Performance Checks

```javascript
// Benchmark encoding speed
console.time('encode-100');
for (let i = 0; i < 100; i++) {
  BrainrotEncoder.encode(testData);
}
console.timeEnd('encode-100');
// Should be < 100ms

// Benchmark decode speed
console.time('decode-100');
for (let i = 0; i < 100; i++) {
  BrainrotEncoder.decode(encodedData);
}
console.timeEnd('decode-100');
// Should be < 50ms
```

### Security Checks

- [ ] SQL injection attempts fail (if DB used)
- [ ] XSS attempts sanitized in text fields
- [ ] Path traversal blocked (../../etc/passwd)
- [ ] Oversized URLs rejected (> 5000 chars)
- [ ] Invalid asset IDs rejected
- [ ] Position values validated (can't be negative/huge)

## 📊 Success Criteria

Task 04 is complete when:
1. ✅ BrainrotEncoder class fully implemented
2. ✅ Encode/decode works bidirectionally (data integrity)
3. ✅ Compression reduces URL length by 50%+
4. ✅ URL routing works (/b/{id} → view page)
5. ✅ Security validation prevents injection attacks
6. ✅ All unit tests pass
7. ✅ URLs < 2000 characters for full brainrots
8. ✅ Error handling for corrupt/invalid URLs
9. ✅ Version system in place for future migrations
10. ✅ Helper functions for copying/QR codes

## 🎓 Key Deliverables

- `/public/assets/js/BrainrotEncoder.js`
- `/public/assets/js/BrainrotValidator.js`
- `/public/assets/js/BrainrotUtils.js`
- `/public/view-brainrot.php`
- Updated `.htaccess` with routing
- `/test/test-encoder.js` (test suite)
- Documentation on encoding format
- Example URLs for testing

## ⚠️ Common Pitfalls to Avoid

1. **No Compression**: URLs too long for Twitter (280 chars)
2. **No Validation**: Malicious URLs crash the app
3. **Hardcoded Version**: Can't migrate old URLs later
4. **No Error Handling**: Corrupt URLs show blank page
5. **Forgetting URL Encoding**: Special chars break links
6. **No Backward Compatibility**: Old links break with updates
7. **Missing Security**: XSS through text fields
8. **No Testing**: Edge cases fail in production

## 🔗 Dependencies for Next Task

Task 05 will need:
- ✅ BrainrotEncoder to decode URLs
- ✅ Asset manifest from Tasks 01-03
- ✅ Understanding of what assets to load
- ✅ Knowledge of brainrot data structure

## 🚀 Future Enhancements (Post-MVP)

- Database-backed short URLs (/b/abc123)
- URL analytics (track views/shares)
- Multiple versions support (v1.0, v1.1)
- Binary encoding for extreme optimization
- Server-side rendering for social previews
- Rate limiting on URL generation
