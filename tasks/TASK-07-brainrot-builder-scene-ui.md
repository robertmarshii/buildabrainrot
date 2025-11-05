# TASK 07: Brainrot Builder UI - Scene and Effects

## 🎓 Lessons Learned from Previous Tasks

### From Task 06 (Character UI)
- Big, visual buttons work best for kids
- Real-time preview is essential
- Randomize feature is very popular
- Mobile-first responsive design crucial
- **Applied**: Use same patterns for scene builder

### Combined Insights from All Previous
- **Progressive Creation**: Character → Scene → Audio (step by step)
- **Visual Hierarchy**: Show most important options first
- **Instant Gratification**: Changes appear immediately
- **No Wrong Answers**: Every combination should work
- **Easy Sharing**: One click from creation to share

### New Challenges for Scene Builder
- **Layering Complexity**: Stickers can overlap, need z-index control
- **Text Input**: Kids typing = need autocomplete/suggestions
- **Positioning**: Drag-and-drop on touch devices
- **Canvas Size**: Scene is larger (1920x1080) than character preview

---

## 🎯 Goal
Build the scene customization interface where kids add backgrounds, stickers, text bubbles, and effects to their characters. Must support drag-and-drop positioning, text input with fun fonts, and maintain the kid-friendly UX from Task 06.

## 📋 What's Required for Completion

### 1. Scene Canvas (Extended from Character Canvas)

**Full Scene Composition:**
- Canvas size: 1920x1080 (landscape)
- Layers (bottom to top):
  1. Background image
  2. Character (from previous step)
  3. Stickers/effects (draggable)
  4. Text bubbles (editable, draggable)
  5. Overlays (optional effects)

**Features:**
- Drag items to reposition
- Tap to select/edit
- Pinch to scale (mobile)
- Delete button on selected items
- Layer order controls (bring forward/send back)

### 2. Background Selector

```
┌──────────────────────────────────────┐
│  CHOOSE A BACKGROUND                 │
├──────────────────────────────────────┤
│  [🚽]  [🏫]  [🌌]  [🌊]  [🍔]       │
│  Toilet Class Space Water McD's      │
│                                      │
│  [🛏️]  [🏙️]  [🌈]  [None]          │
│  Bedroom City Rainbow Transparent    │
└──────────────────────────────────────┘
```

### 3. Sticker Browser

```
┌──────────────────────────────────────┐
│  ADD STICKERS & EFFECTS              │
├──────────────────────────────────────┤
│  💀 Reactions  ✨ Effects  💬 Memes  │
├──────────────────────────────────────┤
│  [💀]  [🔥]  [😂]  [😎]  [🤯]      │
│  Skull Fire  LOL  Cool  Explode      │
│                                      │
│  Tap to add, drag to position        │
└──────────────────────────────────────┘
```

### 4. Text Bubble Tool

```
┌──────────────────────────────────────┐
│  ADD TEXT                            │
├──────────────────────────────────────┤
│  [Type your message...]              │
│                                      │
│  Quick Phrases:                      │
│  [sheesh!] [no cap] [bussin']       │
│  [fr fr]   [ong]    [slay]          │
│                                      │
│  Style:                              │
│  [💭 Bubble] [💥 Comic] [⭐ Wavy]   │
│                                      │
│  [➕ Add Text]                       │
└──────────────────────────────────────┘
```

### 5. Layer Management

```
┌──────────────────────────────────────┐
│  ON YOUR SCENE                       │
├──────────────────────────────────────┤
│  [💭 "sheesh!"]        [❌] [⬆️] [⬇️] │
│  [💀 Skull sticker]    [❌] [⬆️] [⬇️] │
│  [🔥 Fire effect]      [❌] [⬆️] [⬇️] │
└──────────────────────────────────────┘
```

### 6. Effects & Filters

```
┌──────────────────────────────────────┐
│  SPECIAL EFFECTS (Optional)          │
├──────────────────────────────────────┤
│  [✨ Sparkles]  [💥 Explosion]       │
│  [⚡ Lightning] [🌟 Glitter]         │
│  [🌀 Spiral]    [🎆 Fireworks]       │
└──────────────────────────────────────┘
```

