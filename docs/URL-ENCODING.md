

# URL Encoding System Documentation

## Overview

The Build a Brainrot URL encoding system allows complete brainrot creations to be shared as compact, URL-safe strings. This enables users to share their creations via social media, messaging apps, and direct links.

## Architecture

### Core Components

1. **BrainrotEncoder.js** - Main encoding/decoding logic
2. **BrainrotValidator.js** - Security and validation
3. **BrainrotUtils.js** - Helper functions for sharing
4. **view-brainrot.php** - View page for shared links
5. **.htaccess** - URL routing configuration

### Data Flow

```
Creation → Encode → URL → Share → Decode → Render
```

## Encoding Format

### URL Structure

```
https://buildabrainrot.com/b/{encoded-data}
```

Where `{encoded-data}` is:
- Prefixed with `c_` (compressed) or `u_` (uncompressed)
- Base64-encoded (URL-safe variant)
- Optional gzip compression via pako.js

### Example URLs

**Minimal brainrot:**
```
/b/u_eyJ2ZXJzaW9uIjoiMS4wIiwiY2hhcmFjdGVyIjp7ImJvZHkiOiJjaGFyLWJvZHktc2hhcmsiLCJjb2xvciI6IiNGRjZCNkIifSwic2NlbmUiOnsic2NlbmUiOnsiYmFja2dyb3VuZCI6ImJnLXRvaWxldCJ9fQ~~
```

**With compression (pako.js):**
```
/b/c_H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVRKi1OLUpVslIqLU4tSi1KVbK...
```

## Brainrot Data Structure

### Complete Schema

```javascript
{
  version: "1.0",                    // Schema version
  character: {
    body: "char-body-shark",         // Required: character asset ID
    color: "#FF6B6B",                // Hex color
    accessories: [                   // Optional
      {
        id: "acc-head-sunglasses",
        position: {x: 256, y: 120},  // Optional position override
        scale: 1.0,                  // 0.1 to 5.0
        rotation: 0                  // -360 to 360 degrees
      }
    ],
    face: {                          // Optional
      eyes: "eyes-googly",
      mouth: "mouth-silly"
    }
  },
  scene: {
    background: "bg-toilet",         // Required
    stickers: [                      // Optional
      {
        id: "sticker-skull",
        position: {x: 100, y: 100},
        scale: 1.5,
        rotation: 15
      }
    ],
    text: [                          // Optional
      {
        content: "sheesh!",
        position: {x: 300, y: 200},
        style: "bubble",
        color: "#FFFFFF"
      }
    ]
  },
  audio: {                           // Optional
    music: {
      id: "music-skibidi-beat-01",
      volume: 0.8,                   // 0.0 to 1.0
      startTime: 0
    },
    sfx: [
      {
        id: "sfx-reaction-vine-boom",
        time: 1.2,                   // When to play (seconds, 0-30)
        volume: 1.0
      }
    ],
    voice: {
      id: "voice-sheesh",
      time: 0.5,
      volume: 1.0
    }
  },
  animation: {                       // Optional
    type: "bounce",
    speed: 1.0
  },
  metadata: {                        // Optional
    created: "2025-11-05T12:00:00Z",
    creator: "anonymous"
  }
}
```

## API Reference

### BrainrotEncoder

#### `encode(brainrotData)`

Encode brainrot data to URL-safe string.

```javascript
const data = {
  version: "1.0",
  character: { body: "char-body-shark", color: "#FF6B6B" },
  scene: { background: "bg-toilet" },
  audio: { music: { id: "music-skibidi-beat-01" }, sfx: [] }
};

const encoded = BrainrotEncoder.encode(data);
// Returns: "u_eyJ2ZXJzaW9uIjoiMS4wIiwiY2hhcmFjdGVyIjp7ImJvZHki..."
```

#### `decode(encoded)`

Decode URL string to brainrot data.

```javascript
const encoded = "u_eyJ2ZXJzaW9uIjoiMS4wIi...";
const data = BrainrotEncoder.decode(encoded);
// Returns: { version: "1.0", character: {...}, ... }
```

**Throws:** Error if decoding fails or data is invalid.

#### `getShareUrl(brainrotData, baseUrl?)`

Generate complete shareable URL.

```javascript
const url = BrainrotEncoder.getShareUrl(data);
// Returns: "https://buildabrainrot.com/b/u_eyJ2ZXJz..."
```

#### `fromCurrentUrl()`

Extract brainrot data from current page URL.

```javascript
// On page /b/u_eyJ2ZXJz...
const data = BrainrotEncoder.fromCurrentUrl();
```

#### `getUrlInfo(encoded)`

