# TASK 06: Brainrot Builder UI - Character Customization

## 🎓 Lessons Learned from Previous Tasks

### From Task 02 (Image Assets)
- Asset relationships matter (which accessories fit which characters)
- Visual preview essential for kids
- **Applied**: Real-time preview as kids customize

### From Task 04 (URL Encoding)
- Need to track all customization choices
- Data structure already defined
- **Applied**: Build UI that populates BrainrotData object

### From Task 05 (Asset Manager)
- Assets load asynchronously
- Need loading feedback
- **Applied**: Show placeholders while assets load

### Combined Insights for Kid-Friendly UI
- **Big Buttons**: Touch targets 60px+ minimum
- **Visual Not Text**: Icons > labels for 7-year-olds
- **Instant Feedback**: Show changes immediately
- **No Wrong Choices**: Everything should look good together
- **Undo/Reset**: Easy to start over
- **Mobile First**: Most kids will use phones/tablets

---

## 🎯 Goal
Create an intuitive, fun, and kid-friendly character customization interface that lets 7+ year-olds build their brainrot characters. Must include: body selection, color picker, accessory adding, facial feature selection, with real-time preview canvas.

## 📋 What's Required for Completion

### 1. Character Builder Canvas

**Real-time Preview System:**
- HTML5 Canvas (1920x1080 or 512x512)
- Layered rendering:
  1. Background (transparent for now)
  2. Character body (colorizable)
  3. Accessories (positioned dynamically)
  4. Facial features (eyes, mouth)
  5. Effects/stickers (overlays)

**Requirements:**
- 60fps rendering
- Touch-friendly interactions (drag accessories)
- Zoom/pan on mobile
- Export as PNG

### 2. Body Selection UI

**Interface:**
```
┌──────────────────────────────────────┐
│  CHOOSE YOUR CHARACTER               │
├──────────────────────────────────────┤
│  [🦈] [🐱] [🐕] [🍌] [🥒] [🐵]      │
│  Shark  Cat  Dog Banana Pickle Monkey│
│                                      │
│  [🚽] [📱] [👟] [👽] [🤖] [💧]      │
│  Toilet Phone Shoe Alien Robot Blob │
└──────────────────────────────────────┘
```

**Features:**
- Grid layout (3-4 columns)
- Large thumbnail (150x150px)
- Name below each option
- Selected state (border/highlight)
- Scroll for more options

### 3. Color Picker UI

**Simple Mode** (for young kids):
```
┌──────────────────────────────────────┐
│  PICK A COLOR                        │
├──────────────────────────────────────┤
│  ⬛ 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬜         │
│                                      │
│  [🎲 Random Color]                   │
│  [🌈 Rainbow Mode]                   │
└──────────────────────────────────────┘
```

**Advanced Mode** (optional):
- Full color wheel
- Hex input
- Saved colors

### 4. Accessory Browser

**Categorized Tabs:**
```
┌──────────────────────────────────────┐
│  ADD ACCESSORIES                     │
├──────────────────────────────────────┤
│  👒 Hats  👟 Shoes  🎤 Props  👔 Clothes│
├──────────────────────────────────────┤
│  [👑]  [🧢]  [🎩]  [🎂]             │
│  Crown  Cap   Top   Party            │
│  Hat    Hat         Hat              │
│                                      │
│  [+ Add More]                        │
└──────────────────────────────────────┘
```

**Features:**
- Up to 5 accessories at once
- Drag to position on character
- Remove button (X)
- Filter by category

### 5. Face Customizer

```
┌──────────────────────────────────────┐
│  MAKE A FACE                         │
├──────────────────────────────────────┤
│  Eyes:                               │
│  [👀] [😴] [🌀] [💕]               │
│                                      │
│  Mouth:                              │
│  [😃] [😱] [😛] [🤪]               │
│                                      │
│  Extra:                              │
│  [None] [👨] [😂]                  │
│         Mustache Tears               │
└──────────────────────────────────────┘
```

### 6. Quick Actions Panel

```
┌──────────────────────────────────────┐
│  [🎲 Randomize]  [↩️ Undo]  [🔄 Reset]│
│  [👁️ Preview]    [💾 Save]  [➡️ Next] │
└──────────────────────────────────────┘
```

## 🛠️ Best Implementation Approach

### Phase 1: Canvas Rendering System

