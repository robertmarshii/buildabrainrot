/**
 * SCENE CANVAS
 *
 * Extended canvas for full scene composition
 * Handles backgrounds, stickers, text bubbles, and interactions
 * Extends CharacterCanvas with scene-specific features
 */

class SceneCanvas extends CharacterCanvas {
  constructor(canvasId) {
    super(canvasId);

    // Override dimensions for full scene
    this.width = 1920;
    this.height = 1080;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Scale for display (show smaller on screen)
    this.displayScale = 0.5;
    this.canvas.style.width = (this.width * this.displayScale) + 'px';
    this.canvas.style.height = (this.height * this.displayScale) + 'px';

    this.scene = {
      background: null,
      stickers: [],
      texts: [],
      effects: []
    };

    this.selectedItem = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.setupInteractions();
  }

  /**
   * Set background image
   *
   * @param {string} backgroundId - Asset ID
   * @returns {Promise<void>}
   */
  async setBackground(backgroundId) {
    try {
      const image = await this.assetManager.loadImage(backgroundId);
      const metadata = this.assetManager.findAsset(backgroundId);

      this.scene.background = {
        id: backgroundId,
        image: image,
        metadata: metadata
      };

      await this.render();
    } catch (error) {
      console.error('Failed to load background:', error);
      throw error;
    }
  }

  /**
   * Add sticker to scene
   *
   * @param {string} stickerId - Asset ID
   * @param {Object} position - Position {x, y}
   * @returns {Promise<Object>} Added sticker
   */
  async addSticker(stickerId, position = null) {
    try {
      const image = await this.assetManager.loadImage(stickerId);
      const metadata = this.assetManager.findAsset(stickerId);

      const sticker = {
        id: stickerId,
        image: image,
        metadata: metadata,
        position: position || {
          x: this.width / 2,
          y: this.height / 2
        },
        scale: 1.5,
        rotation: 0,
        zIndex: this.scene.stickers.length
      };

      this.scene.stickers.push(sticker);
      await this.render();

      return sticker;
    } catch (error) {
      console.error('Failed to load sticker:', error);
      throw error;
    }
  }

  /**
   * Add text bubble to scene
   *
   * @param {string} text - Text content
   * @param {string} style - Text style ('bubble', 'comic', 'wavy')
   * @param {Object} position - Position {x, y}
   * @returns {Object} Added text
   */
  addText(text, style = 'bubble', position = null) {
    const textObj = {
      content: text,
      style: style,
      position: position || {
        x: this.width / 2,
        y: 200
      },
      fontSize: 60,
      color: '#FFFFFF',
      backgroundColor: '#667eea',
      outlineColor: '#333333',
      rotation: 0,
      zIndex: this.scene.texts.length
    };

    this.scene.texts.push(textObj);
    this.render();

    return textObj;
  }

  /**
   * Remove sticker
   *
   * @param {number} index - Sticker index
   */
  removeSticker(index) {
    if (index >= 0 && index < this.scene.stickers.length) {
      this.scene.stickers.splice(index, 1);
      this.render();
    }
  }

  /**
   * Remove text
   *
   * @param {number} index - Text index
   */
  removeText(index) {
    if (index >= 0 && index < this.scene.texts.length) {
      this.scene.texts.splice(index, 1);
      this.render();
    }
  }