Get statistics about encoded URL.

```javascript
const info = BrainrotEncoder.getUrlInfo(encoded);
// Returns: {
//   length: 245,
//   fullUrlLength: 279,
//   compressed: false,
//   twitterSafe: false,
//   socialMediaSafe: true,
//   readable: true
// }
```

### BrainrotValidator

#### `validateAssetIds(data, manifest)`

Validate all asset IDs exist in manifest.

```javascript
BrainrotValidator.validateAssetIds(data, manifest);
// Throws if invalid IDs found
```

#### `validatePositions(data, canvasSize?)`

Validate positions are within canvas bounds.

```javascript
BrainrotValidator.validatePositions(data, { width: 1920, height: 1080 });
```

#### `validateAudioTiming(data, maxDuration?)`

Validate audio timing values.

```javascript
BrainrotValidator.validateAudioTiming(data, 30); // 30 seconds max
```

#### `sanitizeText(text, maxLength?)`

Sanitize user text input (remove HTML, prevent XSS).

```javascript
const safe = BrainrotValidator.sanitizeText('<script>alert("XSS")</script>Hello');
// Returns: "Hello"
```

#### `validateAll(data, manifest?, options?)`

Run all validation checks.

```javascript
const result = BrainrotValidator.validateAll(data, manifest);
// Returns: {
//   valid: true,
//   errors: [],
//   warnings: []
// }
```

### BrainrotUtils

#### `copyShareLink(brainrotData, onSuccess?, onError?)`

Copy share link to clipboard.

```javascript
await BrainrotUtils.copyShareLink(data,
  (url) => console.log('Copied:', url),
  (error) => console.error('Failed:', error)
);
```

#### `getSocialShareUrls(brainrotData, options?)`

Generate social media share URLs.

```javascript
const urls = BrainrotUtils.getSocialShareUrls(data, {
  title: 'Check out my brainrot!',
  text: 'I made this on Build a Brainrot!'
});
// Returns: {
//   twitter: "https://twitter.com/intent/tweet?...",
//   facebook: "https://www.facebook.com/sharer/...",
//   reddit: "https://reddit.com/submit?...",
//   whatsapp: "https://wa.me/?...",
//   telegram: "https://t.me/share/...",
//   email: "mailto:?..."
// }
```

#### `getEmbedCode(brainrotData, options?)`

Generate iframe embed code.

```javascript
const embedCode = BrainrotUtils.getEmbedCode(data, {
  width: 600,
  height: 400,
  title: 'My Brainrot'
});
// Returns: '<iframe src="..." width="600" height="400"></iframe>'
```

#### `downloadAsJSON(brainrotData, filename?)`

Download brainrot as JSON file.

```javascript
BrainrotUtils.downloadAsJSON(data, 'my-brainrot.json');
```

#### `loadFromJSON(file)`

Load brainrot from JSON file.

```javascript
const file = event.target.files[0]; // From <input type="file">
const data = await BrainrotUtils.loadFromJSON(file);
```

#### `getUrlStats(brainrotData)`

Get detailed URL statistics.

```javascript
const stats = BrainrotUtils.getUrlStats(data);
// Returns: {
//   originalSize: 458,
//   encodedSize: 245,
//   fullUrl: "https://buildabrainrot.com/b/...",
//   compressionRatio: "46.5%",
//   warnings: []
// }
```

## Security

### Input Validation

All user input is validated:

- **Asset IDs**: Must exist in manifest
- **Colors**: Must match `#[0-9A-F]{6}` pattern
- **Positions**: Must be within canvas bounds (0-1920x0-1080)
- **Text**: HTML tags stripped, max 100 characters
- **Timing**: Audio timing 0-30 seconds
- **Numeric ranges**: Scale 0.1-5.0, rotation -360 to 360

### XSS Prevention

Text fields are sanitized:

```javascript
const userInput = '<script>alert("XSS")</script>Hello';
const safe = BrainrotValidator.sanitizeText(userInput);
// Result: "Hello" (script tags removed)
```

### URL Validation

.htaccess rules only allow safe characters:

```apache
RewriteRule ^b/([A-Za-z0-9\-_~]+)$ /view-brainrot.php?id=$1 [L,QSA]
```

### Size Limits

- Maximum URL length: 5000 characters
- Maximum audio duration: 30 seconds
- Maximum text length: 100 characters per field

## Performance

### Encoding Speed

- **Simple brainrot**: ~1ms
- **Complex brainrot**: ~3-5ms
- **100 iterations**: <100ms total

### Decoding Speed

- **Simple brainrot**: ~0.5ms
- **Complex brainrot**: ~1-2ms
- **100 iterations**: <50ms total

