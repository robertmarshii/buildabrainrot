/**
 * BRAINROT VALIDATOR
 *
 * Security and data validation for brainrot creations
 * Prevents injection attacks, validates asset IDs, and sanitizes user input
 */

class BrainrotValidator {
  /**
   * Validate all asset IDs against manifest
   *
   * @param {Object} data - Brainrot data to validate
   * @param {Object} manifest - Asset manifest
   * @throws {Error} If invalid asset IDs found
   */
  static validateAssetIds(data, manifest) {
    // Collect all asset IDs from the brainrot
    const assetIds = this.collectAssetIds(data);

    // Check each ID exists in manifest
    const invalidIds = assetIds.filter(id => {
      return !this.assetExistsInManifest(id, manifest);
    });

    if (invalidIds.length > 0) {
      throw new Error(`Invalid asset IDs: ${invalidIds.join(', ')}`);
    }

    return true;
  }

  /**
   * Collect all asset IDs from brainrot data
   *
   * @param {Object} data - Brainrot data
   * @returns {Array<string>} Array of asset IDs
   */
  static collectAssetIds(data) {
    const ids = [];

    // Character body
    if (data.character?.body) {
      ids.push(data.character.body);
    }

    // Accessories
    if (data.character?.accessories) {
      data.character.accessories.forEach(acc => {
        if (acc.id) ids.push(acc.id);
      });
    }

    // Face elements
    if (data.character?.face) {
      if (data.character.face.eyes) ids.push(data.character.face.eyes);
      if (data.character.face.mouth) ids.push(data.character.face.mouth);
    }

    // Background
    if (data.scene?.background) {
      ids.push(data.scene.background);
    }

    // Stickers
    if (data.scene?.stickers) {
      data.scene.stickers.forEach(sticker => {
        if (sticker.id) ids.push(sticker.id);
      });
    }

    // Audio - music
    if (data.audio?.music?.id) {
      ids.push(data.audio.music.id);
    }

    // Audio - SFX
    if (data.audio?.sfx) {
      data.audio.sfx.forEach(sfx => {
        if (sfx.id) ids.push(sfx.id);
      });
    }

    // Audio - voice
    if (data.audio?.voice?.id) {
      ids.push(data.audio.voice.id);
    }

    return ids.filter(Boolean); // Remove any null/undefined
  }

