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

    // Check stickers first
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

    // Check texts
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

    // Check character accessories (reverse order for top-most)
    for (let i = this.character.accessories.length - 1; i >= 0; i--) {
      const accessory = this.character.accessories[i];
      // Calculate absolute position (body position + accessory offset)
      const absPos = {
        x: this.character.bodyPosition.x + accessory.position.x,
        y: this.character.bodyPosition.y + accessory.position.y
      };
      if (this.isPointInAccessory(pos, accessory, absPos)) {
        this.selectedItem = { type: 'accessory', index: i, item: accessory };
        this.isDragging = true;
        this.dragOffset = {
          x: pos.x - absPos.x,
          y: pos.y - absPos.y
        };
        return;
      }
    }

    // Check character body
    if (this.character.body && this.character.body.image) {
      const { width, height } = this._getImageDimensions(this.character.body.image, this.character.body.metadata);
      const hw = width / 2;
      const hh = height / 2;

      if (pos.x >= this.character.bodyPosition.x - hw &&
          pos.x <= this.character.bodyPosition.x + hw &&
          pos.y >= this.character.bodyPosition.y - hh &&
          pos.y <= this.character.bodyPosition.y + hh) {
        this.selectedItem = { type: 'body', item: this.character.bodyPosition };
        this.isDragging = true;
        this.dragOffset = {
          x: pos.x - this.character.bodyPosition.x,
          y: pos.y - this.character.bodyPosition.y
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

    if (this.selectedItem.type === 'body') {
      // Move the entire character body
      this.character.bodyPosition.x = pos.x - this.dragOffset.x;
      this.character.bodyPosition.y = pos.y - this.dragOffset.y;
    } else if (this.selectedItem.type === 'accessory') {
      // For accessories, update relative to character body position
      const newAbsX = pos.x - this.dragOffset.x;
      const newAbsY = pos.y - this.dragOffset.y;
      item.position.x = newAbsX - this.character.bodyPosition.x;
      item.position.y = newAbsY - this.character.bodyPosition.y;
    } else {
      // For stickers and text, use absolute positioning
      item.position.x = pos.x - this.dragOffset.x;
      item.position.y = pos.y - this.dragOffset.y;
    }

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
   * Check if point is in accessory bounds
   *
   * @private
   */
  isPointInAccessory(point, accessory, absolutePosition) {
    if (!accessory || !accessory.image) return false;

    // Get dimensions using parent class helper
    const { width, height } = this._getImageDimensions(accessory.image, accessory.metadata);

    const hw = width / 2;
    const hh = height / 2;

    return (
      point.x >= absolutePosition.x - hw &&
      point.x <= absolutePosition.x + hw &&
      point.y >= absolutePosition.y - hh &&
      point.y <= absolutePosition.y + hh
    );
  }

  /**
   * Load character data (override parent to handle body-center-relative positions)
   *
   * @param {Object} characterData - Character data with body-center-relative positions
   * @returns {Promise<void>}
   */
  async loadCharacterData(characterData) {
    this.character = {
      body: null,
      bodyColor: '#808080',
      bodyPosition: characterData.bodyPosition ? { ...characterData.bodyPosition } : { x: this.width / 2, y: this.height / 2 }, // Use saved position or default to center
      accessories: [],
      face: { eyes: null, mouth: null }
    };

    if (characterData.body) {
      const bodyImage = await this.assetManager.loadImage(characterData.body);
      const bodyMetadata = this.assetManager.findAsset(characterData.body);
      this.character.body = { id: characterData.body, image: bodyImage, metadata: bodyMetadata };
    }

    if (characterData.color) {
      this.character.bodyColor = characterData.color;
    }

    // Positions in characterData are body-center-relative, use as-is
    if (characterData.accessories) {
      for (const acc of characterData.accessories) {
        const accImage = await this.assetManager.loadImage(acc.id);
        const accMetadata = this.assetManager.findAsset(acc.id);
        this.character.accessories.push({
          id: acc.id,
          image: accImage,
          metadata: accMetadata,
          position: { ...acc.position },  // Already body-center-relative
          scale: acc.scale || 1.0,
          rotation: acc.rotation || 0
        });
      }
    }

    if (characterData.face) {
      if (characterData.face.eyes) {
        const eyesImage = await this.assetManager.loadImage(characterData.face.eyes);
        const eyesMetadata = this.assetManager.findAsset(characterData.face.eyes);
        this.character.face.eyes = { id: characterData.face.eyes, image: eyesImage, metadata: eyesMetadata };
      }
      if (characterData.face.mouth) {
        const mouthImage = await this.assetManager.loadImage(characterData.face.mouth);
        const mouthMetadata = this.assetManager.findAsset(characterData.face.mouth);
        this.character.face.mouth = { id: characterData.face.mouth, image: mouthImage, metadata: mouthMetadata };
      }
    }

    await this.render();
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

      // 2. Draw character (at bodyPosition)
      if (this.character.body) {
        // Draw body at bodyPosition
        const body = this.character.body;
        if (body && body.image) {
          const { width, height } = this._getImageDimensions(body.image, body.metadata);

          this.ctx.save();

          // If colorizable body, apply color tint
          if (this.character.bodyColor !== '#808080' && body.metadata?.colorizable) {
            // Create offscreen canvas for tinting
            const offscreen = document.createElement('canvas');
            offscreen.width = width;
            offscreen.height = height;
            const offCtx = offscreen.getContext('2d');

            // Draw original image
            offCtx.drawImage(body.image, 0, 0, width, height);

            // Apply color tint
            offCtx.globalCompositeOperation = 'multiply';
            offCtx.fillStyle = this.character.bodyColor;
            offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

            // Restore alpha
            offCtx.globalCompositeOperation = 'destination-in';
            offCtx.drawImage(body.image, 0, 0, width, height);

            // Draw to main canvas at bodyPosition
            const x = this.character.bodyPosition.x - width / 2;
            const y = this.character.bodyPosition.y - height / 2;
            this.ctx.drawImage(offscreen, x, y);
          } else {
            // Draw without tinting at bodyPosition
            const x = this.character.bodyPosition.x - width / 2;
            const y = this.character.bodyPosition.y - height / 2;
            this.ctx.drawImage(body.image, x, y, width, height);
          }

          this.ctx.restore();
        }

        // Draw character accessories (relative to body position)
        for (const accessory of this.character.accessories) {
          if (accessory && accessory.image) {
            const { width, height } = this._getImageDimensions(accessory.image, accessory.metadata);

            this.ctx.save();

            // Position relative to body position
            const posX = this.character.bodyPosition.x + accessory.position.x;
            const posY = this.character.bodyPosition.y + accessory.position.y;

            this.ctx.translate(posX, posY);

            if (accessory.rotation) {
              this.ctx.rotate((accessory.rotation * Math.PI) / 180);
            }

            if (accessory.scale && accessory.scale !== 1.0) {
              this.ctx.scale(accessory.scale, accessory.scale);
            }

            // Draw centered on position
            const x = -width / 2;
            const y = -height / 2;
            this.ctx.drawImage(accessory.image, x, y, width, height);

            this.ctx.restore();
          }
        }

        // Draw character face (if present)
        if (this.character.face.eyes && this.character.face.eyes.image) {
          const { width, height } = this._getImageDimensions(
            this.character.face.eyes.image,
            this.character.face.eyes.metadata
          );

          // Get attachment point from body if available
          let position = { x: this.width / 2, y: this.height / 2 };
          if (this.character.body && this.character.body.metadata) {
            const attachments = this.character.body.metadata.attachmentPoints;
            if (attachments && attachments.head) {
              position = {
                x: this.width / 2 + attachments.head.x,
                y: this.height / 2 + attachments.head.y
              };
            }
          }

          const x = position.x - width / 2;
          const y = position.y - height / 2;
          this.ctx.drawImage(this.character.face.eyes.image, x, y, width, height);
        }

        if (this.character.face.mouth && this.character.face.mouth.image) {
          const { width, height } = this._getImageDimensions(
            this.character.face.mouth.image,
            this.character.face.mouth.metadata
          );

          // Get attachment point from body if available
          let position = { x: this.width / 2, y: this.height / 2 };
          if (this.character.body && this.character.body.metadata) {
            const attachments = this.character.body.metadata.attachmentPoints;
            if (attachments && attachments.head) {
              position = {
                x: this.width / 2 + attachments.head.x,
                y: this.height / 2 + attachments.head.y + 30 // Below eyes
              };
            }
          }

          const x = position.x - width / 2;
          const y = position.y - height / 2;
          this.ctx.drawImage(this.character.face.mouth.image, x, y, width, height);
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
        position: { ...s.position },
        scale: s.scale,
        rotation: s.rotation
      })),
      texts: this.scene.texts.map(t => ({
        content: t.content,
        position: { ...t.position },
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
  /**
   * Get character data (override parent to use bodyPosition)
   *
   * @returns {Object} Character data in BrainrotData format
   */
  getCharacterData() {
    return {
      body: this.character.body?.id || null,
      color: this.character.bodyColor,
      bodyPosition: { ...this.character.bodyPosition }, // Include body position for scene
      accessories: this.character.accessories.map(acc => ({
        id: acc.id,
        position: { ...acc.position }, // Already body-relative
        scale: acc.scale,
        rotation: acc.rotation
      })),
      face: {
        eyes: this.character.face.eyes?.id || null,
        mouth: this.character.face.mouth?.id || null
      }
    };
  }

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