```javascript
// public/assets/js/CharacterCanvas.js

class CharacterCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
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
  }

  /**
   * Set character body
   */
  async setBody(bodyId) {
    try {
      const image = await this.assetManager.loadImage(bodyId);
      this.character.body = {
        id: bodyId,
        image: image
      };
      this.render();
    } catch (error) {
      console.error('Failed to load body:', error);
    }
  }

  /**
   * Set body color (with tinting)
   */
  setBodyColor(hexColor) {
    this.character.bodyColor = hexColor;
    this.render();
  }

  /**
   * Add accessory
   */
  async addAccessory(accessoryId, position = null) {
    try {
      const image = await this.assetManager.loadImage(accessoryId);
      const asset = this.assetManager.findAsset(accessoryId);

      // Use attachment point if no position specified
      if (!position && asset.attachmentPoints) {
        const attachPoint = asset.attachPoint; // 'head', 'feet', 'hand'
        position = this.character.body?.attachmentPoints?.[attachPoint] ||
                   { x: this.width / 2, y: this.height / 2 };
      }

      this.character.accessories.push({
        id: accessoryId,
        image: image,
        position: position || { x: this.width / 2, y: this.height / 2 },
        scale: 1.0,
        rotation: 0
      });

      this.render();
    } catch (error) {
      console.error('Failed to load accessory:', error);
    }
  }

  /**
   * Remove accessory by index
   */
  removeAccessory(index) {
    this.character.accessories.splice(index, 1);
    this.render();
  }

  /**
   * Set facial feature
   */
  async setFace(type, featureId) {
    try {
      const image = await this.assetManager.loadImage(featureId);
      this.character.face[type] = {
        id: featureId,
        image: image
      };
      this.render();
    } catch (error) {
      console.error('Failed to load face:', error);
    }
  }

  /**
   * Render entire character
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background (transparent for now)
    // this.ctx.fillStyle = '#f0f0f0';
    // this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw body with color tint
    if (this.character.body) {
      this.drawTintedImage(
        this.character.body.image,
        0, 0,
        this.width, this.height,
        this.character.bodyColor
      );
    }

    // Draw facial features
    if (this.character.face.eyes) {
      this.ctx.drawImage(
        this.character.face.eyes.image,
        this.width / 2 - 64, 150, // Positioned for standard face
        128, 64
      );
    }

    if (this.character.face.mouth) {
      this.ctx.drawImage(
        this.character.face.mouth.image,
        this.width / 2 - 64, 250,
        128, 64
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
  }

  /**
   * Draw image with color tint
   */
  drawTintedImage(image, x, y, width, height, hexColor) {
    // Draw original image
    this.ctx.drawImage(image, x, y, width, height);

    // Apply color tint (multiply blend)
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = hexColor;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.globalCompositeOperation = 'destination-in';
    this.ctx.drawImage(image, x, y, width, height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Export as data URL
   */
  exportImage() {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Get character data for encoding
   */
  getCharacterData() {
    return {
      body: this.character.body?.id,
      color: this.character.bodyColor,
      accessories: this.character.accessories.map(acc => ({
        id: acc.id,
        position: acc.position,
        scale: acc.scale,
        rotation: acc.rotation
      })),
      face: {
        eyes: this.character.face.eyes?.id,
        mouth: this.character.face.mouth?.id
      }
    };
  }

  /**
   * Load character from data
   */
  async loadCharacterData(data) {
    if (data.body) {
      await this.setBody(data.body);
    }
    if (data.color) {
      this.setBodyColor(data.color);
    }
    if (data.accessories) {
      for (const acc of data.accessories) {
        await this.addAccessory(acc.id, acc.position);
      }
    }
    if (data.face?.eyes) {
      await this.setFace('eyes', data.face.eyes);
    }
    if (data.face?.mouth) {
      await this.setFace('mouth', data.face.mouth);
    }
  }
}
```

### Phase 2: UI Component System