  /**
   * Check if asset exists in manifest
   *
   * @param {string} assetId - Asset ID to check
   * @param {Object} manifest - Asset manifest
   * @returns {boolean} True if asset exists
   */
  static assetExistsInManifest(assetId, manifest) {
    // Search in images
    if (manifest.images) {
      // Character bodies
      if (manifest.images.characters?.bodies) {
        if (manifest.images.characters.bodies.some(a => a.id === assetId)) {
          return true;
        }
      }

      // Accessories
      if (manifest.images.characters?.accessories) {
        if (manifest.images.characters.accessories.some(a => a.id === assetId)) {
          return true;
        }
      }

      // Backgrounds
      if (manifest.images.backgrounds) {
        if (manifest.images.backgrounds.some(a => a.id === assetId)) {
          return true;
        }
      }

      // Stickers
      if (manifest.images.stickers) {
        if (manifest.images.stickers.some(a => a.id === assetId)) {
          return true;
        }
      }
    }

    // Search in audio
    if (manifest.audio) {
      // Music
      if (manifest.audio.music) {
        if (manifest.audio.music.some(a => a.id === assetId)) {
          return true;
        }
      }

      // SFX
      if (manifest.audio.sfx) {
        for (const category in manifest.audio.sfx) {
          if (Array.isArray(manifest.audio.sfx[category])) {
            if (manifest.audio.sfx[category].some(a => a.id === assetId)) {
              return true;
            }
          }
        }
      }

      // Voices
      if (manifest.audio.voices) {
        if (manifest.audio.voices.some(a => a.id === assetId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Sanitize user text input
   *
   * @param {string} text - User-provided text
   * @param {number} maxLength - Maximum allowed length (default 100)
   * @returns {string} Sanitized text
   */
  static sanitizeText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove HTML tags
    let clean = text.replace(/<[^>]*>/g, '');

    // Remove script tags specifically (double check)
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Encode special HTML entities
    clean = clean
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Limit length
    clean = clean.substring(0, maxLength);

    return clean.trim();
  }

  /**
   * Validate positions are within canvas bounds
   *
   * @param {Object} data - Brainrot data
   * @param {Object} canvasSize - Canvas dimensions {width, height}
   * @throws {Error} If positions out of bounds
   */
  static validatePositions(data, canvasSize = { width: 1920, height: 1080 }) {
    const items = [];

    // Collect all positioned items
    if (data.character?.accessories) {
      items.push(...data.character.accessories);
    }

    if (data.scene?.stickers) {
      items.push(...data.scene.stickers);
    }

    if (data.scene?.text) {
      items.push(...data.scene.text);
    }

    // Validate each position
    items.forEach((item, index) => {
      if (item.position) {
        const { x, y } = item.position;

        if (x < 0 || x > canvasSize.width || y < 0 || y > canvasSize.height) {
          throw new Error(
            `Position out of bounds at item ${index}: {x: ${x}, y: ${y}}. ` +
            `Canvas size: ${canvasSize.width}x${canvasSize.height}`
          );
        }
      }
    });

    return true;
  }

  /**
   * Validate audio timing values
   *
   * @param {Object} data - Brainrot data
   * @param {number} maxDuration - Maximum duration in seconds
   * @throws {Error} If timing values invalid
   */
  static validateAudioTiming(data, maxDuration = 30) {
    if (!data.audio) {
      return true;
    }

    // Validate SFX timing
    if (data.audio.sfx) {
      data.audio.sfx.forEach((sfx, index) => {
        if (typeof sfx.time !== 'number') {
          throw new Error(`SFX ${index}: time must be a number`);
        }

        if (sfx.time < 0) {
          throw new Error(`SFX ${index}: time cannot be negative (${sfx.time})`);
        }

        if (sfx.time > maxDuration) {
          throw new Error(
            `SFX ${index}: time ${sfx.time}s exceeds max duration ${maxDuration}s`
          );
        }
      });
    }

    // Validate voice timing
    if (data.audio.voice && typeof data.audio.voice.time === 'number') {
      if (data.audio.voice.time < 0 || data.audio.voice.time > maxDuration) {
        throw new Error(
          `Voice timing ${data.audio.voice.time}s out of range (0-${maxDuration}s)`
        );
      }
    }

    return true;
  }

  /**
   * Validate numeric ranges (scale, rotation, volume, etc.)
   *
   * @param {Object} data - Brainrot data
   * @throws {Error} If values out of range
   */
  static validateNumericRanges(data) {
    const items = [];

    // Collect all items with numeric properties
    if (data.character?.accessories) {
      items.push(...data.character.accessories);
    }
    if (data.scene?.stickers) {
      items.push(...data.scene.stickers);
    }

    items.forEach((item, index) => {
      // Scale: 0.1 to 5.0
      if (item.scale !== undefined) {
        if (item.scale < 0.1 || item.scale > 5.0) {
          throw new Error(`Item ${index}: scale ${item.scale} out of range (0.1-5.0)`);
        }
      }

      // Rotation: -360 to 360 degrees
      if (item.rotation !== undefined) {
        if (item.rotation < -360 || item.rotation > 360) {
          throw new Error(`Item ${index}: rotation ${item.rotation} out of range (-360 to 360)`);
        }
      }
    });

    // Validate volume levels (0.0 to 1.0)
    if (data.audio) {
      const audioItems = [
        data.audio.music,
        data.audio.voice,
        ...(data.audio.sfx || [])
      ].filter(Boolean);

      audioItems.forEach((item, index) => {
        if (item.volume !== undefined) {
          if (item.volume < 0 || item.volume > 1) {
            throw new Error(`Audio ${index}: volume ${item.volume} out of range (0-1)`);
          }
        }
      });
    }

    return true;
  }

  /**
   * Validate color values
   *
   * @param {Object} data - Brainrot data
   * @throws {Error} If invalid color values
   */
  static validateColors(data) {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;

    // Character color
    if (data.character?.color) {
      if (!hexColorRegex.test(data.character.color)) {
        throw new Error(`Invalid character color: ${data.character.color}`);
      }
    }

    // Text colors
    if (data.scene?.text) {
      data.scene.text.forEach((textItem, index) => {
        if (textItem.color && !hexColorRegex.test(textItem.color)) {
          throw new Error(`Invalid text color at ${index}: ${textItem.color}`);
        }
      });
    }

    return true;
  }

  /**
   * Comprehensive validation (runs all checks)
   *
   * @param {Object} data - Brainrot data
   * @param {Object} manifest - Asset manifest (optional)
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateAll(data, manifest = null, options = {}) {
    const errors = [];
    const warnings = [];

    try {
      // Basic structure validation
      BrainrotEncoder.validate(data);
    } catch (error) {
      errors.push(`Structure: ${error.message}`);
    }

    // Asset ID validation (if manifest provided)
    if (manifest) {
      try {
        this.validateAssetIds(data, manifest);
      } catch (error) {
        errors.push(`Assets: ${error.message}`);
      }
    } else {
      warnings.push('Manifest not provided, skipping asset ID validation');
    }

    // Position validation
    try {
      this.validatePositions(data, options.canvasSize);
    } catch (error) {
      errors.push(`Positions: ${error.message}`);
    }

    // Audio timing validation
    try {
      this.validateAudioTiming(data, options.maxDuration);
    } catch (error) {
      errors.push(`Audio timing: ${error.message}`);
    }

    // Numeric ranges validation
    try {
      this.validateNumericRanges(data);
    } catch (error) {
      errors.push(`Numeric ranges: ${error.message}`);
    }

    // Color validation
    try {
      this.validateColors(data);
    } catch (error) {
      errors.push(`Colors: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export for use in Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrainrotValidator;
}
