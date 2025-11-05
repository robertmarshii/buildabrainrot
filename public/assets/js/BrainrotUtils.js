/**
 * BRAINROT UTILITIES
 *
 * Helper functions for working with brainrot creations
 * Includes sharing, copying, QR codes, and embed codes
 */

class BrainrotUtils {
  /**
   * Copy share link to clipboard
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {Function} onSuccess - Callback for successful copy
   * @param {Function} onError - Callback for copy error
   * @returns {Promise<string>} The copied URL
   */
  static async copyShareLink(brainrotData, onSuccess = null, onError = null) {
    try {
      const url = BrainrotEncoder.getShareUrl(brainrotData);

      // Try using modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);

        if (onSuccess) {
          onSuccess(url);
        }

        return url;
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (onSuccess) {
          onSuccess(url);
        }
        return url;
      } else {
        throw new Error('Copy command failed');
      }

    } catch (error) {
      console.error('Failed to copy link:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  /**
   * Generate social media share URLs
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {Object} options - Optional metadata (title, description)
   * @returns {Object} Social media share URLs
   */
  static getSocialShareUrls(brainrotData, options = {}) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    const encodedUrl = encodeURIComponent(url);

    const title = options.title || 'Check out my brainrot creation!';
    const encodedTitle = encodeURIComponent(title);

    const text = options.text || 'I made this on Build a Brainrot! 🧠🔥';
    const encodedText = encodeURIComponent(text);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
    };
  }

  /**
   * Generate QR code for sharing
   * Note: Requires qrcode.js library (https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js)
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {HTMLElement} container - Container element for QR code
   * @param {Object} options - QR code options
   * @returns {Object} QR code instance
   */
  static generateQRCode(brainrotData, container, options = {}) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);

    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
      console.error('QRCode library not loaded. Include qrcode.js first.');
      return null;
    }

    const qrOptions = {
      width: options.width || 256,
      height: options.height || 256,
      colorDark: options.colorDark || '#000000',
      colorLight: options.colorLight || '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    };

    return new QRCode(container, {
      text: url,
      ...qrOptions
    });
  }

  /**
   * Generate embed code (iframe)
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {Object} options - Embed options (width, height)
   * @returns {string} HTML embed code
   */
  static getEmbedCode(brainrotData, options = {}) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    const width = options.width || 600;
    const height = options.height || 400;
    const title = options.title || 'Brainrot Creation';

    return `<iframe src="${url}" width="${width}" height="${height}" ` +
           `frameborder="0" allowfullscreen title="${title}"></iframe>`;
  }

  /**
   * Download brainrot as JSON file
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {string} filename - Filename for download
   */
  static downloadAsJSON(brainrotData, filename = 'my-brainrot.json') {
    const json = JSON.stringify(brainrotData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Load brainrot from JSON file
   *
   * @param {File} file - JSON file
   * @returns {Promise<Object>} Loaded brainrot data
   */
  static loadFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get URL size and compression stats
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @returns {Object} URL statistics
   */
  static getUrlStats(brainrotData) {
    const encoded = BrainrotEncoder.encode(brainrotData);
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    const json = JSON.stringify(brainrotData);

    const stats = BrainrotEncoder.getUrlInfo(encoded);

    return {
      ...stats,
      originalSize: json.length,
      encodedSize: encoded.length,
      fullUrl: url,
      compressionRatio: ((1 - (encoded.length / json.length)) * 100).toFixed(1) + '%',
      warnings: [
        !stats.twitterSafe && 'URL too long for Twitter',
        !stats.socialMediaSafe && 'URL too long for some social media platforms'
      ].filter(Boolean)
    };
  }

  /**
   * Generate shareable image/card for social media
   * (Requires html2canvas or similar library)
   *
   * @param {HTMLElement} element - Element to capture
   * @param {Object} options - Image options
   * @returns {Promise<string>} Data URL of captured image
   */
  static async generateShareImage(element, options = {}) {
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas library required for image generation');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: options.scale || 2,
      logging: false,
      ...options
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Create a shareable short description
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @returns {string} Human-readable description
   */
  static getDescription(brainrotData) {
    const character = brainrotData.character?.body || 'unknown';
    const background = brainrotData.scene?.background || 'unknown';
    const music = brainrotData.audio?.music?.id || 'no music';

    // Convert IDs to readable names
    const charName = character.replace('char-body-', '').replace(/-/g, ' ');
    const bgName = background.replace('bg-', '').replace(/-/g, ' ');
    const musicName = music.replace('music-', '').replace(/-/g, ' ');

    return `A ${charName} in ${bgName} with ${musicName}`;
  }

  /**
   * Show share modal/dialog (requires UI implementation)
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @param {Object} options - Modal options
   */
  static showShareDialog(brainrotData, options = {}) {
    const url = BrainrotEncoder.getShareUrl(brainrotData);
    const shareUrls = this.getSocialShareUrls(brainrotData, options);

    // Dispatch custom event for UI to handle
    const event = new CustomEvent('brainrot:share', {
      detail: {
        brainrotData,
        url,
        shareUrls,
        stats: this.getUrlStats(brainrotData)
      }
    });

    document.dispatchEvent(event);

    return { url, shareUrls };
  }

  /**
   * Validate URL before sharing (ensure it's not too long)
   *
   * @param {Object} brainrotData - The brainrot creation data
   * @returns {Object} Validation result
   */
  static validateForSharing(brainrotData) {
    const stats = this.getUrlStats(brainrotData);
    const issues = [];

    if (!stats.socialMediaSafe) {
      issues.push({
        severity: 'error',
        message: 'URL is too long (> 2000 chars). Consider simplifying your brainrot.'
      });
    } else if (!stats.twitterSafe) {
      issues.push({
        severity: 'warning',
        message: 'URL is too long for Twitter (> 280 chars).'
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      stats
    };
  }
}

// Export for use in Node.js tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrainrotUtils;
}
