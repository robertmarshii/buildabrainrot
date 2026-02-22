# Quick Guide: Add Real Audio Files

The app is working! You just need real MP3 files. Here's the fastest way:

## Option 1: Quick Manual Download (5 minutes)

### Background Music

1. **Go to Pixabay Music**: https://pixabay.com/music/search/lofi/
2. Download any Lo-Fi track you like
3. Rename it to: `music-chill-lofi-01.mp3`
4. Place in: `public/assets/audio/music/`

5. **Go to Pixabay Music**: https://pixabay.com/music/search/electronic/
6. Download any electronic/energetic track
7. Rename it to: `music-skibidi-beat-01.mp3`
8. Place in: `public/assets/audio/music/`

### Sound Effects (Pick 2-3 to start)

**Freesound.org** (requires free account):

1. **Vine Boom**: https://freesound.org/search/?q=boom+impact
   - Download, rename to: `sfx-reaction-vine-boom.mp3`
   - Place in: `public/assets/audio/sfx/reactions/`

2. **Airhorn**: https://freesound.org/search/?q=airhorn
   - Download, rename to: `sfx-reaction-airhorn.mp3`
   - Place in: `public/assets/audio/sfx/reactions/`

3. **Dog Bark**: https://freesound.org/search/?q=dog+bark
   - Download, rename to: `sfx-animal-dog-bark.mp3`
   - Place in: `public/assets/audio/sfx/animals/`

4. **Boing**: https://freesound.org/search/?q=boing+spring
   - Download, rename to: `sfx-silly-boing.mp3`
   - Place in: `public/assets/audio/sfx/silly/`

### After Adding Files

1. Refresh your browser (Ctrl+F5 to clear cache)
2. Click Play - you should hear music!
3. Add sound effects to the timeline - you should hear them!

## Option 2: Even Faster - Use Archive.org

Archive.org has public domain audio that doesn't require an account:

**Background Music:**
- Search: https://archive.org/details/audio
- Filter by: "Public Domain" or "Creative Commons"
- Download MP3, rename as above

## Option 3: Text-to-Speech for Voices

Use **TTSMaker.com** (no account needed):
1. Go to: https://ttsmaker.com/
2. Type: "Sheesh!"
3. Click "Convert to Speech"
4. Download as MP3
5. Rename to: `voice-sheesh.mp3`
6. Place in: `public/assets/audio/voices/`

## File Naming Guide

The filenames MUST match what's in `manifest.json`:

### Music Files (in `public/assets/audio/music/`)
- `music-skibidi-beat-01.mp3`
- `music-chill-lofi-01.mp3`

### Reaction SFX (in `public/assets/audio/sfx/reactions/`)
- `sfx-reaction-vine-boom.mp3`
- `sfx-reaction-airhorn.mp3`
- `sfx-reaction-oof.mp3`
- `sfx-reaction-bruh.mp3`
- `sfx-reaction-scream.mp3`
- `sfx-reaction-wow.mp3`
- `sfx-reaction-applause.mp3`

### Animal SFX (in `public/assets/audio/sfx/animals/`)
- `sfx-animal-dog-bark.mp3`

### Silly SFX (in `public/assets/audio/sfx/silly/`)
- `sfx-silly-boing.mp3`
- `sfx-silly-honk.mp3`
- `sfx-silly-fart.mp3`
- `sfx-silly-whoosh.mp3`
- `sfx-silly-pop.mp3`
- `sfx-silly-glass-break.mp3`

### Meme SFX (in `public/assets/audio/sfx/meme/`)
- `sfx-meme-metal-pipe.mp3`
- `sfx-meme-error.mp3`
- `sfx-meme-discord-join.mp3`
- `sfx-meme-crickets.mp3`
- `sfx-meme-record-scratch.mp3`
- `sfx-meme-explosion.mp3`

### Voices (in `public/assets/audio/voices/`)
- `voice-sheesh.mp3`
- `voice-nocap.mp3`

## Important Notes

- Files MUST be MP3 format (not WAV, OGG, etc.)
- Files MUST have exact names listed above
- After adding, refresh browser with Ctrl+F5
- You don't need to add ALL sounds - start with just music and a few SFX!

## Verify It Worked

After adding files, open browser console and you should see:
- ✅ No "Audio load error" messages for files you added
- ✅ "Music set: [name]" without errors
- ✅ Sound plays when you click Play button!
