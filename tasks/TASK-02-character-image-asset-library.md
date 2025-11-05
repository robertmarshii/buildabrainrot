# TASK 02: Character & Image Asset Library Creation

## 🎓 Lessons Learned from Task 01

### What Worked Well
- Having a clear directory structure from the start prevented reorganization later
- Manifest schema provided a blueprint for asset metadata
- Placeholder files helped validate the file structure
- Documentation made the system self-explanatory

### What to Improve
- **Be Specific About Dimensions**: Task 01 mentioned dimensions but didn't enforce them - this task will create actual spec sheets
- **Automate Validation**: Manual checks were tedious - this task will include validation scripts
- **Think About Relationships**: Assets don't exist in isolation - document which accessories work with which characters
- **Start with Quality Over Quantity**: Better to have 10 well-crafted assets than 50 mediocre ones

### Applied to Task 02
- Create detailed asset specifications BEFORE sourcing
- Build validation tooling alongside assets
- Document asset relationships in manifest
- Focus on 15-20 high-quality, kid-friendly assets first

---

## 🎯 Goal
Build a comprehensive library of character bodies, accessories, facial features, backgrounds, and stickers that are optimized, kid-friendly, and work together cohesively. All assets must be properly cataloged in the manifest with complete metadata.

## 📋 What's Required for Completion

### 1. Character Bodies (Minimum 12)
- 6 animals: shark, cat, dog, banana, pickle, monkey
- 3 objects: toilet, phone, sneaker
- 3 fantasy: blob, alien, robot

Requirements per asset:
- PNG with transparency
- 512x512px canvas size
- Character centered, ~400px height
- Consistent art style (cartoonish, bold outlines)
- Colorizable base (neutral gray/white that can be tinted)
- Clear attachment points for accessories

### 2. Accessories (Minimum 15)
- **Headwear** (5): crown, baseball cap, beanie, party hat, sunglasses
- **Footwear** (3): sneakers, boots, slippers
- **Props** (4): microphone, skateboard, balloon, pizza slice
- **Clothing** (3): bowtie, cape, vest

Requirements per accessory:
- PNG with transparency
- Sized appropriately (100-200px)
- Designed to layer on 512x512 character canvas
- Works with multiple character types
- Metadata includes `attachPoint` (head/feet/hand/body)

### 3. Facial Features (Minimum 10)
- **Eyes** (4): googly, sleepy, spiral, hearts
- **Mouths** (4): silly grin, shocked, tongue out, derp
- **Special** (2): mustache, tears of joy

Requirements:
- PNG with transparency
- Positioned for standard character face area
- Expressive and kid-friendly

### 4. Backgrounds (Minimum 8)
- toilet, classroom, space, underwater, McDonald's, bedroom, city street, rainbow gradient

Requirements:
- PNG or JPG
- 1920x1080px (landscape orientation)
- Optimized file size (<300KB)
- Safe for kids (no inappropriate content)
- Vibrant colors matching "brainrot" aesthetic

### 5. Stickers/Effects (Minimum 15)
- **Emojis** (5): skull (💀), fire (🔥), laugh-cry, sunglasses, exploding head
- **Effects** (5): explosion, sparkles, lightning bolt, stars, sweat drops
- **Text** (5): "POV:", "fr fr", "no cap", "bussin'", "sheesh"

Requirements:
- PNG with transparency
- 200x200px standard size
- Can overlay on any background
- Bold, readable from thumbnail size

## 🛠️ Best Implementation Approach

### Phase 1: Asset Sourcing Strategy

**Option A: AI Generation (Recommended Start)**
Use free AI tools to generate consistent style:
- **Bing Image Creator** (free, powered by DALL-E 3)
- **Leonardo.ai** (free tier: 150 images/day)
- **Ideogram.ai** (free tier available)

Prompt template:
```
"Cartoon [character] character, simple bold outlines, flat colors,
transparent background, kid-friendly, facing forward, full body,
Gen Z meme aesthetic, white base color for recoloring"
```

**Option B: Free Asset Libraries**
- **OpenGameArt.org**: Game sprites (CC0/CC-BY)
- **Kenney.nl**: Game assets (CC0)
- **Flaticon.com**: Icons (free tier with attribution)
- **Freepik.com**: Illustrations (free tier with attribution)

**Option C: Manual Creation**
- Use Figma (free) or Inkscape (open source)
- Follow style guide strictly
- Export at correct dimensions

### Phase 2: Asset Processing Pipeline