  /**
   * Move layer (change z-order)
   *
   * @param {string} type - 'sticker' or 'text'
   * @param {number} index - Item index
   * @param {string} direction - 'up' or 'down'
   */
  moveLayer(type, index, direction) {
    const items = type === 'sticker' ? this.scene.stickers : this.scene.texts;

    if (direction === 'up' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else if (direction === 'down' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    }

    this.render();
  }

  /**
   * Setup mouse/touch interactions for drag-and-drop
   */
  setupInteractions() {
    const getScaledPosition = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.displayScale;
      const y = (e.clientY - rect.top) / this.displayScale;
      return { x, y };
    };

    // Mouse down / touch start
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getScaledPosition(e);
      this.handleInteractionStart(pos);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getScaledPosition(touch);
      this.handleInteractionStart(pos);
    });

    // Mouse move / touch move
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const pos = getScaledPosition(e);
        this.handleInteractionMove(pos);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const pos = getScaledPosition(touch);
        this.handleInteractionMove(pos);
      }
    });

    // Mouse up / touch end
    const endHandler = () => {
      this.isDragging = false;
      this.selectedItem = null;
    };

    this.canvas.addEventListener('mouseup', endHandler);
    this.canvas.addEventListener('touchend', endHandler);
    this.canvas.addEventListener('mouseleave', endHandler);
  }

  /**
   * Handle interaction start (mouse down / touch)
   *
   * @private
   */
  handleInteractionStart(pos) {
    // Check if clicked on any item (reverse order for top-most)
    for (let i = this.scene.stickers.length - 1; i >= 0; i--) {
      const sticker = this.scene.stickers[i];
      if (this.isPointInItem(pos, sticker)) {
        this.selectedItem = { type: 'sticker', index: i, item: sticker };
        this.isDragging = true;
        this.dragOffset = {
          x: pos.x - sticker.position.x,
          y: pos.y - sticker.position.y
        };
        return;
      }
    }

    for (let i = this.scene.texts.length - 1; i >= 0; i--) {
      const text = this.scene.texts[i];
      if (this.isPointInText(pos, text)) {
        this.selectedItem = { type: 'text', index: i, item: text };
        this.isDragging = true;
        this.dragOffset = {
          x: pos.x - text.position.x,
          y: pos.y - text.position.y
        };
        return;
      }
    }
  }

  /**
   * Handle interaction move (drag)
   *
   * @private
   */
  handleInteractionMove(pos) {
    if (!this.isDragging || !this.selectedItem) return;

    const item = this.selectedItem.item;
    item.position.x = pos.x - this.dragOffset.x;
    item.position.y = pos.y - this.dragOffset.y;

    this.render();
  }

  /**
   * Check if point is in item bounds
   *
   * @private
   */
  isPointInItem(point, item) {
    if (!item.image) return false;

    const halfWidth = (item.image.width * item.scale) / 2;
    const halfHeight = (item.image.height * item.scale) / 2;

    return (
      point.x >= item.position.x - halfWidth &&
      point.x <= item.position.x + halfWidth &&
      point.y >= item.position.y - halfHeight &&
      point.y <= item.position.y + halfHeight
    );
  }

  /**
   * Check if point is in text bounds
   *
   * @private
   */
  isPointInText(point, text) {
    // Rough estimate based on font size and text length
    const width = text.content.length * text.fontSize * 0.6;
    const height = text.fontSize * 1.5;

    return (
      point.x >= text.position.x - width / 2 &&
      point.x <= text.position.x + width / 2 &&
      point.y >= text.position.y - height / 2 &&
      point.y <= text.position.y + height / 2
    );
  }

  /**
   * Render full scene (override parent)
   *
   * @returns {Promise<void>}
   */
  async render() {
    if (this.rendering) return;

    this.rendering = true;

    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw background
      if (this.scene.background && this.scene.background.image) {
        this.ctx.drawImage(
          this.scene.background.image,
          0, 0,
          this.width, this.height
        );
      } else {
        // Default gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }

      // 2. Draw character (centered)
      if (this.character.body) {
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        await this._drawColoredBody();
        this.ctx.restore();

        // Draw character accessories
        for (const accessory of this.character.accessories) {
          this.ctx.save();
          this.ctx.translate(this.width / 2, this.height / 2);
          this._drawAccessory(accessory);
          this.ctx.restore();
        }

        // Draw character face
        if (this.character.face.eyes) {
          this.ctx.save();
          this.ctx.translate(this.width / 2, this.height / 2);
          this._drawFaceFeature(this.character.face.eyes, 'eyes');
          this.ctx.restore();
        }

        if (this.character.face.mouth) {
          this.ctx.save();
          this.ctx.translate(this.width / 2, this.height / 2);
          this._drawFaceFeature(this.character.face.mouth, 'mouth');
          this.ctx.restore();
        }
      }

      // 3. Draw stickers
      for (const sticker of this.scene.stickers) {
        this._drawSticker(sticker);
      }

      // 4. Draw text bubbles
      for (const text of this.scene.texts) {
        this._drawText(text);
      }

    } finally {
      this.rendering = false;
    }
  }

  /**
   * Draw sticker
   *
   * @private
   */
  _drawSticker(sticker) {
    if (!sticker.image) return;

    this.ctx.save();

    this.ctx.translate(sticker.position.x, sticker.position.y);

    if (sticker.rotation) {
      this.ctx.rotate((sticker.rotation * Math.PI) / 180);
    }

    if (sticker.scale) {
      this.ctx.scale(sticker.scale, sticker.scale);
    }

    const x = -sticker.image.width / 2;
    const y = -sticker.image.height / 2;
    this.ctx.drawImage(sticker.image, x, y);

    this.ctx.restore();
  }

  /**
   * Draw text bubble
   *
   * @private
   */
  _drawText(text) {
    this.ctx.save();

    this.ctx.translate(text.position.x, text.position.y);

    if (text.rotation) {
      this.ctx.rotate((text.rotation * Math.PI) / 180);
    }

    // Set font
    this.ctx.font = `bold ${text.fontSize}px "Comic Sans MS", Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Measure text
    const metrics = this.ctx.measureText(text.content);
    const textWidth = metrics.width;
    const textHeight = text.fontSize * 1.2;

    // Draw bubble based on style
    if (text.style === 'bubble') {
      this._drawBubbleBackground(textWidth, textHeight, text.backgroundColor);
    } else if (text.style === 'comic') {
      this._drawComicBackground(textWidth, textHeight, text.backgroundColor);
    }

    // Draw text outline
    this.ctx.strokeStyle = text.outlineColor || '#000';
    this.ctx.lineWidth = 6;
    this.ctx.strokeText(text.content, 0, 0);

    // Draw text fill
    this.ctx.fillStyle = text.color;
    this.ctx.fillText(text.content, 0, 0);

    this.ctx.restore();
  }

  /**
   * Draw bubble background
   *
   * @private
   */
  _drawBubbleBackground(width, height, color) {
    const padding = 30;
    const radius = 30;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(
      -width / 2 - padding,
      -height / 2 - padding,
      width + padding * 2,
      height + padding * 2,
      radius
    );
    this.ctx.fill();

    // Draw pointer (optional)
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2 + padding);
    this.ctx.lineTo(-20, height / 2 + padding + 30);
    this.ctx.lineTo(20, height / 2 + padding);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw comic style background
   *
   * @private
   */
  _drawComicBackground(width, height, color) {
    const padding = 25;

    // Jagged comic style
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 4;

    this.ctx.beginPath();
    this.ctx.moveTo(-width / 2 - padding, -height / 2 - padding);
    this.ctx.lineTo(width / 2 + padding, -height / 2 - padding);
    this.ctx.lineTo(width / 2 + padding + 10, 0);
    this.ctx.lineTo(width / 2 + padding, height / 2 + padding);
    this.ctx.lineTo(-width / 2 - padding, height / 2 + padding);
    this.ctx.lineTo(-width / 2 - padding - 10, 0);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * Get scene data for encoding
   *
   * @returns {Object} Scene data
   */
  getSceneData() {
    return {
      background: this.scene.background?.id || null,
      stickers: this.scene.stickers.map(s => ({
        id: s.id,
        position: s.position,
        scale: s.scale,
        rotation: s.rotation
      })),
      text: this.scene.texts.map(t => ({
        content: t.content,
        position: t.position,
        style: t.style,
        color: t.color
      }))
    };
  }

  /**
   * Load scene data
   *
   * @param {Object} sceneData - Scene data
   * @returns {Promise<void>}
   */
  async loadSceneData(sceneData) {
    if (sceneData.background) {
      await this.setBackground(sceneData.background);
    }

    if (sceneData.stickers) {
      for (const sticker of sceneData.stickers) {
        await this.addSticker(sticker.id, sticker.position);
      }
    }

    if (sceneData.text) {
      for (const text of sceneData.text) {
        this.addText(text.content, text.style, text.position);
      }
    }
  }

  /**
   * Get complete brainrot data (character + scene)
   *
   * @returns {Object} Complete brainrot data
   */
  getCompleteData() {
    return {
      character: this.getCharacterData(),
      scene: this.getSceneData()
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SceneCanvas;
}
