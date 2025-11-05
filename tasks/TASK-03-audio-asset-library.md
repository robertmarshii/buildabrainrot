# TASK 03: Audio Asset Library Setup and Organization

## 🎓 Lessons Learned from Previous Tasks

### From Task 01 (Asset Structure)
- Clear directory structure prevents future reorganization
- Manifest schema is crucial before adding content
- Documentation saves time when onboarding contributors
- **Applied**: Audio library will use same manifest pattern

### From Task 02 (Image Assets)
- Quality > Quantity: 20 good assets better than 50 mediocre
- Validation scripts catch errors early
- Test gallery page helps visual verification
- Specifications must be enforced, not just suggested
- Asset relationships matter (accessories + bodies)
- **Applied**: Audio will have duration limits, preview player, compatibility rules

### New Learning for Task 03
- **Audio is Different**: Can't visually scan, need player for testing
- **Licensing is Critical**: Audio copyright stricter than images
- **File Size Matters More**: Audio files larger than images
- **Context Matters**: Same sound works differently in different combinations

---

## 🎯 Goal
Build a comprehensive, kid-friendly audio library including background music, sound effects, and voice clips. All audio must be properly licensed (free/CC0), optimized for web, and cataloged with detailed metadata including duration, BPM, and vibe matching.

## 📋 What's Required for Completion

### 1. Background Music (Minimum 15 tracks)

**By Vibe Category:**
- **Skibidi** (3): Glitchy, weird electronic, chaotic beats
- **Rizzler** (3): Smooth hip-hop, confident, swagger
- **Goofy** (3): Circus, silly, bouncy melodies
- **Hyperpop** (2): Fast, energetic, auto-tuned
- **Chill** (2): Lo-fi, calm, relaxing
- **Epic** (2): Dramatic, orchestral, intense

**Requirements per track:**
- MP3 format, 128kbps
- 15-30 second loops (seamless)
- File size: <500KB each
- Volume normalized (-14 LUFS standard)
- Instrumental only (no vocals that could be inappropriate)
- Metadata: BPM, key, mood tags

### 2. Sound Effects (Minimum 40)

**Reactions** (10):
- vine-boom, airhorn, record-scratch, dramatic-gasp, ohhh, bruh, oof, sheesh, crickets, laugh-track

**Animals** (8):
- dog-bark, cat-meow, monkey-screech, duck-quack, roar, squeak, horse-neigh, cow-moo

**Silly** (12):
- boing, honk, slide-whistle, kazoo, trombone-fail, pop, whoosh, splat, squeak, bubble-pop, spring, cartoon-run

**Musical** (5):
- cymbal-crash, drum-roll, guitar-strum, piano-plonk, xylophone-descend

**Impact** (5):
- explosion, thud, crash, glass-break, door-slam

**Requirements per SFX:**
- MP3 format, 128kbps
- 0.5-3 seconds duration
- File size: <100KB each
- Volume normalized
- Clean audio (no background noise)
- Tagged by emotion/use-case

### 3. Voice Clips (Minimum 10)

Popular Gen Z/Alpha phrases:
- "Sheesh!", "That's bussin'!", "No cap!", "It's giving...", "Slay!",
- "Fr fr!", "Ong!", "Respectfully...", "Not the...", "Tell me why..."

**Requirements:**
- MP3 format, 128kbps
- 1-2 seconds duration
- Clear pronunciation
- Kid-appropriate language only
- Neutral accent (or multiple accent variations)

**Generation method:**
- Use Text-to-Speech (Web Speech API or ElevenLabs free tier)
- Apply silly voice effects (chipmunk, robot, etc.)
- Or record and pitch-shift for anonymity

### 4. Audio Combination Rules

Document which sounds work well together:
```json
{
  "combos": [
    {
      "name": "Maximum Chaos",
      "music": "music-hyperpop-01",
      "sfx": ["vine-boom", "airhorn", "honk"],
      "vibe": "chaotic"
    },
    {
      "name": "Silly Vibes",
      "music": "music-goofy-circus",
      "sfx": ["boing", "kazoo", "slide-whistle"],
      "vibe": "playful"
    }
  ]
}
```

## 🛠️ Best Implementation Approach

### Phase 1: Source Free Audio Assets