## 🛠️ Best Implementation Approach

### Phase 1: Extended Scene Canvas

```javascript
// public/assets/js/SceneCanvas.js
// Extends CharacterCanvas

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

    this.setupInteractions();
  }

  /**
   * Set background image
   */
  async setBackground(backgroundId) {
    try {
      const image = await this.assetManager.loadImage(backgroundId);
      this.scene.background = {
        id: backgroundId,
        image: image
      };
      this.render();
    } catch (error) {
      console.error('Failed to load background:', error);
    }
  }

  /**
   * Add sticker to scene
   */
  async addSticker(stickerId, position = null) {
    try {
      const image = await this.assetManager.loadImage(stickerId);

      this.scene.stickers.push({
        id: stickerId,
        image: image,
        position: position || {
          x: this.width / 2,
          y: this.height / 2
        },
        scale: 1.0,
        rotation: 0,
        zIndex: this.scene.stickers.length
      });

      this.render();
    } catch (error) {
      console.error('Failed to load sticker:', error);
    }
  }

  /**
   * Add text bubble
   */
  addText(text, style = 'bubble', position = null) {
    this.scene.texts.push({
      content: text,
      style: style, // 'bubble', 'comic', 'wavy'
      position: position || {
        x: this.width / 2,
        y: 200
      },
      fontSize: 48,
      color: '#FFFFFF',
      backgroundColor: '#667eea',
      rotation: 0,
      zIndex: this.scene.texts.length
    });

    this.render();
  }

  /**
   * Remove item (sticker or text)
   */
  removeItem(type, index) {
    if (type === 'sticker') {
      this.scene.stickers.splice(index, 1);
    } else if (type === 'text') {
      this.scene.texts.splice(index, 1);
    }
    this.render();
  }

  /**
   * Move item in layer order
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
   * Setup mouse/touch interactions
   */
  setupInteractions() {
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));

    this.canvas.addEventListener('touchstart', (e) => this.handleStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleEnd(e));
  }

  handleStart(e) {
    e.preventDefault();
    const pos = this.getCanvasPosition(e);

    // Check if clicking on a sticker or text
    this.selectedItem = this.findItemAtPosition(pos);

    if (this.selectedItem) {
      this.isDragging = true;
      this.dragOffset = {
        x: pos.x - this.selectedItem.item.position.x,
        y: pos.y - this.selectedItem.item.position.y
      };
    }
  }

  handleMove(e) {
    if (!this.isDragging || !this.selectedItem) return;

    e.preventDefault();
    const pos = this.getCanvasPosition(e);

    this.selectedItem.item.position = {
      x: pos.x - this.dragOffset.x,
      y: pos.y - this.dragOffset.y
    };

    this.render();
  }

  handleEnd(e) {
    this.isDragging = false;
  }

  getCanvasPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;

    return {
      x: (clientX - rect.left) / this.displayScale,
      y: (clientY - rect.top) / this.displayScale
    };
  }

  findItemAtPosition(pos) {
    // Check texts (top layer)
    for (let i = this.scene.texts.length - 1; i >= 0; i--) {
      const text = this.scene.texts[i];
      if (this.isPointInText(pos, text)) {
        return { type: 'text', index: i, item: text };
      }
    }

    // Check stickers
    for (let i = this.scene.stickers.length - 1; i >= 0; i--) {
      const sticker = this.scene.stickers[i];
      if (this.isPointInSticker(pos, sticker)) {
        return { type: 'sticker', index: i, item: sticker };
      }
    }

    return null;
  }

  isPointInSticker(pos, sticker) {
    const width = sticker.image.width * sticker.scale;
    const height = sticker.image.height * sticker.scale;

    return pos.x >= sticker.position.x - width / 2 &&
           pos.x <= sticker.position.x + width / 2 &&
           pos.y >= sticker.position.y - height / 2 &&
           pos.y <= sticker.position.y + height / 2;
  }

  isPointInText(pos, text) {
    const width = this.ctx.measureText(text.content).width;
    const height = text.fontSize;

    return pos.x >= text.position.x - width / 2 &&
           pos.x <= text.position.x + width / 2 &&
           pos.y >= text.position.y - height / 2 &&
           pos.y <= text.position.y + height / 2;
  }

  /**
   * Enhanced render with full scene
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background
    if (this.scene.background) {
      this.ctx.drawImage(
        this.scene.background.image,
        0, 0,
        this.width, this.height
      );
    } else {
      // Default gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Draw character (centered)
    const charX = this.width / 2 - 256; // Center 512px character
    const charY = this.height / 2 - 256;

    if (this.character.body) {
      this.ctx.save();
      this.ctx.translate(charX, charY);

      // Draw body with color
      this.drawTintedImage(
        this.character.body.image,
        0, 0, 512, 512,
        this.character.bodyColor
      );

      // Draw face
      if (this.character.face.eyes) {
        this.ctx.drawImage(
          this.character.face.eyes.image,
          256 - 64, 150, 128, 64
        );
      }

      if (this.character.face.mouth) {
        this.ctx.drawImage(
          this.character.face.mouth.image,
          256 - 64, 250, 128, 64
        );
      }

      // Draw accessories
      this.character.accessories.forEach(acc => {
        this.ctx.save();
        this.ctx.translate(acc.position.x, acc.position.y);
        this.ctx.rotate(acc.rotation * Math.PI / 180);
        this.ctx.scale(acc.scale, acc.scale);
        this.ctx.drawImage(
          acc.image,
          -acc.image.width / 2,
          -acc.image.height / 2
        );
        this.ctx.restore();
      });

      this.ctx.restore();
    }

    // Draw stickers
    this.scene.stickers.forEach(sticker => {
      this.ctx.save();
      this.ctx.translate(sticker.position.x, sticker.position.y);
      this.ctx.rotate(sticker.rotation * Math.PI / 180);
      this.ctx.scale(sticker.scale, sticker.scale);
      this.ctx.drawImage(
        sticker.image,
        -sticker.image.width / 2,
        -sticker.image.height / 2
      );
      this.ctx.restore();
    });

    // Draw texts
    this.scene.texts.forEach(text => {
      this.drawTextBubble(text);
    });
  }

  /**
   * Draw text with style
   */
  drawTextBubble(textObj) {
    this.ctx.save();
    this.ctx.translate(textObj.position.x, textObj.position.y);
    this.ctx.rotate(textObj.rotation * Math.PI / 180);

    this.ctx.font = `bold ${textObj.fontSize}px "Comic Sans MS", cursive`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(textObj.content);
    const padding = 20;

    // Draw bubble background
    if (textObj.style === 'bubble') {
      this.ctx.fillStyle = textObj.backgroundColor;
      this.ctx.beginPath();
      this.ctx.roundRect(
        -metrics.width / 2 - padding,
        -textObj.fontSize / 2 - padding,
        metrics.width + padding * 2,
        textObj.fontSize + padding * 2,
        20
      );
      this.ctx.fill();
    } else if (textObj.style === 'comic') {
      // Comic book style (starburst)
      this.ctx.fillStyle = '#FFD700';
      this.drawStarburst(0, 0, metrics.width / 2 + padding, 12);
    }

    // Draw text
    this.ctx.fillStyle = textObj.color;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(textObj.content, 0, 0);
    this.ctx.fillText(textObj.content, 0, 0);

    this.ctx.restore();
  }

  drawStarburst(x, y, radius, points) {
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const angle = (Math.PI / points) * i;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Get complete scene data
   */
  getSceneData() {
    return {
      character: this.getCharacterData(),
      scene: {
        background: this.scene.background?.id,
        stickers: this.scene.stickers.map(s => ({
          id: s.id,
          position: s.position,
          scale: s.scale,
          rotation: s.rotation
        })),
        texts: this.scene.texts.map(t => ({
          content: t.content,
          style: t.style,
          position: t.position,
          fontSize: t.fontSize,
          color: t.color,
          backgroundColor: t.backgroundColor
        }))
      }
    };
  }
}
```

