/**
 * CHARACTER CANVAS
 *
 * Real-time character rendering system with layered composition
 * Handles body, accessories, face, and color tinting
 */

class CharacterCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas #${canvasId} not found`);
    }

    this.ctx = this.canvas.getContext('2d');
    this.width = 512;
    this.height = 512;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.character = {
      body: null,
      bodyColor: '#808080',
      accessories: [],
      face: {
        eyes: null,
        mouth: null
      }
    };

    this.assetManager = window.assetManager;
    this.rendering = false;

    // Drag state
    this.dragging = {
      active: false,
      accessoryIndex: -1,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    };

    // Setup drag event listeners
    this._setupDragListeners();
  }

  /**
   * Setup mouse/touch event listeners for dragging
   * @private
   */
  _setupDragListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this._onDragStart(e));
    this.canvas.addEventListener('mousemove', (e) => this._onDragMove(e));
    this.canvas.addEventListener('mouseup', (e) => this._onDragEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this._onDragEnd(e));

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this._onDragStart(touch);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this._onDragMove(touch);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this._onDragEnd(e);
    });

    // Add cursor style
    this.canvas.style.cursor = 'grab';
  }

  /**
   * Handle drag start
   * @private
   */
  _onDragStart(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an accessory (iterate backwards to check top items first)
    for (let i = this.character.accessories.length - 1; i >= 0; i--) {
      const acc = this.character.accessories[i];
      if (this._isPointInAccessory(x, y, acc)) {
        this.dragging.active = true;
        this.dragging.accessoryIndex = i;
        this.dragging.startX = x;
        this.dragging.startY = y;
        this.dragging.offsetX = x - acc.position.x;
        this.dragging.offsetY = y - acc.position.y;
        this.canvas.style.cursor = 'grabbing';
        break;
      }
    }
  }

  /**
   * Handle drag move
   * @private
   */
  _onDragMove(e) {
    if (!this.dragging.active) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const acc = this.character.accessories[this.dragging.accessoryIndex];
    if (acc) {
      acc.position.x = x - this.dragging.offsetX;
      acc.position.y = y - this.dragging.offsetY;
      this.render();
    }
  }

  /**
   * Handle drag end
   * @private
   */
  _onDragEnd(e) {
    if (this.dragging.active) {
      this.dragging.active = false;
      this.dragging.accessoryIndex = -1;
      this.canvas.style.cursor = 'grab';
    }
  }

  /**
   * Check if point is inside accessory bounds
   * @private
   */
  _isPointInAccessory(x, y, accessory) {
    if (!accessory || !accessory.image) return false;

    const hw = accessory.image.width / 2;
    const hh = accessory.image.height / 2;
    const px = accessory.position.x;
    const py = accessory.position.y;

    return x >= px - hw && x <= px + hw && y >= py - hh && y <= py + hh;
  }

  /**
   * Set character body
   *
   * @param {string} bodyId - Asset ID for body
   * @returns {Promise<void>}
   */
  async setBody(bodyId) {
    try {
      const image = await this.assetManager.loadImage(bodyId);
      const metadata = this.assetManager.findAsset(bodyId);

      this.character.body = {
        id: bodyId,
        image: image,
        metadata: metadata
      };

      await this.render();
    } catch (error) {
      console.error('Failed to load body:', error);
      throw error;
    }
  }

  /**
   * Set body color with tinting
   *
   * @param {string} hexColor - Hex color string
   */
  setBodyColor(hexColor) {
    this.character.bodyColor = hexColor;
    this.render();
  }

  /**
   * Add accessory to character
   *
   * @param {string} accessoryId - Asset ID for accessory
   * @param {Object} position - Position override {x, y}
   * @param {number} scale - Scale override
   * @param {number} rotation - Rotation in degrees
   * @returns {Promise<Object>} The added accessory object
   */
  async addAccessory(accessoryId, position = null, scale = 1.0, rotation = 0) {
    try {
      const image = await this.assetManager.loadImage(accessoryId);
      const metadata = this.assetManager.findAsset(accessoryId);

      // Use attachment points from body metadata if available
      let finalPosition = position;
      if (!finalPosition && this.character.body && this.character.body.metadata) {
        const attachmentPoints = this.character.body.metadata.attachmentPoints;
        if (attachmentPoints) {
          // Try to match accessory type with attachment point
          if (accessoryId.includes('head')) {
            finalPosition = attachmentPoints.head;
          } else if (accessoryId.includes('feet')) {
            finalPosition = attachmentPoints.feet;
          } else if (accessoryId.includes('hand')) {
            finalPosition = attachmentPoints.hand;
          }
        }
      }

      // Default to center if no position
      if (!finalPosition) {
        finalPosition = {
          x: this.width / 2,
          y: this.height / 2
        };
      }

      const accessory = {
        id: accessoryId,
        image: image,
        metadata: metadata,
        position: finalPosition,
        scale: scale,
        rotation: rotation
      };

      this.character.accessories.push(accessory);
      await this.render();

      return accessory;
    } catch (error) {
      console.error('Failed to add accessory:', error);
      throw error;
    }
  }

  /**
   * Remove accessory
   *
   * @param {number} index - Index of accessory to remove
   */
  removeAccessory(index) {
    if (index >= 0 && index < this.character.accessories.length) {
      this.character.accessories.splice(index, 1);
      this.render();
    }
  }

  /**
   * Move accessory
   *
   * @param {number} index - Index of accessory
   * @param {number} deltaX - X movement
   * @param {number} deltaY - Y movement
   */
  moveAccessory(index, deltaX, deltaY) {
    if (index >= 0 && index < this.character.accessories.length) {
      const acc = this.character.accessories[index];
      acc.position.x += deltaX;
      acc.position.y += deltaY;
      this.render();
    }
  }

  /**
   * Set face feature
   *
   * @param {string} feature - 'eyes' or 'mouth'
   * @param {string} assetId - Asset ID
   * @returns {Promise<void>}
   */
  async setFace(feature, assetId) {
    if (!['eyes', 'mouth'].includes(feature)) {
      throw new Error(`Invalid face feature: ${feature}`);
    }

    try {
      const image = await this.assetManager.loadImage(assetId);
      this.character.face[feature] = {
        id: assetId,
        image: image
      };
      await this.render();
    } catch (error) {
      console.error(`Failed to set ${feature}:`, error);
      throw error;
    }
  }

  /**
   * Clear character (reset)
   */
  clear() {
    this.character = {
      body: null,
      bodyColor: '#808080',
      accessories: [],
      face: {
        eyes: null,
        mouth: null
      }
    };
    this.render();
  }

  /**
   * Render character to canvas
   *
   * @returns {Promise<void>}
   */
  async render() {
    if (this.rendering) {
      return; // Prevent concurrent renders
    }

    this.rendering = true;

    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw background (checkerboard for transparency)
      this._drawCheckerboard();

      // Draw character body (with color tint)
      if (this.character.body) {
        await this._drawColoredBody();
      }

      // Draw accessories
      for (const accessory of this.character.accessories) {
        this._drawAccessory(accessory);
      }

      // Draw face features
      if (this.character.face.eyes) {
        this._drawFaceFeature(this.character.face.eyes, 'eyes');
      }

      if (this.character.face.mouth) {
        this._drawFaceFeature(this.character.face.mouth, 'mouth');
      }

    } finally {
      this.rendering = false;
    }
  }

  /**
   * Draw checkerboard background
   *
   * @private
   */
  _drawCheckerboard() {
    const size = 20;
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#e0e0e0';
    for (let y = 0; y < this.height; y += size) {
      for (let x = 0; x < this.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          this.ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  /**
   * Draw body with color tint
   *
   * @private
   */
  async _drawColoredBody() {
    const body = this.character.body;
    if (!body || !body.image) return;

    // If grayscale body, apply color tint
    if (this.character.bodyColor !== '#808080' && body.metadata.colorizable) {
      // Create offscreen canvas for tinting
      const offscreen = document.createElement('canvas');
      offscreen.width = body.image.width;
      offscreen.height = body.image.height;
      const offCtx = offscreen.getContext('2d');

      // Draw original image
      offCtx.drawImage(body.image, 0, 0);

      // Apply color tint
      offCtx.globalCompositeOperation = 'multiply';
      offCtx.fillStyle = this.character.bodyColor;
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

      // Restore alpha
      offCtx.globalCompositeOperation = 'destination-in';
      offCtx.drawImage(body.image, 0, 0);

      // Draw to main canvas (centered)
      const x = (this.width - offscreen.width) / 2;
      const y = (this.height - offscreen.height) / 2;
      this.ctx.drawImage(offscreen, x, y);
    } else {
      // Draw without tinting (centered)
      const x = (this.width - body.image.width) / 2;
      const y = (this.height - body.image.height) / 2;
      this.ctx.drawImage(body.image, x, y);
    }
  }

  /**
   * Draw accessory
   *
   * @private
   * @param {Object} accessory - Accessory object
   */
  _drawAccessory(accessory) {
    if (!accessory || !accessory.image) return;

    this.ctx.save();

    // Translate to position
    this.ctx.translate(accessory.position.x, accessory.position.y);

    // Apply rotation
    if (accessory.rotation) {
      this.ctx.rotate((accessory.rotation * Math.PI) / 180);
    }

    // Apply scale
    if (accessory.scale && accessory.scale !== 1.0) {
      this.ctx.scale(accessory.scale, accessory.scale);
    }

    // Draw centered on position
    const x = -accessory.image.width / 2;
    const y = -accessory.image.height / 2;
    this.ctx.drawImage(accessory.image, x, y);

    this.ctx.restore();
  }

  /**
   * Draw face feature
   *
   * @private
   * @param {Object} feature - Face feature object
   * @param {string} type - 'eyes' or 'mouth'
   */
  _drawFaceFeature(feature, type) {
    if (!feature || !feature.image) return;

    // Get attachment point from body if available
    let position = { x: this.width / 2, y: this.height / 2 };

    if (this.character.body && this.character.body.metadata) {
      const attachments = this.character.body.metadata.attachmentPoints;
      if (attachments && attachments.head) {
        position = { ...attachments.head };
        // Offset based on feature type
        if (type === 'mouth') {
          position.y += 30; // Below eyes
        }
      }
    }

    // Draw centered on position
    const x = position.x - feature.image.width / 2;
    const y = position.y - feature.image.height / 2;
    this.ctx.drawImage(feature.image, x, y);
  }

  /**
   * Export canvas as PNG
   *
   * @param {string} filename - Filename for download
   */
  exportPNG(filename = 'my-brainrot.png') {
    const dataUrl = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  /**
   * Get current character data for URL encoding
   *
   * @returns {Object} Character data in BrainrotData format
   */
  getCharacterData() {
    return {
      body: this.character.body?.id || null,
      color: this.character.bodyColor,
      accessories: this.character.accessories.map(acc => ({
        id: acc.id,
        position: acc.position,
        scale: acc.scale,
        rotation: acc.rotation
      })),
      face: {
        eyes: this.character.face.eyes?.id || null,
        mouth: this.character.face.mouth?.id || null
      }
    };
  }

  /**
   * Load character data from BrainrotData format
   *
   * @param {Object} characterData - Character data
   * @returns {Promise<void>}
   */
  async loadCharacterData(characterData) {
    this.clear();

    if (characterData.body) {
      await this.setBody(characterData.body);
    }

    if (characterData.color) {
      this.setBodyColor(characterData.color);
    }

    if (characterData.accessories) {
      for (const acc of characterData.accessories) {
        await this.addAccessory(acc.id, acc.position, acc.scale, acc.rotation);
      }
    }

    if (characterData.face) {
      if (characterData.face.eyes) {
        await this.setFace('eyes', characterData.face.eyes);
      }
      if (characterData.face.mouth) {
        await this.setFace('mouth', characterData.face.mouth);
      }
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterCanvas;
}