```javascript
// public/assets/js/CharacterBuilderUI.js

class CharacterBuilderUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.assetManager = window.assetManager;
    this.init();
  }

  async init() {
    await this.assetManager.init();
    this.buildBodySelector();
    this.buildColorPicker();
    this.buildAccessoryBrowser();
    this.buildFaceCustomizer();
    this.buildQuickActions();
  }

  /**
   * Build body selector grid
   */
  buildBodySelector() {
    const container = document.getElementById('body-selector');
    const bodies = this.assetManager.manifest.images.characters.bodies;

    container.innerHTML = '<h2>Choose Your Character</h2>';
    const grid = document.createElement('div');
    grid.className = 'asset-grid';

    bodies.forEach(body => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.innerHTML = `
        <img src="/assets/${body.file}" alt="${body.name}">
        <p>${body.name}</p>
      `;

      card.addEventListener('click', async () => {
        // Remove previous selection
        document.querySelectorAll('.asset-card').forEach(c =>
          c.classList.remove('selected')
        );
        card.classList.add('selected');

        // Load body on canvas
        await this.canvas.setBody(body.id);
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  /**
   * Build simple color picker
   */
  buildColorPicker() {
    const container = document.getElementById('color-picker');
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85929E',
      '#FFFFFF', '#34495E'
    ];

    container.innerHTML = '<h2>Pick a Color</h2>';
    const grid = document.createElement('div');
    grid.className = 'color-grid';

    colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;

      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s =>
          s.classList.remove('selected')
        );
        swatch.classList.add('selected');

        this.canvas.setBodyColor(color);
      });

      grid.appendChild(swatch);
    });

    // Random button
    const randomBtn = document.createElement('button');
    randomBtn.className = 'btn-random';
    randomBtn.textContent = '🎲 Random Color';
    randomBtn.addEventListener('click', () => {
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      this.canvas.setBodyColor(randomColor);
    });

    container.appendChild(grid);
    container.appendChild(randomBtn);
  }

  /**
   * Build accessory browser with categories
   */
  buildAccessoryBrowser() {
    const container = document.getElementById('accessory-browser');
    const accessories = this.assetManager.manifest.images.characters.accessories;

    // Group by category
    const categories = {};
    accessories.forEach(acc => {
      const cat = acc.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(acc);
    });

    container.innerHTML = '<h2>Add Accessories</h2>';

    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'tabs';

    Object.keys(categories).forEach((category, index) => {
      const tab = document.createElement('button');
      tab.className = 'tab' + (index === 0 ? ' active' : '');
      tab.textContent = category;
      tab.addEventListener('click', () => {
        // Switch active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding content
        showCategoryContent(category);
      });
      tabs.appendChild(tab);
    });

    container.appendChild(tabs);

    // Content area
    const content = document.createElement('div');
    content.id = 'accessory-content';
    container.appendChild(content);

    // Show first category by default
    showCategoryContent(Object.keys(categories)[0]);

    function showCategoryContent(category) {
      content.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'asset-grid';

      categories[category].forEach(acc => {
        const card = document.createElement('div');
        card.className = 'asset-card';
        card.innerHTML = `
          <img src="/assets/${acc.file}" alt="${acc.name}">
          <p>${acc.name}</p>
        `;

        card.addEventListener('click', async () => {
          await this.canvas.addAccessory(acc.id);
        });

        grid.appendChild(card);
      });

      content.appendChild(grid);
    }
  }

  /**
   * Build face customizer
   */
  buildFaceCustomizer() {
    const container = document.getElementById('face-customizer');
    const faces = this.assetManager.manifest.images.characters.faces;

    // Group by type (eyes, mouth)
    const eyes = faces.filter(f => f.category === 'eyes');
    const mouths = faces.filter(f => f.category === 'mouth');

    container.innerHTML = '<h2>Make a Face</h2>';

    // Eyes section
    const eyesSection = document.createElement('div');
    eyesSection.innerHTML = '<h3>Eyes</h3>';
    const eyesGrid = this.createFaceGrid(eyes, 'eyes');
    eyesSection.appendChild(eyesGrid);

    // Mouths section
    const mouthsSection = document.createElement('div');
    mouthsSection.innerHTML = '<h3>Mouth</h3>';
    const mouthsGrid = this.createFaceGrid(mouths, 'mouth');
    mouthsSection.appendChild(mouthsGrid);

    container.appendChild(eyesSection);
    container.appendChild(mouthsSection);
  }

  createFaceGrid(features, type) {
    const grid = document.createElement('div');
    grid.className = 'asset-grid small';

    features.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'asset-card small';
      card.innerHTML = `
        <img src="/assets/${feature.file}" alt="${feature.name}">
      `;

      card.addEventListener('click', async () => {
        document.querySelectorAll(`.asset-grid.small .asset-card`).forEach(c =>
          c.classList.remove('selected')
        );
        card.classList.add('selected');

        await this.canvas.setFace(type, feature.id);
      });

      grid.appendChild(card);
    });

    return grid;
  }

  /**
   * Build quick actions
   */
  buildQuickActions() {
    const container = document.getElementById('quick-actions');

    container.innerHTML = `
      <button id="btn-randomize" class="btn-action">🎲 Randomize</button>
      <button id="btn-reset" class="btn-action">🔄 Reset</button>
      <button id="btn-next" class="btn-action btn-primary">Next ➡️</button>
    `;

    document.getElementById('btn-randomize').addEventListener('click', () => {
      this.randomizeCharacter();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('Reset and start over?')) {
        this.canvas.character = {
          body: null,
          bodyColor: '#808080',
          accessories: [],
          face: { eyes: null, mouth: null }
        };
        this.canvas.render();
      }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      // Save and move to scene builder
      const characterData = this.canvas.getCharacterData();
      sessionStorage.setItem('character-data', JSON.stringify(characterData));
      window.location.href = '/builder-scene.php';
    });
  }

  /**
   * Randomize all character features
   */
  async randomizeCharacter() {
    const manifest = this.assetManager.manifest;

    // Random body
    const bodies = manifest.images.characters.bodies;
    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
    await this.canvas.setBody(randomBody.id);

    // Random color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    this.canvas.setBodyColor(randomColor);

    // Random accessories (2-3)
    const accessories = manifest.images.characters.accessories;
    const accCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < accCount; i++) {
      const randomAcc = accessories[Math.floor(Math.random() * accessories.length)];
      await this.canvas.addAccessory(randomAcc.id);
    }

    // Random face
    const eyes = manifest.images.characters.faces.filter(f => f.category === 'eyes');
    const mouths = manifest.images.characters.faces.filter(f => f.category === 'mouth');

    const randomEyes = eyes[Math.floor(Math.random() * eyes.length)];
    const randomMouth = mouths[Math.floor(Math.random() * mouths.length)];

    await this.canvas.setFace('eyes', randomEyes.id);
    await this.canvas.setFace('mouth', randomMouth.id);
  }
}
```

