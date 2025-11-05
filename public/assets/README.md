# Build a Brainrot - Assets Directory

This directory contains all assets (images, audio, animations) for the Build a Brainrot application.

## 📁 Directory Structure

```
assets/
├── manifest.json          # Master catalog of all assets
├── audio/
│   ├── music/            # Background music tracks (15-30s loops)
│   ├── sfx/              # Sound effects
│   │   ├── reactions/    # Meme sounds (vine boom, airhorn, etc.)
│   │   ├── animals/      # Animal noises
│   │   └── silly/        # Cartoon sounds (boing, honk, etc.)
│   └── voices/           # Voice clips (Gen Z phrases)
├── images/
│   ├── characters/
│   │   ├── bodies/       # Character base shapes (512x512px)
│   │   ├── accessories/  # Hats, shoes, props
│   │   ├── faces/        # Eyes, mouths, expressions
│   │   └── effects/      # Visual effects, overlays
│   ├── backgrounds/      # Scene backgrounds (1920x1080px)
│   ├── stickers/         # Emoji-style stickers (200x200px)
│   └── ui/               # UI elements, mascot
└── animations/           # Animation definitions (JSON)
```

## 🎨 Asset Specifications

### Images

**Character Bodies**
- Format: PNG with transparency
- Dimensions: 512x512px canvas
- Character centered, ~400px height
- Neutral gray/white base (for color tinting)
- File size: < 200KB

**Accessories**
- Format: PNG with transparency
- Dimensions: 100-200px (proportional to character)
- Positioned to layer on 512x512 character canvas
- File size: < 100KB

**Backgrounds**
- Format: PNG or JPG
- Dimensions: 1920x1080px (landscape)
- Optimized file size: < 300KB

**Stickers**
- Format: PNG with transparency
- Dimensions: 200x200px
- Bold, readable from thumbnail
- File size: < 50KB

### Audio

**Music Tracks**
- Format: MP3, 128kbps
- Duration: 15-30 seconds (seamless loops)
- Volume: Normalized to -14 LUFS
- File size: < 500KB

**Sound Effects**
- Format: MP3, 128kbps
- Duration: 0.5-3 seconds
- Volume: Normalized
- File size: < 100KB

**Voice Clips**
- Format: MP3, 128kbps
- Duration: 1-2 seconds
- Clear pronunciation
- File size: < 50KB

## 📝 Naming Convention

All assets must follow this pattern:
```
category-descriptor-variant.ext
```

### Examples:
- `char-body-shark.png`
- `char-acc-sunglasses-red.png`
- `bg-toilet.png`
- `music-skibidi-beat-01.mp3`
- `sfx-reaction-vine-boom.mp3`
- `sticker-skull-emoji.png`

### Rules:
- All lowercase
- Use hyphens (no spaces or underscores)
- Descriptive but concise
- No special characters
- Sequential variants: `-01`, `-02`, etc.

## 📋 Adding New Assets

### Step 1: Prepare Asset File
1. Ensure file meets specifications above
2. Optimize file size (TinyPNG for images, ffmpeg for audio)
3. Name file following naming convention
4. Place in appropriate directory

### Step 2: Update Manifest
Add entry to `manifest.json`:

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
  "tags": ["animal", "sea", "popular", "kid-favorite"],
  "ageAppropriate": true,
  "license": "CC0",
  "source": "Bing Image Creator",
  "dateAdded": "2025-11-05",
  "fileSize": 45120
}
```

### Step 3: Required Fields

**All Assets:**
- `id` - Unique identifier (matches filename without extension)
- `name` - Human-readable name
- `file` - Relative path from /assets/
- `category` - Asset category
- `tags` - Array of descriptive tags
- `ageAppropriate` - Boolean (must be true)
- `license` - License type (CC0, CC-BY, etc.)
- `source` - Where asset came from
- `dateAdded` - ISO date
- `fileSize` - Size in bytes

**Images:**
- `dimensions` - Width and height in pixels
- `colorizable` - Can be tinted (boolean)

**Audio:**
- `duration` - Length in seconds
- `bpm` - Beats per minute (music only)
- `loop` - Can loop seamlessly (boolean)

### Step 4: Validate
Run validation script:
```bash
bash scripts/validate-assets.sh
```

## 🎯 Asset Sources (Free)

### Images
- **AI Generation**: Bing Image Creator, Leonardo.ai, Ideogram.ai
- **Asset Libraries**: OpenGameArt.org, Kenney.nl, Flaticon.com
- **Manual**: Figma (free), Inkscape (open source)

### Audio
- **Music**: Incompetech.com, Pixabay Audio, YouTube Audio Library
- **SFX**: Freesound.org, BBC Sound Effects, Zapsplat.com
- **Voices**: Text-to-Speech (Web Speech API, ElevenLabs free tier)

## 🔒 Content Guidelines

All assets must be:
- ✅ Kid-appropriate (7+ years old)
- ✅ Free from violence, mature themes
- ✅ Properly licensed (CC0, CC-BY, or custom permission)
- ✅ Optimized for web delivery
- ✅ Tested in browser

## 🛠️ Tools

**Image Optimization:**
- TinyPNG: https://tinypng.com
- ImageOptim (Mac): https://imageoptim.com
- Command line: `pngquant --quality=80-95 image.png`

**Audio Processing:**
```bash
# Convert to MP3, 128kbps
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# Normalize volume
ffmpeg -i input.mp3 -af loudnorm=I=-14:LRA=11:TP=-1.5 output.mp3

# Trim silence
ffmpeg -i input.mp3 -af silenceremove=1:0:-50dB output.mp3
```

## 📊 Current Stats

Check `manifest.json` → `metadata.assetCounts` for current totals.

**Target Counts:**
- Character bodies: 12+
- Accessories: 15+
- Backgrounds: 8+
- Stickers: 15+
- Music tracks: 15+
- Sound effects: 40+
- Voice clips: 10+

## 🚀 Quick Start

1. Place asset file in correct directory
2. Add entry to manifest.json
3. Run validation: `bash scripts/validate-assets.sh`
4. Test in browser: Open `test/asset-gallery.html`
5. Commit with clear message: `git commit -m "Add shark character body"`

## 📞 Questions?

See main project README or Task 01 documentation for more details.
