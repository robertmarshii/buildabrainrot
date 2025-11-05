/**
 * BRAINROT ENCODER/DECODER
 *
 * Handles encoding and decoding of brainrot creations to/from URL-safe strings
 * for sharing via links.
 *
 * Uses Base64 encoding with optional compression (when pako.js is available)
 */

class BrainrotEncoder {
  static VERSION = "1.0";

  /**
   * Encode brainrot data to URL-safe string
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @returns {string} URL-safe encoded string
   */
  static encode(brainrotData) {
    // Add version if not present
    const data = {
      version: this.VERSION,
      ...brainrotData
    };

    // Convert to JSON
    const json = JSON.stringify(data);

    // Compress if pako.js is available (reduces size by 60-70%)
    let processedData = json;
    let useCompression = false;

    if (typeof pako !== 'undefined') {
      try {
        const uint8array = pako.deflate(json);
        // Convert to binary string
        processedData = String.fromCharCode.apply(null, uint8array);
        useCompression = true;
      } catch (error) {
        console.warn('Compression failed, using uncompressed:', error);
      }
    }

    // Base64 encode
    const base64 = btoa(processedData);

    // Make URL-safe (replace +/= with -_~)
    let urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '~');

    // Add compression flag prefix
    urlSafe = (useCompression ? 'c_' : 'u_') + urlSafe;

    return urlSafe;
  }

  /**
   * Decode URL string to brainrot data
   *
   * @param {string} encoded - The URL-safe encoded string
   * @returns {Object} Decoded brainrot data
   * @throws {Error} If decoding fails
   */
  static decode(encoded) {
    try {
      // Check for compression flag
      let isCompressed = false;
      let data = encoded;

      if (encoded.startsWith('c_')) {
        isCompressed = true;
        data = encoded.substring(2);
      } else if (encoded.startsWith('u_')) {
        isCompressed = false;
        data = encoded.substring(2);
      }

      // Reverse URL-safe encoding
      const base64 = data
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/~/g, '=');

      // Base64 decode
      const decoded = atob(base64);

      // Decompress if needed
      let json;
      if (isCompressed) {
        if (typeof pako === 'undefined') {
          throw new Error('pako.js required for compressed data');
        }

        // Convert binary string to Uint8Array
        const uint8array = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          uint8array[i] = decoded.charCodeAt(i);
        }

        json = pako.inflate(uint8array, { to: 'string' });
      } else {
        json = decoded;
      }

      // Parse JSON
      const brainrotData = JSON.parse(json);

      // Validate version
      if (!brainrotData.version) {
        console.warn('No version found in data, assuming', this.VERSION);
        brainrotData.version = this.VERSION;
      } else if (brainrotData.version !== this.VERSION) {
        console.warn('Version mismatch: data is', brainrotData.version, 'expected', this.VERSION);
      }

      // Validate basic structure
      this.validate(brainrotData);

      return brainrotData;

    } catch (error) {
      throw new Error(`Failed to decode brainrot: ${error.message}`);
    }
  }

  /**
   * Validate decoded data structure
   *
   * @param {Object} data - The brainrot data to validate
   * @throws {Error} If validation fails
   * @returns {boolean} True if valid
   */
  static validate(data) {
    // Check required fields
    if (!data.character || !data.character.body) {
      throw new Error('Invalid brainrot: missing character body');
    }

    if (!data.scene || !data.scene.background) {
      throw new Error('Invalid brainrot: missing background');
    }

    // Optional: Check if audio structure exists
    if (data.audio) {
      if (data.audio.sfx && !Array.isArray(data.audio.sfx)) {
        throw new Error('Invalid brainrot: sfx must be an array');
      }
    }

    return true;
  }

  /**
   * Get shareable URL for brainrot
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {string} baseUrl - Base URL (defaults to current origin)
   * @returns {string} Complete shareable URL
   */
  static getShareUrl(brainrotData, baseUrl = window.location.origin) {
    const encoded = this.encode(brainrotData);
    return `${baseUrl}/b/${encoded}`;
  }

  /**
   * Extract brainrot data from current URL
   *
   * @returns {Object} Decoded brainrot data from URL
   * @throws {Error} If no brainrot data found in URL
   */
  static fromCurrentUrl() {
    const path = window.location.pathname;

    // Try /b/{encoded} format
    const match = path.match(/\/b\/(.+)/);
    if (match) {
      return this.decode(match[1]);
    }

    // Try query parameter format (?d=...)
    const params = new URLSearchParams(window.location.search);
    if (params.has('d')) {
      return this.decode(params.get('d'));
    }

    throw new Error('No brainrot data found in URL');
  }

  /**
   * Get URL info/stats
   *
   * @param {string} encoded - The encoded string
   * @returns {Object} Information about the encoded URL
   */
  static getUrlInfo(encoded) {
    const isCompressed = encoded.startsWith('c_');
    const fullUrl = `${window.location.origin}/b/${encoded}`;

    return {
      length: encoded.length,
      fullUrlLength: fullUrl.length,
      compressed: isCompressed,
      twitterSafe: fullUrl.length < 280,
      socialMediaSafe: fullUrl.length < 2000,
      readable: !isCompressed
    };
  }
}

// Export for use in Node.js tests (if running in Node environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrainrotEncoder;
}