### Phase 2: Scene Builder UI

```javascript
// public/assets/js/SceneBuilderUI.js

class SceneBuilderUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.assetManager = window.assetManager;
    this.init();
  }

  async init() {
    await this.assetManager.init();

    // Load character from previous step
    const characterData = JSON.parse(sessionStorage.getItem('character-data'));
    if (characterData) {
      await this.canvas.loadCharacterData(characterData);
    }

    this.buildBackgroundSelector();
    this.buildStickerBrowser();
    this.buildTextTool();
    this.buildLayerManager();
    this.buildQuickActions();
  }

  buildBackgroundSelector() {
    const container = document.getElementById('background-selector');
    const backgrounds = this.assetManager.manifest.images.backgrounds;

    container.innerHTML = '<h2>Choose a Background</h2>';
    const grid = document.createElement('div');
    grid.className = 'asset-grid';

    // Add transparent option
    const noBg = document.createElement('div');
    noBg.className = 'asset-card';
    noBg.innerHTML = `
      <div class="no-background">
        <span>No Background</span>
      </div>
    `;
    noBg.addEventListener('click', () => {
      this.canvas.scene.background = null;
      this.canvas.render();
    });
    grid.appendChild(noBg);

    backgrounds.forEach(bg => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.innerHTML = `
        <img src="/assets/${bg.file}" alt="${bg.name}">
        <p>${bg.name}</p>
      `;

      card.addEventListener('click', async () => {
        await this.canvas.setBackground(bg.id);
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  buildStickerBrowser() {
    const container = document.getElementById('sticker-browser');
    const stickers = this.assetManager.manifest.images.stickers;

    container.innerHTML = '<h2>Add Stickers & Effects</h2>';
    const grid = document.createElement('div');
    grid.className = 'asset-grid small';

    stickers.forEach(sticker => {
      const card = document.createElement('div');
      card.className = 'asset-card small';
      card.innerHTML = `
        <img src="/assets/${sticker.file}" alt="${sticker.name}">
        <p>${sticker.name}</p>
      `;

      card.addEventListener('click', async () => {
        await this.canvas.addSticker(sticker.id);
        this.updateLayerManager();
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  buildTextTool() {
    const container = document.getElementById('text-tool');

    container.innerHTML = `
      <h2>Add Text</h2>
      <input type="text" id="text-input" placeholder="Type your message..." maxlength="50">

      <div class="quick-phrases">
        <h3>Quick Phrases</h3>
        <button class="phrase-btn" data-phrase="sheesh!">sheesh!</button>
        <button class="phrase-btn" data-phrase="no cap">no cap</button>
        <button class="phrase-btn" data-phrase="bussin'">bussin'</button>
        <button class="phrase-btn" data-phrase="fr fr">fr fr</button>
        <button class="phrase-btn" data-phrase="ong">ong</button>
        <button class="phrase-btn" data-phrase="slay">slay</button>
      </div>

      <div class="text-styles">
        <h3>Style</h3>
        <button class="style-btn active" data-style="bubble">💭 Bubble</button>
        <button class="style-btn" data-style="comic">💥 Comic</button>
        <button class="style-btn" data-style="plain">⭐ Plain</button>
      </div>

      <button id="add-text-btn" class="btn-primary">➕ Add Text</button>
    `;

    // Quick phrase buttons
    document.querySelectorAll('.phrase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('text-input').value = btn.dataset.phrase;
      });
    });

    // Style selection
    let selectedStyle = 'bubble';
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.style-btn').forEach(b =>
          b.classList.remove('active')
        );
        btn.classList.add('active');
        selectedStyle = btn.dataset.style;
      });
    });

    // Add text button
    document.getElementById('add-text-btn').addEventListener('click', () => {
      const text = document.getElementById('text-input').value.trim();
      if (text) {
        this.canvas.addText(text, selectedStyle);
        document.getElementById('text-input').value = '';
        this.updateLayerManager();
      }
    });
  }

  buildLayerManager() {
    const container = document.getElementById('layer-manager');
    container.innerHTML = '<h2>On Your Scene</h2><div id="layer-list"></div>';
  }

  updateLayerManager() {
    const list = document.getElementById('layer-list');
    list.innerHTML = '';

    // List texts
    this.canvas.scene.texts.forEach((text, index) => {
      const item = this.createLayerItem('text', text.content, index);
      list.appendChild(item);
    });

    // List stickers
    this.canvas.scene.stickers.forEach((sticker, index) => {
      const asset = this.assetManager.findAsset(sticker.id);
      const item = this.createLayerItem('sticker', asset?.name || sticker.id, index);
      list.appendChild(item);
    });
  }

  createLayerItem(type, label, index) {
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.innerHTML = `
      <span class="layer-label">${label}</span>
      <button class="layer-btn" data-action="up">⬆️</button>
      <button class="layer-btn" data-action="down">⬇️</button>
      <button class="layer-btn" data-action="delete">❌</button>
    `;

    item.querySelector('[data-action="up"]').addEventListener('click', () => {
      this.canvas.moveLayer(type, index, 'up');
      this.updateLayerManager();
    });

    item.querySelector('[data-action="down"]').addEventListener('click', () => {
      this.canvas.moveLayer(type, index, 'down');
      this.updateLayerManager();
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
      this.canvas.removeItem(type, index);
      this.updateLayerManager();
    });

    return item;
  }

  buildQuickActions() {
    const container = document.getElementById('quick-actions');

    container.innerHTML = `
      <button id="btn-back" class="btn-action">⬅️ Back</button>
      <button id="btn-randomize" class="btn-action">🎲 Randomize Scene</button>
      <button id="btn-next" class="btn-action btn-primary">Next: Add Audio ➡️</button>
    `;

    document.getElementById('btn-back').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('btn-randomize').addEventListener('click', () => {
      this.randomizeScene();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      const sceneData = this.canvas.getSceneData();
      sessionStorage.setItem('scene-data', JSON.stringify(sceneData));
      window.location.href = '/builder-audio.php';
    });
  }

  async randomizeScene() {
    const manifest = this.assetManager.manifest;

    // Random background
    const backgrounds = manifest.images.backgrounds;
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    await this.canvas.setBackground(randomBg.id);

    // Random stickers (2-4)
    const stickers = manifest.images.stickers;
    const stickerCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < stickerCount; i++) {
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      await this.canvas.addSticker(randomSticker.id, {
        x: 200 + Math.random() * 1500,
        y: 200 + Math.random() * 700
      });
    }

    // Random text
    const phrases = ['sheesh!', 'no cap', 'bussin\'', 'fr fr', 'ong', 'slay'];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.canvas.addText(randomPhrase, 'bubble');

    this.updateLayerManager();
  }
}
```