**Trusted Free Sources:**

1. **Freesound.org** (CC0 and CC-BY)
   - Search: "cartoon sound effects", "comedy", "silly"
   - Filter by: Creative Commons, short duration
   - Download: WAV or MP3

2. **Incompetech.com** (Kevin MacLeod - CC-BY)
   - Extensive music library
   - Filter by mood/genre
   - Already optimized for web

3. **Pixabay Audio** (CC0)
   - No attribution required
   - Good sound effects library
   - Decent music selection

4. **BBC Sound Effects** (Free for personal/educational)
   - Professional quality
   - Extensive library
   - Check license restrictions

5. **Zapsplat.com** (Free tier available)
   - Great for cartoon/comedy sounds
   - Requires free account
   - Standard license included

6. **YouTube Audio Library** (No attribution)
   - Royalty-free music
   - Filter by mood/genre
   - Direct download

**Search Strategy:**
```
Freesound: "cartoon [sound]", "comedy [sound]", "funny [sound]"
Incompetech: Browse by "Funny/Weird" or "Dramatic"
Pixabay: "sound effect", "lo-fi beat", "epic music"
```

### Phase 2: Audio Processing Pipeline

```bash
#!/bin/bash
# process-audio.sh

# 1. Convert to MP3 if needed
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k -ar 44100 output.mp3

# 2. Trim silence from beginning/end
ffmpeg -i input.mp3 -af silenceremove=1:0:-50dB output-trimmed.mp3

# 3. Normalize volume
ffmpeg -i input.mp3 -af loudnorm=I=-14:LRA=11:TP=-1.5 output-normalized.mp3

# 4. Fade in/out (for music loops)
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=0.5,afade=t=out:st=14.5:d=0.5" output-faded.mp3

# 5. Create seamless loop
ffmpeg -stream_loop 3 -i input.mp3 -t 30 output-loop.mp3
```

### Phase 3: Metadata Extraction

```php
// scripts/analyze-audio.php
<?php
function analyzeAudioFile($filePath) {
    // Get duration
    $cmd = "ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 '$filePath'";
    $duration = trim(shell_exec($cmd));

    // Get file size
    $fileSize = filesize($filePath);

    // Get bitrate
    $cmd = "ffprobe -v error -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 '$filePath'";
    $bitrate = trim(shell_exec($cmd));

    return [
        'duration' => round($duration, 2),
        'fileSize' => $fileSize,
        'bitrate' => round($bitrate / 1000) . 'kbps',
        'format' => pathinfo($filePath, PATHINFO_EXTENSION)
    ];
}
```

### Phase 4: Manifest Population

```json
{
  "audio": {
    "music": [
      {
        "id": "music-skibidi-beat-01",
        "name": "Glitchy Chaos",
        "file": "audio/music/music-skibidi-beat-01.mp3",
        "category": "music",
        "vibe": "skibidi",
        "duration": 20.5,
        "bpm": 140,
        "key": "C minor",
        "loop": true,
        "tags": ["electronic", "chaotic", "weird", "energetic"],
        "mood": ["excited", "chaotic", "silly"],
        "ageAppropriate": true,
        "license": "CC0",
        "source": "Pixabay",
        "sourceUrl": "https://pixabay.com/music/...",
        "attribution": "",
        "dateAdded": "2025-11-05",
        "fileSize": 329600
      }
    ],
    "sfx": {
      "reactions": [
        {
          "id": "sfx-reaction-vine-boom",
          "name": "Vine Boom",
          "file": "audio/sfx/reactions/sfx-reaction-vine-boom.mp3",
          "category": "sfx-reaction",
          "duration": 1.2,
          "tags": ["meme", "dramatic", "popular", "impact"],
          "useCase": ["emphasis", "punchline", "reveal"],
          "popularityRank": 1,
          "ageAppropriate": true,
          "license": "CC0",
          "source": "Freesound",
          "sourceUrl": "https://freesound.org/...",
          "dateAdded": "2025-11-05",
          "fileSize": 19200
        }
      ]
    }
  }
}
```

### Phase 5: Create Audio Test Page