### URL Sizes

Without compression:
- Minimal brainrot: ~300 characters
- Complex brainrot: ~1200-1800 characters

With pako.js compression:
- Minimal brainrot: ~180 characters (40% reduction)
- Complex brainrot: ~600-900 characters (50% reduction)

## Testing

### Run Tests in Browser

Open `test/test-encoder.html` in a browser:

```bash
# Start local server
php -S localhost:7777 -t public

# Open in browser
open http://localhost:7777/../test/test-encoder.html
```

### Run Tests in Console

In browser console:

```javascript
// Included in test page automatically
runner.run();
```

### Test Coverage

- ✓ Basic encoding/decoding
- ✓ Complex data structures
- ✓ Unicode text handling
- ✓ Compression (if available)
- ✓ URL length validation
- ✓ Invalid data handling
- ✓ Asset ID validation
- ✓ Position validation
- ✓ Audio timing validation
- ✓ Text sanitization
- ✓ Performance benchmarks

## Troubleshooting

### URLs Too Long

**Problem**: Encoded URLs exceed 2000 characters

**Solutions**:
1. Install pako.js for compression (reduces size by 50%)
2. Simplify the brainrot (fewer accessories/stickers)
3. Reduce text content
4. Use shorter asset IDs (future optimization)

### Compression Not Working

**Problem**: URLs start with `u_` instead of `c_`

**Solution**: Ensure pako.js is loaded:

```html
<script src="/assets/js/pako.min.js"></script>
<script src="/assets/js/BrainrotEncoder.js"></script>
```

### Decoding Errors

**Problem**: `Failed to decode brainrot` error

**Possible causes**:
- Corrupted URL (missing characters)
- Invalid base64 encoding
- Wrong compression format
- Data structure changes

**Debug**:
```javascript
try {
  const data = BrainrotEncoder.decode(encoded);
} catch (error) {
  console.error('Decode error:', error.message);
}
```

### Asset Validation Fails

**Problem**: `Invalid asset IDs` error

**Solution**: Ensure manifest is loaded and asset IDs match:

```javascript
// Load manifest first
const manifest = await fetch('/assets/manifest.json').then(r => r.json());

// Then validate
BrainrotValidator.validateAssetIds(data, manifest);
```

## Future Enhancements

- [ ] Database-backed short URLs (`/s/abc123`)
- [ ] URL analytics (view counts, share tracking)
- [ ] Multiple schema versions (backward compatibility)
- [ ] Binary encoding for extreme compression
- [ ] Server-side social media preview images
- [ ] QR code generation integration
- [ ] Rate limiting for URL generation

## Examples

### Minimal Brainrot

```javascript
const minimal = {
  version: "1.0",
  character: {
    body: "char-body-shark",
    color: "#4A90E2"
  },
  scene: {
    background: "bg-toilet"
  },
  audio: {
    music: { id: "music-skibidi-beat-01" },
    sfx: []
  }
};

const url = BrainrotEncoder.getShareUrl(minimal);
// /b/u_eyJ2ZXJzaW9uIjoiMS4wIiwiY2hhcmFjdGVyIjp7ImJvZHkiOi...
```

### Full-Featured Brainrot

```javascript
const complex = {
  version: "1.0",
  character: {
    body: "char-body-cat",
    color: "#F5A623",
    accessories: [
      { id: "acc-head-sunglasses", position: {x: 256, y: 120}, scale: 1.2 },
      { id: "acc-feet-sneakers", position: {x: 256, y: 450} }
    ]
  },
  scene: {
    background: "bg-space",
    stickers: [
      { id: "sticker-fire", position: {x: 700, y: 150}, scale: 1.5, rotation: 15 }
    ],
    text: [
      { content: "SHEESH!", position: {x: 400, y: 200}, style: "bubble", color: "#FFF" }
    ]
  },
  audio: {
    music: { id: "music-chill-lofi-01", volume: 0.7 },
    sfx: [
      { id: "sfx-reaction-vine-boom", time: 1.2, volume: 1.0 },
      { id: "sfx-silly-honk", time: 3.5, volume: 0.9 }
    ],
    voice: { id: "voice-sheesh", time: 0.5, volume: 1.0 }
  },
  animation: { type: "bounce", speed: 1.0 }
};

const url = BrainrotEncoder.getShareUrl(complex);
const stats = BrainrotUtils.getUrlStats(complex);
console.log('URL length:', stats.fullUrlLength);
console.log('Compression:', stats.compressionRatio);
```

## License

Part of the Build a Brainrot project. See main LICENSE file for details.