### Phase 3: HTML Structure

```html
<!-- public/builder-scene.php -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Your Brainrot - Scene</title>
  <link rel="stylesheet" href="/assets/css/builder.css">
</head>
<body>
  <div class="builder-container">
    <!-- Preview Canvas -->
    <div class="preview-panel">
      <h1>Your Scene</h1>
      <canvas id="scene-canvas"></canvas>
      <p class="hint">💡 Drag stickers and text to reposition</p>
    </div>

    <!-- Customization Panel -->
    <div class="customization-panel">
      <section id="background-selector" class="builder-section"></section>
      <section id="sticker-browser" class="builder-section"></section>
      <section id="text-tool" class="builder-section"></section>
      <section id="layer-manager" class="builder-section"></section>
      <section id="quick-actions" class="builder-section"></section>
    </div>
  </div>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
  <script src="/assets/js/AssetManager.js"></script>
  <script src="/assets/js/CharacterCanvas.js"></script>
  <script src="/assets/js/SceneCanvas.js"></script>
  <script src="/assets/js/SceneBuilderUI.js"></script>

  <script>
    const canvas = new SceneCanvas('scene-canvas');
    const ui = new SceneBuilderUI(canvas);
  </script>
</body>
</html>
```

## ✅ Completion Checks

### Automated Tests