### Phase 3: HTML Structure

```html
<!-- public/builder-character.php -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Your Brainrot - Character</title>
  <link rel="stylesheet" href="/assets/css/builder.css">
</head>
<body>
  <div class="builder-container">
    <!-- Preview Canvas -->
    <div class="preview-panel">
      <h1>Your Character</h1>
      <canvas id="character-canvas"></canvas>
    </div>

    <!-- Customization Panel -->
    <div class="customization-panel">
      <!-- Body Selector -->
      <section id="body-selector" class="builder-section"></section>

      <!-- Color Picker -->
      <section id="color-picker" class="builder-section"></section>

      <!-- Accessory Browser -->
      <section id="accessory-browser" class="builder-section"></section>

      <!-- Face Customizer -->
      <section id="face-customizer" class="builder-section"></section>

      <!-- Quick Actions -->
      <section id="quick-actions" class="builder-section"></section>
    </div>
  </div>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
  <script src="/assets/js/AssetManager.js"></script>
  <script src="/assets/js/CharacterCanvas.js"></script>
  <script src="/assets/js/CharacterBuilderUI.js"></script>

  <script>
    // Initialize
    const canvas = new CharacterCanvas('character-canvas');
    const ui = new CharacterBuilderUI(canvas);
  </script>
</body>
</html>
```

### Phase 4: CSS Styling

```css
/* public/assets/css/builder.css */

.builder-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

#character-canvas {
  border: 4px solid #fff;
  border-radius: 20px;
  background: #f0f0f0;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.customization-panel {
  flex: 1;
  background: white;
  overflow-y: auto;
  padding: 20px;
}

.builder-section {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.asset-card {
  border: 3px solid transparent;
  border-radius: 15px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
  text-align: center;
}

.asset-card:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.asset-card.selected {
  border-color: #667eea;
  background: #e8eaf6;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.asset-card img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  border: 4px solid transparent;
  transition: all 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: #333;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  border: none;
  background: #eee;
  cursor: pointer;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.2s;
}

.tab.active {
  background: #667eea;
  color: white;
}

#quick-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px;
}

.btn-action {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  background: #f0f0f0;
}

.btn-action:hover {
  transform: scale(1.05);
}

.btn-primary {
  background: #667eea;
  color: white;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .builder-container {
    flex-direction: column;
  }

  .preview-panel {
    min-height: 400px;
  }

  #character-canvas {
    max-width: 90vw;
    height: auto;
  }

  .asset-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .color-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .btn-action {
    flex: 1;
    padding: 12px;
    font-size: 16px;
  }
}
```

## ✅ Completion Checks

### Automated Tests