1. **Acquisition**: Download/generate raw assets
2. **Processing**:
   ```bash
   # Resize to exact dimensions
   convert input.png -resize 512x512 -gravity center -extent 512x512 output.png

   # Optimize file size
   pngquant --quality=80-95 output.png
   ```
3. **Validation**: Run checks (dimensions, file size, format)
4. **Cataloging**: Add entry to manifest.json
5. **Testing**: Load in browser to verify

### Phase 3: Manifest Population

For each asset, create complete manifest entry:
```json
{
  "id": "char-body-shark",
  "name": "Silly Shark",
  "file": "images/characters/bodies/char-body-shark.png",
  "category": "character-body",
  "type": "animal",
  "dimensions": {
    "width": 512,
    "height": 512
  },
  "colorizable": true,
  "defaultColor": "#808080",
  "attachmentPoints": {
    "head": {"x": 256, "y": 120},
    "feet": {"x": 256, "y": 450},
    "hand": {"x": 180, "y": 280}
  },
  "compatibleAccessories": [
    "acc-head-sunglasses",
    "acc-feet-sneakers",
    "acc-prop-pizza"
  ],
  "tags": ["animal", "sea", "popular", "kid-favorite"],
  "ageAppropriate": true,
  "license": "CC0",
  "source": "Bing Image Creator",
  "dateAdded": "2025-11-05",
  "fileSize": 45120
}
```

### Phase 4: Create Asset Validation Script

```php
// scripts/validate-assets.php
<?php
function validateImageAsset($manifestEntry) {
    $file = "public/assets/" . $manifestEntry['file'];

    // Check file exists
    if (!file_exists($file)) {
        return ["error" => "File not found: $file"];
    }

    // Check dimensions
    $info = getimagesize($file);
    if ($info[0] !== $manifestEntry['dimensions']['width'] ||
        $info[1] !== $manifestEntry['dimensions']['height']) {
        return ["error" => "Dimension mismatch for $file"];
    }

    // Check file size
    $size = filesize($file);
    if ($size > 500000) { // 500KB limit
        return ["warning" => "File size large: " . ($size/1024) . "KB"];
    }

    return ["success" => true];
}
```

### Phase 5: Create Style Guide

Document visual consistency rules:
- **Line Weight**: 4-6px outlines
- **Color Palette**: Pastel chaos (bright but not harsh)
- **Character Proportions**: Big heads, stubby limbs (chibi-style)
- **Shading**: Minimal (flat design preferred)
- **Background Complexity**: Not too busy (character should pop)

## ✅ Completion Checks

### Automated Validation Script

```bash
#!/bin/bash
# validate-image-assets.sh

echo "🔍 Validating Image Assets..."

# Check character bodies
BODY_COUNT=$(find public/assets/images/characters/bodies -name "*.png" | wc -l)
echo "Character bodies found: $BODY_COUNT (need 12)"
[ $BODY_COUNT -ge 12 ] && echo "✓" || echo "✗ Need more bodies"

# Check accessories
ACC_COUNT=$(find public/assets/images/characters/accessories -name "*.png" | wc -l)
echo "Accessories found: $ACC_COUNT (need 15)"
[ $ACC_COUNT -ge 15 ] && echo "✓" || echo "✗ Need more accessories"

# Check backgrounds
BG_COUNT=$(find public/assets/images/backgrounds -name "*" -type f | wc -l)
echo "Backgrounds found: $BG_COUNT (need 8)"
[ $BG_COUNT -ge 8 ] && echo "✓" || echo "✗ Need more backgrounds"

# Check stickers
STICKER_COUNT=$(find public/assets/images/stickers -name "*.png" | wc -l)
echo "Stickers found: $STICKER_COUNT (need 15)"
[ $STICKER_COUNT -ge 15 ] && echo "✓" || echo "✗ Need more stickers"

# Validate all PNGs have transparency
echo -e "\n🔍 Checking PNG transparency..."
for img in public/assets/images/characters/bodies/*.png; do
    if identify -format '%[opaque]' "$img" | grep -q 'true'; then
        echo "⚠️  No transparency: $img"
    fi
done

# Check file sizes
echo -e "\n🔍 Checking file sizes..."
find public/assets/images -type f -size +500k -exec echo "⚠️  Large file: {}" \;

echo -e "\n✅ Validation complete!"
```

### Manual Quality Checks

- [ ] All characters have consistent art style
- [ ] All assets load in browser without errors
- [ ] Accessories visually fit on character bodies
- [ ] Backgrounds don't clash with character colors
- [ ] All content is kid-appropriate (no violence, mature themes)
- [ ] Stickers are readable at small sizes
- [ ] Color palette feels cohesive across all assets