```javascript
// test/test-scene-builder.js

async function testSceneBuilder() {
  console.log('Testing Scene Builder...\n');

  const canvas = new SceneCanvas('scene-canvas');

  // Test 1: Set background
  console.log('Test 1: Set background');
  await canvas.setBackground('bg-toilet');
  console.assert(canvas.scene.background !== null, 'Background should be set');
  console.log('✓ Test 1 passed\n');

  // Test 2: Add sticker
  console.log('Test 2: Add sticker');
  await canvas.addSticker('sticker-skull', { x: 500, y: 500 });
  console.assert(canvas.scene.stickers.length === 1, 'Should have 1 sticker');
  console.log('✓ Test 2 passed\n');

  // Test 3: Add text
  console.log('Test 3: Add text');
  canvas.addText('sheesh!', 'bubble');
  console.assert(canvas.scene.texts.length === 1, 'Should have 1 text');
  console.log('✓ Test 3 passed\n');

  // Test 4: Remove sticker
  console.log('Test 4: Remove sticker');
  canvas.removeItem('sticker', 0);
  console.assert(canvas.scene.stickers.length === 0, 'Sticker removed');
  console.log('✓ Test 4 passed\n');

  // Test 5: Get scene data
  console.log('Test 5: Get scene data');
  const data = canvas.getSceneData();
  console.assert(data.scene.background === 'bg-toilet', 'Data matches');
  console.assert(data.scene.texts.length === 1, 'Text exported');
  console.log('✓ Test 5 passed\n');

  console.log('✅ All Scene Builder tests passed!');
}
```