```javascript
// test/test-character-builder.js

async function testCharacterBuilder() {
  console.log('Testing Character Builder...\n');

  const canvas = new CharacterCanvas('character-canvas');

  // Test 1: Set body
  console.log('Test 1: Set body');
  await canvas.setBody('char-body-shark');
  console.assert(canvas.character.body !== null, 'Body should be set');
  console.log('✓ Test 1 passed\n');

  // Test 2: Change color
  console.log('Test 2: Change color');
  canvas.setBodyColor('#FF0000');
  console.assert(canvas.character.bodyColor === '#FF0000', 'Color should update');
  console.log('✓ Test 2 passed\n');

  // Test 3: Add accessory
  console.log('Test 3: Add accessory');
  await canvas.addAccessory('acc-head-sunglasses');
  console.assert(canvas.character.accessories.length === 1, 'Should have 1 accessory');
  console.log('✓ Test 3 passed\n');

  // Test 4: Get character data
  console.log('Test 4: Get character data');
  const data = canvas.getCharacterData();
  console.assert(data.body === 'char-body-shark', 'Data should match');
  console.assert(data.accessories.length === 1, 'Should export accessories');
  console.log('✓ Test 4 passed\n');

  // Test 5: Export image
  console.log('Test 5: Export image');
  const dataUrl = canvas.exportImage();
  console.assert(dataUrl.startsWith('data:image/png'), 'Should export PNG');
  console.log('✓ Test 5 passed\n');

  console.log('✅ All Character Builder tests passed!');
}
```

### Manual Checks

- [ ] Canvas renders character correctly
- [ ] Clicking body changes character
- [ ] Color picker updates character color in real-time
- [ ] Accessories appear on character
- [ ] Multiple accessories can be added
- [ ] Face features display correctly
- [ ] Randomize button creates complete character
- [ ] Reset button clears everything
- [ ] Next button saves data and navigates
- [ ] UI works on mobile (touch interactions)
- [ ] No console errors during interactions

### Visual/UX Checks

- [ ] All buttons are touch-friendly (60px+ tap targets)
- [ ] Selected states are obvious
- [ ] Loading states show while assets load
- [ ] Layout doesn't break on mobile
- [ ] Canvas stays centered
- [ ] Scrolling is smooth
- [ ] Colors are vibrant and kid-friendly
- [ ] Text is readable (large enough)

### Performance Checks

- [ ] Canvas renders at 60fps
- [ ] No lag when switching options
- [ ] Assets load quickly (< 2s for all)
- [ ] Memory usage stays reasonable
- [ ] No memory leaks after prolonged use

## 📊 Success Criteria

Task 06 is complete when:
1. ✅ Character canvas renders all elements correctly
2. ✅ Body selector shows all available characters
3. ✅ Color picker allows easy color selection
4. ✅ Accessories can be added and positioned
5. ✅ Face customizer allows eye/mouth selection
6. ✅ Randomize creates complete characters
7. ✅ Export image works (PNG data URL)
8. ✅ Data structure matches URL encoding format
9. ✅ UI is mobile-responsive
10. ✅ All interactions are kid-friendly (big buttons, visual)

## 🎓 Key Deliverables

- `/public/builder-character.php` (main page)
- `/public/assets/js/CharacterCanvas.js`
- `/public/assets/js/CharacterBuilderUI.js`
- `/public/assets/css/builder.css`
- `/test/test-character-builder.js`
- Documentation on extending with new features

## ⚠️ Common Pitfalls to Avoid

1. **Small Touch Targets**: Kids can't hit tiny buttons
2. **Too Much Text**: Use icons and pictures
3. **Slow Rendering**: Canvas lags on mobile
4. **No Visual Feedback**: Users don't know what's selected
5. **Complex Navigation**: Too many clicks to do something
6. **Missing Undo**: Kids experiment, need to reverse
7. **No Mobile Testing**: Looks great on desktop, breaks on phone
8. **Overwhelming Choices**: Too many options at once

## 🔗 Dependencies for Next Task

Task 07 will need:
- ✅ Character data structure from this task
- ✅ Canvas rendering approach (extend to scene)
- ✅ UI patterns (apply to scene builder)
- ✅ Session storage for passing data between pages

## 🎨 Future Enhancements

- Drag accessories to reposition
- Pinch-to-zoom on canvas
- Undo/redo history
- Save favorite combinations
- Share just the character (no scene)
- Animation preview
- Voice recording for character
- Character templates (pirate, astronaut, etc.)