### Manifest Completeness Checks

```javascript
// test-manifest.js
fetch('/assets/manifest.json')
  .then(r => r.json())
  .then(manifest => {
    // Check minimum counts
    console.assert(
      manifest.images.characters.bodies.length >= 12,
      'Need 12+ character bodies'
    );

    console.assert(
      manifest.images.characters.accessories.length >= 15,
      'Need 15+ accessories'
    );

    // Check all entries have required fields
    manifest.images.characters.bodies.forEach(asset => {
      console.assert(asset.id, 'Missing ID');
      console.assert(asset.file, 'Missing file path');
      console.assert(asset.dimensions, 'Missing dimensions');
      console.assert(asset.tags, 'Missing tags');
    });

    console.log('✓ Manifest validation passed');
  });
```

### Visual Regression Test

Create test page showing all assets:
```html
<!-- test/asset-gallery.html -->
<!DOCTYPE html>
<html>
<head><title>Asset Gallery Test</title></head>
<body>
  <h1>Character Bodies</h1>
  <div id="bodies"></div>

  <h1>Accessories</h1>
  <div id="accessories"></div>

  <script>
    fetch('/assets/manifest.json')
      .then(r => r.json())
      .then(manifest => {
        // Display all character bodies
        manifest.images.characters.bodies.forEach(asset => {
          const img = document.createElement('img');
          img.src = '/assets/' + asset.file;
          img.title = asset.name;
          img.style.width = '200px';
          document.getElementById('bodies').appendChild(img);
        });

        // Display all accessories
        manifest.images.characters.accessories.forEach(asset => {
          const img = document.createElement('img');
          img.src = '/assets/' + asset.file;
          img.title = asset.name;
          img.style.width = '100px';
          document.getElementById('accessories').appendChild(img);
        });
      });
  </script>
</body>
</html>
```

### Functional Tests

1. **Loading Test**: All assets load without 404 errors
2. **Layering Test**: Accessories render correctly over character bodies
3. **Color Tint Test**: Colorizable assets can be tinted successfully
4. **Transparency Test**: PNGs maintain transparency
5. **Mobile Test**: Assets display correctly on mobile viewport

## 📊 Success Criteria

Task 02 is complete when:
1. ✅ Minimum asset counts met (12 bodies, 15 accessories, 8 backgrounds, 15 stickers)
2. ✅ All assets follow specification (dimensions, format, file size)
3. ✅ Manifest.json populated with complete metadata for all assets
4. ✅ Validation scripts pass with 0 errors
5. ✅ All assets are kid-appropriate and reviewed
6. ✅ Test gallery page displays all assets correctly
7. ✅ Style guide documented
8. ✅ Asset relationships defined (which accessories work with which bodies)
9. ✅ File sizes optimized (total asset folder <50MB)
10. ✅ Attribution/licensing documented for all assets

## 🎓 Key Deliverables

- 50+ image assets (bodies, accessories, backgrounds, stickers)
- Complete manifest.json with all image assets cataloged
- Validation script (bash or PHP)
- Test gallery page (asset-gallery.html)
- Style guide documentation
- Asset sourcing documentation (where to find more)
- scripts/ folder with validation tools

## ⚠️ Common Pitfalls to Avoid

1. **Inconsistent Art Styles**: Mix of realistic and cartoon looks jarring
2. **Missing Transparency**: Forgot to remove backgrounds
3. **Oversized Files**: Didn't optimize PNGs, slowing load times
4. **Poor Accessibility**: Some accessories don't fit any characters
5. **Inappropriate Content**: Didn't thoroughly review for kid-safety
6. **Hardcoded Relationships**: Should be in manifest, not code
7. **No Version Control**: Commit assets in logical batches with clear messages

## 🔗 Dependencies for Next Task

Task 03 will need:
- ✅ Understanding of manifest structure (proven here)
- ✅ Validation script template (adapt for audio)
- ✅ File organization strategy (apply to audio library)
- ✅ Quality bar established (maintain for audio assets)
- ✅ Test page pattern (create audio player test page)

## 🎨 Bonus Enhancements (If Time Permits)

- Create character "sets" (pirate theme: shark + eyepatch + hook)
- Add seasonal accessories (Santa hat, bunny ears)
- Include template character (base shape for custom drawing)
- Create asset "preview cards" (thumbnails with metadata)
- Build simple asset browser UI
