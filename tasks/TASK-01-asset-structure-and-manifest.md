# TASK 01: Asset Structure and Manifest System Setup

## 🎯 Goal
Establish the foundational asset management system including folder structure, naming conventions, and a master manifest file that will serve as the single source of truth for all assets in the application.

## 📋 What's Required for Completion

### 1. Folder Structure
```
public/assets/
├── manifest.json
├── audio/
│   ├── music/
│   ├── sfx/
│   │   ├── reactions/
│   │   ├── animals/
│   │   └── silly/
│   └── voices/
├── images/
│   ├── characters/
│   │   ├── bodies/
│   │   ├── accessories/
│   │   ├── faces/
│   │   └── effects/
│   ├── backgrounds/
│   ├── stickers/
│   └── ui/
└── animations/
```

### 2. Manifest Schema (manifest.json)
A comprehensive JSON file that catalogs:
- All audio files (music, sfx, voices) with metadata
- All image assets with dimensions, tags, categories
- Animation definitions
- Version control
- Licensing information
- Asset relationships (which accessories fit which characters)

### 3. Naming Convention Documentation
Clear rules for asset file naming:
- Pattern: `category-descriptor-variant.ext`
- Examples: `music-skibidi-beat-01.mp3`, `char-body-shark.png`
- Lowercase with hyphens
- No spaces or special characters

### 4. Asset Guidelines Document
Specifications for:
- Image formats (PNG with transparency)
- Image dimensions (512x512 for characters, 1920x1080 for backgrounds)
- Audio formats (MP3, 128kbps)
- File size limits
- Color palette recommendations

## 🛠️ Best Implementation Approach

### Step 1: Create Directory Structure
```bash
mkdir -p public/assets/{audio/{music,sfx/{reactions,animals,silly},voices},images/{characters/{bodies,accessories,faces,effects},backgrounds,stickers,ui},animations}
```

### Step 2: Create Manifest Schema
Define a robust JSON structure:
```json
{
  "version": "1.0.0",
  "updated": "2025-11-05",
  "audio": {
    "music": [],
    "sfx": {
      "reactions": [],
      "animals": [],
      "silly": []
    },
    "voices": []
  },
  "images": {
    "characters": {
      "bodies": [],
      "accessories": [],
      "faces": [],
      "effects": []
    },
    "backgrounds": [],
    "stickers": []
  },
  "animations": [],
  "metadata": {
    "totalAssets": 0,
    "categories": []
  }
}
```

### Step 3: Add Placeholder Assets
Include 2-3 placeholder files in each category with proper naming:
- `audio/music/placeholder-music-01.mp3`
- `images/characters/bodies/placeholder-body-01.png`
- etc.

### Step 4: Create Asset Entry Template
Document the exact format for adding new assets:
```json
{
  "id": "unique-identifier",
  "name": "Human Readable Name",
  "file": "relative/path/to/file.ext",
  "category": "category-name",
  "tags": ["tag1", "tag2"],
  "metadata": {
    // Type-specific metadata
  },
  "license": "CC0",
  "source": "source-url",
  "dateAdded": "2025-11-05"
}
```

### Step 5: Create README.md in /assets/
Documentation explaining:
- Folder purpose
- How to add new assets
- Naming conventions
- Where to find free asset sources
- How the manifest system works

## ✅ Completion Checks

### Automated Checks

1. **Directory Structure Validation**
```bash
# Check all required directories exist
test -d public/assets/audio/music && \
test -d public/assets/audio/sfx/reactions && \
test -d public/assets/audio/sfx/animals && \
test -d public/assets/audio/sfx/silly && \
test -d public/assets/audio/voices && \
test -d public/assets/images/characters/bodies && \
test -d public/assets/images/characters/accessories && \
test -d public/assets/images/characters/faces && \
test -d public/assets/images/characters/effects && \
test -d public/assets/images/backgrounds && \
test -d public/assets/images/stickers && \
test -d public/assets/images/ui && \
test -d public/assets/animations && \
echo "✓ All directories exist"
```

2. **Manifest Validation**
```bash
# Validate JSON syntax
cat public/assets/manifest.json | jq '.' > /dev/null && echo "✓ Valid JSON"

# Check required top-level keys
cat public/assets/manifest.json | jq -e '.version, .audio, .images, .animations' > /dev/null && echo "✓ Has required keys"
```

3. **File Naming Convention Check**
```bash
# Ensure no files with spaces or uppercase in names
find public/assets -type f -name "* *" | wc -l
# Should return 0

find public/assets -type f -name "*[A-Z]*" | wc -l
# Should return 0 (except README.md)
```

### Manual Checks

- [ ] Open manifest.json in browser - valid JSON, no errors
- [ ] All directories accessible via browser (check one file in each)
- [ ] README.md is clear and actionable for future contributors
- [ ] Placeholder assets are properly formatted and loadable
- [ ] Manifest version number follows semantic versioning

### Documentation Checks

- [ ] ASSETS.md or README.md exists in /assets/ folder
- [ ] Naming convention rules documented
- [ ] Asset specifications documented (dimensions, formats, size limits)
- [ ] Example asset entries provided
- [ ] Sources for free assets listed

### Functional Checks

1. **Manifest Accessibility Test**
```javascript
// Test in browser console at http://localhost:7777
fetch('/assets/manifest.json')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Manifest loaded:', data.version);
    console.log('✓ Audio categories:', Object.keys(data.audio));
    console.log('✓ Image categories:', Object.keys(data.images));
  });
```

2. **Asset Loading Test**
```javascript
// Try loading a placeholder asset
const img = new Image();
img.onload = () => console.log('✓ Image loaded successfully');
img.onerror = () => console.log('✗ Image failed to load');
img.src = '/assets/images/characters/bodies/placeholder-body-01.png';
```

## 📊 Success Criteria

Task 01 is complete when:
1. ✅ All 13+ directories exist and are web-accessible
2. ✅ manifest.json exists with valid schema and can be fetched
3. ✅ At least 2-3 placeholder assets exist in each major category
4. ✅ README/documentation exists explaining the system
5. ✅ All automated checks pass
6. ✅ Asset naming follows documented convention
7. ✅ Manifest includes proper metadata (version, updated date)
8. ✅ System is ready for Task 02 to add real assets

## 🎓 Key Deliverables

- `/public/assets/` folder structure (13+ directories)
- `/public/assets/manifest.json` (valid JSON schema)
- `/public/assets/README.md` (documentation)
- Placeholder assets (6-10 files minimum)
- Validation scripts or tests
- Clear pathway to Task 02

## ⚠️ Common Pitfalls to Avoid

1. **Inconsistent Naming**: Establish convention BEFORE adding real assets
2. **Missing CORS Headers**: Ensure assets are web-accessible
3. **Overly Complex Manifest**: Start simple, iterate
4. **No Versioning**: Always include version number in manifest
5. **Hardcoded Paths**: Use relative paths in manifest
6. **No Documentation**: Future you will thank present you

## 🔗 Dependencies for Next Task

Task 02 will need:
- ✅ Working manifest.json schema
- ✅ Clear asset naming convention
- ✅ Image asset directories ready
- ✅ Documentation on how to add new assets
- ✅ Understanding of asset metadata requirements