```html
<!-- test/audio-gallery.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Audio Library Test</title>
  <style>
    .audio-item {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 10px;
      display: inline-block;
      width: 250px;
    }
    .audio-item button {
      width: 100%;
      padding: 10px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <h1>🎵 Music Library</h1>
  <div id="music"></div>

  <h1>🔊 Sound Effects</h1>
  <div id="sfx"></div>

  <h1>🗣️ Voice Clips</h1>
  <div id="voices"></div>

  <script>
    let currentlyPlaying = null;

    fetch('/assets/manifest.json')
      .then(r => r.json())
      .then(manifest => {
        // Display music
        manifest.audio.music.forEach(asset => {
          const div = createAudioItem(asset);
          document.getElementById('music').appendChild(div);
        });

        // Display SFX (flatten categories)
        Object.values(manifest.audio.sfx).flat().forEach(asset => {
          const div = createAudioItem(asset);
          document.getElementById('sfx').appendChild(div);
        });

        // Display voices
        manifest.audio.voices.forEach(asset => {
          const div = createAudioItem(asset);
          document.getElementById('voices').appendChild(div);
        });
      });

    function createAudioItem(asset) {
      const div = document.createElement('div');
      div.className = 'audio-item';

      div.innerHTML = `
        <h3>${asset.name}</h3>
        <p><strong>ID:</strong> ${asset.id}</p>
        <p><strong>Duration:</strong> ${asset.duration}s</p>
        <p><strong>Size:</strong> ${(asset.fileSize / 1024).toFixed(1)}KB</p>
        <p><strong>Tags:</strong> ${asset.tags.join(', ')}</p>
        <button onclick="playAudio('${asset.file}', this)">▶️ Play</button>
        <button onclick="stopAudio()">⏹️ Stop</button>
      `;

      return div;
    }

    function playAudio(file, button) {
      stopAudio();
      currentlyPlaying = new Audio('/assets/' + file);
      currentlyPlaying.play();
      button.textContent = '⏸️ Playing...';
      currentlyPlaying.onended = () => {
        button.textContent = '▶️ Play';
      };
    }

    function stopAudio() {
      if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlaying = null;
        document.querySelectorAll('button').forEach(btn => {
          if (btn.textContent.includes('Playing')) {
            btn.textContent = '▶️ Play';
          }
        });
      }
    }
  </script>
</body>
</html>
```

## ✅ Completion Checks

### Automated Validation Script

```bash
#!/bin/bash
# validate-audio-assets.sh

echo "🔍 Validating Audio Assets..."

# Check minimum counts
MUSIC_COUNT=$(find public/assets/audio/music -name "*.mp3" | wc -l)
echo "Music tracks found: $MUSIC_COUNT (need 15)"
[ $MUSIC_COUNT -ge 15 ] && echo "✓" || echo "✗ Need more music"

SFX_COUNT=$(find public/assets/audio/sfx -name "*.mp3" | wc -l)
echo "Sound effects found: $SFX_COUNT (need 40)"
[ $SFX_COUNT -ge 40 ] && echo "✓" || echo "✗ Need more SFX"

VOICE_COUNT=$(find public/assets/audio/voices -name "*.mp3" | wc -l)
echo "Voice clips found: $VOICE_COUNT (need 10)"
[ $VOICE_COUNT -ge 10 ] && echo "✓" || echo "✗ Need more voices"

# Check file sizes
echo -e "\n🔍 Checking file sizes..."
find public/assets/audio/music -type f -size +500k -exec echo "⚠️  Music file too large: {}" \;
find public/assets/audio/sfx -type f -size +100k -exec echo "⚠️  SFX file too large: {}" \;

# Check audio format
echo -e "\n🔍 Checking audio formats..."
find public/assets/audio -type f ! -name "*.mp3" -exec echo "⚠️  Non-MP3 file: {}" \;

# Check for long SFX (should be <3s)
echo -e "\n🔍 Checking SFX durations..."
for sfx in public/assets/audio/sfx/**/*.mp3; do
  duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$sfx" 2>/dev/null)
  if (( $(echo "$duration > 3" | bc -l) )); then
    echo "⚠️  SFX too long (${duration}s): $sfx"
  fi
done

echo -e "\n✅ Audio validation complete!"
```

### Manual Quality Checks

