# Assets Status and TODO

## Current Status

### ✅ Working Assets

#### Images
- **Character Bodies**: 6 total (shark PNG, cat/banana/dog/pickle/cube SVGs) - ✅ Good quality
- **Accessories**: 4 total (sunglasses/crown/hat SVGs, sneakers PNG) - ✅ Good quality
- **Backgrounds**: 3 total (toilet/classroom/space PNGs) - ✅ Good quality
- **Stickers**: 3 total (skull/fire/sheesh-text PNGs) - ⚠️ **Basic placeholders, recommend replacing**

#### Audio
- **Status**: Placeholder silent files created
- **Note**: App works without audio, but no sound will play
- All audio features are functional but silent

### ⚠️ Assets Needing Replacement

All audio files in `public/assets/audio/` are currently silent placeholders. For a production version, these need to be replaced with actual audio files.

## Adding Real Audio Files

### Free Audio Sources (CC0/Royalty-Free)

1. **Music Tracks** (2 needed):
   - `audio/music/music-skibidi-beat-01.mp3` (20 seconds, upbeat/chaotic)
   - `audio/music/music-chill-lofi-01.mp3` (30 seconds, calm/relaxing)

   **Sources**:
   - Pixabay Music: https://pixabay.com/music/
   - Incompetech: https://incompetech.com/music/
   - Free Music Archive: https://freemusicarchive.org/

2. **Sound Effects** (5 needed):
   - `audio/sfx/reactions/sfx-reaction-vine-boom.mp3` (1-2 sec, dramatic boom)
   - `audio/sfx/reactions/sfx-reaction-airhorn.mp3` (1-2 sec, loud horn)
   - `audio/sfx/animals/sfx-animal-dog-bark.mp3` (1 sec, dog bark)
   - `audio/sfx/silly/sfx-silly-boing.mp3` (0.5-1 sec, cartoon boing)
   - `audio/sfx/silly/sfx-silly-honk.mp3` (0.5-1 sec, clown honk)

   **Sources**:
   - Freesound: https://freesound.org/
   - Zapsplat: https://www.zapsplat.com/
   - BBC Sound Effects: https://sound-effects.bbcrewind.co.uk/

3. **Voice Clips** (2 needed):
   - `audio/voices/voice-sheesh.mp3` (1 sec, "Sheesh!" exclamation)
   - `audio/voices/voice-nocap.mp3` (1 sec, "No cap!" phrase)

   **Options**:
   - Use Text-to-Speech: https://ttsmp3.com/
   - Record yourself
   - Use voice samples from Freesound

### How to Replace Audio

1. Download or create your audio file
2. Convert to MP3 format (recommended) or OGG
3. Place in the appropriate directory under `public/assets/audio/`
4. Match the filename exactly as listed in `public/assets/manifest.json`
5. Test in the audio-builder.php page

### Audio Requirements

- **Format**: MP3 (preferred) or OGG
- **Sample Rate**: 44100 Hz recommended
- **Bit Rate**: 128kbps minimum
- **Channels**: Mono or Stereo
- **Kid-Friendly**: All content must be appropriate for ages 7+

## Generating More Image Assets

If you want to add more characters, accessories, or backgrounds:

1. Use AI image generators (Bing Image Creator, DALL-E, Stable Diffusion)
2. Create SVG graphics manually for simple shapes
3. Use free illustration sites like unDraw or Freepik

### Image Specifications

- **Character Bodies**: 512x512px, transparent background, PNG or SVG
- **Accessories**: Variable size, transparent background, PNG or SVG
- **Backgrounds**: 1920x1080px, PNG or JPG
- **Stickers**: 200x200px recommended, transparent background, PNG

## Adding Assets to the App

After adding new files:

1. Update `public/assets/manifest.json` with the new asset metadata
2. Clear browser cache to reload the manifest
3. Test in the appropriate builder page

## Current Issues Fixed

✅ Scene builder layout fits on screen
✅ Character canvas doesn't overflow container
✅ Accessories have independent positions (no shared position bug)
✅ Audio features work without crashing (silent placeholders)

## Known Limitations

- Audio is silent (placeholders only)
- Limited number of assets (starter set)
- Some advanced features may need real audio for full experience

## For Contributors

If you're adding assets to this project:
- Ensure all assets are properly licensed (CC0, CC-BY, or original)
- Add attribution in manifest.json if required by license
- Test assets in all builder pages before committing
- Keep file sizes reasonable (under 500KB for images, under 2MB for audio)