### Manual Checks

- [ ] Background changes when selected
- [ ] Stickers appear on canvas
- [ ] Stickers can be dragged to reposition
- [ ] Text appears with correct style
- [ ] Text can be edited by clicking
- [ ] Layer manager shows all items
- [ ] Delete buttons remove items
- [ ] Up/down buttons reorder layers
- [ ] Randomize creates complete scene
- [ ] Next button saves and navigates
- [ ] Works on mobile (touch drag)

## 📊 Success Criteria

Task 07 is complete when:
1. ✅ Scene canvas renders full 1920x1080 composition
2. ✅ Background selector works
3. ✅ Stickers can be added and positioned
4. ✅ Text tool allows custom and quick phrases
5. ✅ Drag-and-drop works on desktop and mobile
6. ✅ Layer manager shows all scene items
7. ✅ Items can be deleted and reordered
8. ✅ Character from previous step loads correctly
9. ✅ Scene data exports to proper format
10. ✅ UI is responsive and kid-friendly

## 🎓 Key Deliverables

- `/public/builder-scene.php`
- `/public/assets/js/SceneCanvas.js` (extends CharacterCanvas)
- `/public/assets/js/SceneBuilderUI.js`
- Updated `/public/assets/css/builder.css`
- `/test/test-scene-builder.js`

## ⚠️ Common Pitfalls to Avoid

1. **Touch Drag Not Working**: Missing touch event handlers
2. **Z-Index Chaos**: Items overlap incorrectly
3. **Text Overflow**: Long text breaks layout
4. **No Visual Feedback**: Users don't know what's selected
5. **Performance Issues**: Too many items slow rendering
6. **Mobile Positioning**: Hard to precisely position on small screens
7. **Lost Character Data**: Session storage cleared
8. **No Undo**: Accidental deletes can't be reversed

## 🔗 Dependencies for Next Task

Task 08 will need:
- ✅ Complete scene data structure
- ✅ Session storage pattern for passing data
- ✅ Canvas rendering approach (add audio visualizations)
- ✅ Timeline concept for audio timing

## 🚀 Future Enhancements

- Snap-to-grid for alignment
- Copy/duplicate items
- Rotation controls for stickers
- Text color picker
- More text styles (outline, shadow)
- Animated stickers (GIFs)
- Background filters (sepia, grayscale)
- Templates (pre-made scenes)