- [ ] Listen to every audio file (no corrupted files)
- [ ] All music loops seamlessly (no pops/clicks)
- [ ] Volume levels consistent across all files
- [ ] No inappropriate content (lyrics, sounds)
- [ ] SFX are recognizable and clear
- [ ] Voice clips are understandable
- [ ] No copyrighted material (all licensed properly)

### Manifest Completeness Check

```javascript
// test-audio-manifest.js
fetch('/assets/manifest.json')
  .then(r => r.json())
  .then(manifest => {
    const music = manifest.audio.music;
    const sfxCount = Object.values(manifest.audio.sfx).flat().length;
    const voices = manifest.audio.voices;

    console.assert(music.length >= 15, `Need 15+ music tracks, have ${music.length}`);
    console.assert(sfxCount >= 40, `Need 40+ SFX, have ${sfxCount}`);
    console.assert(voices.length >= 10, `Need 10+ voices, have ${voices.length}`);

    // Check all entries have required fields
    music.forEach((asset, i) => {
      console.assert(asset.id, `Music ${i}: Missing ID`);
      console.assert(asset.file, `Music ${i}: Missing file`);
      console.assert(asset.duration, `Music ${i}: Missing duration`);
      console.assert(asset.vibe, `Music ${i}: Missing vibe`);
      console.assert(asset.license, `Music ${i}: Missing license`);
      console.assert(asset.source, `Music ${i}: Missing source`);
    });

    console.log('✓ Audio manifest validation passed');
  });
```

### Licensing Audit

- [ ] All assets have license field populated
- [ ] Attribution provided where required (CC-BY)
- [ ] Source URLs documented
- [ ] LICENSES.txt file created listing all audio sources
- [ ] No "All Rights Reserved" content included

### Functional Tests

1. **Loading Test**: All audio files accessible (no 404s)
2. **Playback Test**: Audio plays without errors in browser
3. **Loop Test**: Music tracks loop seamlessly
4. **Volume Test**: No files too quiet or too loud
5. **Mobile Test**: Audio works on iOS/Android browsers
6. **Format Test**: All files are valid MP3s

## 📊 Success Criteria

Task 03 is complete when:
1. ✅ Minimum counts met (15 music, 40 SFX, 10 voices)
2. ✅ All audio properly formatted (MP3, correct bitrate, file sizes)
3. ✅ Manifest populated with complete metadata
4. ✅ All files properly licensed (documented in LICENSES.txt)
5. ✅ Audio test page functional and displays all assets
6. ✅ Validation script passes with 0 errors
7. ✅ All audio is kid-appropriate (manual review completed)
8. ✅ Audio combination rules documented
9. ✅ Processing scripts documented and tested
10. ✅ Total audio folder size reasonable (<30MB)

## 🎓 Key Deliverables

- 65+ audio files (15 music, 40+ SFX, 10+ voices)
- Updated manifest.json with audio entries
- Audio validation script (validate-audio-assets.sh)
- Audio processing scripts (process-audio.sh)
- Audio test page (test/audio-gallery.html)
- LICENSES.txt with all attributions
- Audio combination rules document
- Scripts for future audio additions

## ⚠️ Common Pitfalls to Avoid

1. **Copyright Violation**: Using copyrighted music/memes
2. **Poor Quality**: Low bitrate or noisy recordings
3. **Non-Looping Music**: Awkward gaps when music restarts
4. **Volume Inconsistency**: Some files way louder than others
5. **Missing Attribution**: Forgetting CC-BY requires credit
6. **Inappropriate Content**: Slang that seems innocent but isn't
7. **Format Issues**: Using incompatible audio formats
8. **No Mobile Testing**: Audio doesn't autoplay on iOS

## 🔗 Dependencies for Next Task

Task 04 will need:
- ✅ Complete asset library (images + audio) from Tasks 02-03
- ✅ Understanding of manifest structure
- ✅ Knowledge of what data needs encoding (file paths, IDs)
- ✅ Awareness of data size limits for URL encoding

## 🎵 Bonus Enhancements (If Time Permits)

- Create "audio themes" (full soundscapes: music + SFX combos)
- Add waveform visualizations for each track
- Include BPM auto-detection for future rhythm matching
- Create audio presets for different moods
- Add seasonal audio packs (Halloween, Christmas)
- Build simple audio mixer preview tool
