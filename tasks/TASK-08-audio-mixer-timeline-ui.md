# TASK 08: Audio Mixer and Timeline Interface

## 🎓 Lessons Learned from Previous Tasks

### From Task 03 (Audio Assets)
- Audio library has 65+ files (music, SFX, voices)
- Duration metadata critical for timeline
- Audio combinations create vibe
- **Applied**: Use duration data to visualize timeline

### From Task 06-07 (Builder UIs)
- Big visual buttons work best
- Instant preview is essential
- Randomize is very popular
- **Applied**: Playback preview, one-click audio combos

### From Task 05 (Asset Manager)
- Audio preloading prevents playback delays
- iOS has autoplay restrictions
- **Applied**: Preload on page load, use user interaction to start

### New Challenges for Audio UI
- **Timing Complexity**: Kids need to place SFX at specific times
- **Simplified Timeline**: Can't be too complex like professional DAW
- **Volume Control**: Some sounds louder than others
- **Mobile Playback**: iOS Safari audio quirks
- **Kid-Friendly**: 7-year-olds don't understand "BPM" or "waveforms"

---

## 🎯 Goal
Create a simplified audio mixer interface where kids can select background music, add sound effects at specific times, and preview their creation. Must be simple enough for 7-year-olds while powerful enough to create fun combinations.

## 📋 What's Required for Completion

### 1. Audio Player System

**Core Features:**
- Play/pause/stop controls
- Progress bar showing playback position
- Volume control (global)
- Loop music tracks
- Trigger SFX at specified times
- Sync with visual elements

### 2. Music Selector

```
┌──────────────────────────────────────┐
│  CHOOSE BACKGROUND MUSIC             │
├──────────────────────────────────────┤
│  🎵 Vibes                            │
│  [Skibidi] [Rizzler] [Goofy]        │
│  [Hyperpop] [Chill] [Epic]          │
├──────────────────────────────────────┤
│  Selected: "Glitchy Chaos"           │
│  [▶️ Preview] [Volume: ████████░░]  │
└──────────────────────────────────────┘
```

### 3. Sound Effects Browser

```
┌──────────────────────────────────────┐
│  ADD SOUND EFFECTS                   │
├──────────────────────────────────────┤
│  💥 Reactions  🐾 Animals  🎺 Silly  │
├──────────────────────────────────────┤
│  [💥 Vine Boom]    [🐶 Bark]        │
│  [😂 Laugh]        [📯 Honk]        │
│  [🎺 Trombone]     [💨 Whoosh]      │
│                                      │
│  Click to hear ▶️  |  Drag to add →  │
└──────────────────────────────────────┘
```

### 4. Simple Timeline

```
┌──────────────────────────────────────┐
│  YOUR AUDIO MIX                      │
├──────────────────────────────────────┤
│  0s    2s    4s    6s    8s    10s   │
│  🎵━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ Music (loops)
│      💥        🎺           💥       │ Sound effects
│          😂                          │
│                                      │
│  [▶️ Play] [⏸️ Pause] [🔄 Reset]     │
└──────────────────────────────────────┘
```

### 5. Quick Audio Combos (Templates)

```
┌──────────────────────────────────────┐
│  TRY THESE COMBOS                    │
├──────────────────────────────────────┤
│  [💀 Maximum Chaos]                  │
│  Hyperpop + Vine Boom + Airhorn      │
│                                      │
│  [🤪 Silly Vibes]                    │
│  Goofy music + Honk + Boing          │
│                                      │
│  [😎 Chill Mode]                     │
│  Lo-fi beat + Soft effects           │
└──────────────────────────────────────┘
```

### 6. Voice Clips (Optional)

```
┌──────────────────────────────────────┐
│  ADD VOICE CLIP                      │
├──────────────────────────────────────┤
│  [🗣️ "Sheesh!"]  [🗣️ "No cap!"]    │
│  [🗣️ "Bussin'"]  [🗣️ "Fr fr!"]     │
│                                      │
│  When to play: [Slider: 0s - 10s]   │
└──────────────────────────────────────┘
```

## 🛠️ Best Implementation Approach

### Phase 1: Audio Mixer Class

```javascript
// public/assets/js/AudioMixer.js

class AudioMixer {
  constructor() {
    this.assetManager = window.assetManager;

    this.music = null;
    this.musicVolume = 0.8;

    this.sfxQueue = []; // [{id, audio, time, volume}]
    this.voiceClip = null;

    this.isPlaying = false;
    this.startTime = null;
    this.currentTime = 0;
    this.duration = 20; // Default 20 seconds

    this.onTimeUpdate = null; // Callback for timeline UI
  }

  /**
   * Set background music
   */
  async setMusic(musicId) {
    try {
      // Stop current music if playing
      if (this.music) {
        this.music.pause();
        this.music.currentTime = 0;
      }

      const audio = await this.assetManager.loadAudio(musicId);
      const asset = this.assetManager.findAsset(musicId);

      this.music = audio;
      this.music.loop = true;
      this.music.volume = this.musicVolume;
      this.duration = Math.max(this.duration, asset.duration);

      return asset;
    } catch (error) {
      console.error('Failed to load music:', error);
    }
  }

  /**
   * Add sound effect at specific time
   */
  async addSFX(sfxId, time) {
    try {
      const audio = await this.assetManager.loadAudio(sfxId);
      const asset = this.assetManager.findAsset(sfxId);

      // Clone audio for multiple instances
      const clone = audio.cloneNode();
      clone.volume = 1.0;

      this.sfxQueue.push({
        id: sfxId,
        audio: clone,
        time: time,
        duration: asset.duration,
        played: false
      });

      // Sort by time
      this.sfxQueue.sort((a, b) => a.time - b.time);

      return asset;
    } catch (error) {
      console.error('Failed to load SFX:', error);
    }
  }

  /**
   * Remove SFX by index
   */
  removeSFX(index) {
    this.sfxQueue.splice(index, 1);
  }

  /**
   * Set voice clip
   */
  async setVoice(voiceId, time) {
    try {
      const audio = await this.assetManager.loadAudio(voiceId);

      this.voiceClip = {
        id: voiceId,
        audio: audio,
        time: time,
        played: false
      };
    } catch (error) {
      console.error('Failed to load voice:', error);
    }
  }

  /**
   * Play the mix
   */
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = Date.now() - (this.currentTime * 1000);

    // Start music
    if (this.music) {
      this.music.currentTime = this.currentTime;
      this.music.play().catch(e => {
        console.error('Music playback failed:', e);
      });
    }

    // Reset played flags
    this.sfxQueue.forEach(sfx => {
      sfx.played = sfx.time < this.currentTime;
    });
    if (this.voiceClip) {
      this.voiceClip.played = this.voiceClip.time < this.currentTime;
    }

    // Start update loop
    this.updateLoop();
  }

  /**
   * Pause playback
   */
  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.currentTime = (Date.now() - this.startTime) / 1000;

    if (this.music) {
      this.music.pause();
    }
  }

  /**
   * Stop and reset
   */
  stop() {
    this.pause();
    this.currentTime = 0;

    if (this.music) {
      this.music.currentTime = 0;
    }

    // Reset played flags
    this.sfxQueue.forEach(sfx => sfx.played = false);
    if (this.voiceClip) {
      this.voiceClip.played = false;
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(0);
    }
  }

  /**
   * Seek to time
   */
  seekTo(time) {
    this.currentTime = time;

    if (this.music) {
      this.music.currentTime = time;
    }

    // Reset played flags for items after seek point
    this.sfxQueue.forEach(sfx => {
      if (sfx.time > time) {
        sfx.played = false;
      }
    });

    if (this.voiceClip && this.voiceClip.time > time) {
      this.voiceClip.played = false;
    }

    if (this.isPlaying) {
      this.startTime = Date.now() - (time * 1000);
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(time);
    }
  }

  /**
   * Update loop - check for SFX triggers
   */
  updateLoop() {
    if (!this.isPlaying) return;

    this.currentTime = (Date.now() - this.startTime) / 1000;

    // Check SFX queue
    this.sfxQueue.forEach(sfx => {
      if (!sfx.played && this.currentTime >= sfx.time) {
        sfx.audio.currentTime = 0;
        sfx.audio.play().catch(e => {
          console.error('SFX playback failed:', e);
        });
        sfx.played = true;
      }
    });

    // Check voice clip
    if (this.voiceClip && !this.voiceClip.played &&
        this.currentTime >= this.voiceClip.time) {
      this.voiceClip.audio.play().catch(e => {
        console.error('Voice playback failed:', e);
      });
      this.voiceClip.played = true;
    }

    // Update UI
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime);
    }

    // Loop if reached end
    if (this.currentTime >= this.duration) {
      this.stop();
      this.play(); // Restart
    }

    // Continue loop
    requestAnimationFrame(() => this.updateLoop());
  }

  /**
   * Set volume
   */
  setVolume(volume) {
    this.musicVolume = volume;
    if (this.music) {
      this.music.volume = volume;
    }
  }

  /**
   * Get audio data for encoding
   */
  getAudioData() {
    return {
      music: this.music ? {
        id: this.getMusicId(),
        volume: this.musicVolume
      } : null,
      sfx: this.sfxQueue.map(sfx => ({
        id: sfx.id,
        time: sfx.time
      })),
      voice: this.voiceClip ? {
        id: this.voiceClip.id,
        time: this.voiceClip.time
      } : null
    };
  }

  getMusicId() {
    // Find music ID from asset manager
    // (Stored when setMusic was called)
    // For simplicity, store it as property
    return this._currentMusicId;
  }
}
```

### Phase 2: Timeline UI Component

```javascript
// public/assets/js/TimelineUI.js

class TimelineUI {
  constructor(containerId, mixer) {
    this.container = document.getElementById(containerId);
    this.mixer = mixer;
    this.duration = 20; // seconds
    this.pixelsPerSecond = 50;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="timeline-header">
        <h3>Your Audio Mix</h3>
        <div class="playback-controls">
          <button id="btn-play" class="control-btn">▶️</button>
          <button id="btn-pause" class="control-btn" disabled>⏸️</button>
          <button id="btn-stop" class="control-btn">⏹️</button>
        </div>
      </div>

      <div class="timeline-container">
        <div class="timeline-ruler" id="timeline-ruler"></div>
        <div class="timeline-track" id="music-track">
          <span class="track-label">🎵 Music</span>
          <div class="track-content"></div>
        </div>
        <div class="timeline-track" id="sfx-track">
          <span class="track-label">💥 SFX</span>
          <div class="track-content" id="sfx-content"></div>
        </div>
        <div class="timeline-playhead" id="playhead"></div>
      </div>

      <div class="timeline-footer">
        <span id="current-time">0:00</span> / <span id="total-time">0:20</span>
      </div>
    `;

    this.buildRuler();
    this.setupControls();
    this.setupInteractions();
  }

  buildRuler() {
    const ruler = document.getElementById('timeline-ruler');
    const width = this.duration * this.pixelsPerSecond;

    for (let i = 0; i <= this.duration; i++) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = (i * this.pixelsPerSecond) + 'px';
      tick.textContent = i + 's';
      ruler.appendChild(tick);
    }

    ruler.style.width = width + 'px';
  }

  setupControls() {
    document.getElementById('btn-play').addEventListener('click', () => {
      this.mixer.play();
      document.getElementById('btn-play').disabled = true;
      document.getElementById('btn-pause').disabled = false;
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      this.mixer.pause();
      document.getElementById('btn-play').disabled = false;
      document.getElementById('btn-pause').disabled = true;
    });

    document.getElementById('btn-stop').addEventListener('click', () => {
      this.mixer.stop();
      document.getElementById('btn-play').disabled = false;
      document.getElementById('btn-pause').disabled = true;
      this.updatePlayhead(0);
    });

    // Update playhead during playback
    this.mixer.onTimeUpdate = (time) => {
      this.updatePlayhead(time);
      this.updateTimeDisplay(time);
    };
  }

  setupInteractions() {
    const ruler = document.getElementById('timeline-ruler');

    // Click to seek
    ruler.addEventListener('click', (e) => {
      const rect = ruler.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = x / this.pixelsPerSecond;
      this.mixer.seekTo(Math.max(0, Math.min(time, this.duration)));
    });
  }

  updatePlayhead(time) {
    const playhead = document.getElementById('playhead');
    playhead.style.left = (time * this.pixelsPerSecond) + 'px';
  }

  updateTimeDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    document.getElementById('current-time').textContent =
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Add SFX marker to timeline
   */
  addSFXMarker(sfxId, time) {
    const sfxContent = document.getElementById('sfx-content');
    const marker = document.createElement('div');
    marker.className = 'sfx-marker';
    marker.style.left = (time * this.pixelsPerSecond) + 'px';
    marker.innerHTML = '💥';
    marker.title = sfxId;

    // Click to remove
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = Array.from(sfxContent.children).indexOf(marker);
      this.mixer.removeSFX(index);
      marker.remove();
    });

    sfxContent.appendChild(marker);
  }

  /**
   * Clear all SFX markers
   */
  clearSFXMarkers() {
    document.getElementById('sfx-content').innerHTML = '';
  }
}
```

### Phase 3: Audio Builder UI

```javascript
// public/assets/js/AudioBuilderUI.js

class AudioBuilderUI {
  constructor(mixer, timeline) {
    this.mixer = mixer;
    this.timeline = timeline;
    this.assetManager = window.assetManager;
    this.init();
  }

  async init() {
    await this.assetManager.init();
    this.buildMusicSelector();
    this.buildSFXBrowser();
    this.buildQuickCombos();
    this.buildQuickActions();
  }

  buildMusicSelector() {
    const container = document.getElementById('music-selector');
    const manifest = this.assetManager.manifest;

    // Group by vibe
    const vibes = {};
    manifest.audio.music.forEach(music => {
      const vibe = music.vibe || 'other';
      if (!vibes[vibe]) vibes[vibe] = [];
      vibes[vibe].push(music);
    });

    container.innerHTML = '<h2>Choose Background Music</h2>';

    // Vibe tabs
    const tabs = document.createElement('div');
    tabs.className = 'vibe-tabs';

    Object.keys(vibes).forEach((vibe, index) => {
      const tab = document.createElement('button');
      tab.className = 'vibe-tab' + (index === 0 ? ' active' : '');
      tab.textContent = vibe.charAt(0).toUpperCase() + vibe.slice(1);
      tab.addEventListener('click', () => {
        document.querySelectorAll('.vibe-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showVibeMusic(vibe);
      });
      tabs.appendChild(tab);
    });

    container.appendChild(tabs);

    // Music list
    const musicList = document.createElement('div');
    musicList.id = 'music-list';
    container.appendChild(musicList);

    const showVibeMusic = (vibe) => {
      musicList.innerHTML = '';

      vibes[vibe].forEach(music => {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.innerHTML = `
          <div class="music-info">
            <strong>${music.name}</strong>
            <span class="music-meta">${music.duration}s • ${music.bpm} BPM</span>
          </div>
          <button class="btn-preview" data-id="${music.id}">▶️ Preview</button>
          <button class="btn-select" data-id="${music.id}">✓ Select</button>
        `;

        // Preview button
        item.querySelector('.btn-preview').addEventListener('click', async () => {
          const audio = await this.assetManager.loadAudio(music.id);
          audio.currentTime = 0;
          audio.play();

          // Stop after 5 seconds
          setTimeout(() => audio.pause(), 5000);
        });

        // Select button
        item.querySelector('.btn-select').addEventListener('click', async () => {
          await this.mixer.setMusic(music.id);
          this.mixer._currentMusicId = music.id; // Store for later

          // Visual feedback
          document.querySelectorAll('.music-item').forEach(mi =>
            mi.classList.remove('selected')
          );
          item.classList.add('selected');

          alert(`Selected: ${music.name}`);
        });

        musicList.appendChild(item);
      });
    };

    // Show first vibe by default
    showVibeMusic(Object.keys(vibes)[0]);
  }

  buildSFXBrowser() {
    const container = document.getElementById('sfx-browser');
    const sfxCategories = this.assetManager.manifest.audio.sfx;

    container.innerHTML = '<h2>Add Sound Effects</h2><p class="hint">Click to hear, then add to timeline</p>';

    // Category tabs
    const tabs = document.createElement('div');
    tabs.className = 'sfx-tabs';

    Object.keys(sfxCategories).forEach((category, index) => {
      const tab = document.createElement('button');
      tab.className = 'sfx-tab' + (index === 0 ? ' active' : '');
      tab.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sfx-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showCategorySFX(category);
      });
      tabs.appendChild(tab);
    });

    container.appendChild(tabs);

    // SFX grid
    const sfxGrid = document.createElement('div');
    sfxGrid.id = 'sfx-grid';
    sfxGrid.className = 'sfx-grid';
    container.appendChild(sfxGrid);

    const showCategorySFX = (category) => {
      sfxGrid.innerHTML = '';

      sfxCategories[category].forEach(sfx => {
        const card = document.createElement('div');
        card.className = 'sfx-card';
        card.innerHTML = `
          <div class="sfx-icon">💥</div>
          <p>${sfx.name}</p>
        `;

        // Preview on click
        card.addEventListener('click', async () => {
          const audio = await this.assetManager.loadAudio(sfx.id);
          audio.currentTime = 0;
          audio.play();
        });

        // Add button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-sfx';
        addBtn.textContent = '➕ Add';
        addBtn.addEventListener('click', async (e) => {
          e.stopPropagation();

          // Add at current playback time or random time
          const time = this.mixer.currentTime || Math.random() * 15;

          await this.mixer.addSFX(sfx.id, time);
          this.timeline.addSFXMarker(sfx.id, time);

          // Visual feedback
          addBtn.textContent = '✓ Added!';
          setTimeout(() => {
            addBtn.textContent = '➕ Add';
          }, 1000);
        });

        card.appendChild(addBtn);
        sfxGrid.appendChild(card);
      });
    };

    // Show first category
    showCategorySFX(Object.keys(sfxCategories)[0]);
  }

  buildQuickCombos() {
    const container = document.getElementById('quick-combos');

    const combos = [
      {
        name: '💀 Maximum Chaos',
        description: 'Hyperpop + Vine Boom + Airhorn',
        music: 'music-hyperpop-01',
        sfx: [
          { id: 'sfx-reaction-vine-boom', time: 2 },
          { id: 'sfx-reaction-airhorn', time: 5 },
          { id: 'sfx-reaction-vine-boom', time: 8 }
        ]
      },
      {
        name: '🤪 Silly Vibes',
        description: 'Goofy music + Honk + Boing',
        music: 'music-goofy-circus',
        sfx: [
          { id: 'sfx-silly-honk', time: 1.5 },
          { id: 'sfx-silly-boing', time: 4 },
          { id: 'sfx-silly-honk', time: 7 }
        ]
      },
      {
        name: '😎 Chill Mode',
        description: 'Lo-fi beat + Soft effects',
        music: 'music-chill-lofi',
        sfx: [
          { id: 'sfx-musical-piano-plonk', time: 3 }
        ]
      }
    ];

    container.innerHTML = '<h2>Try These Combos</h2>';

    combos.forEach(combo => {
      const card = document.createElement('div');
      card.className = 'combo-card';
      card.innerHTML = `
        <h3>${combo.name}</h3>
        <p>${combo.description}</p>
        <button class="btn-try-combo">🎵 Try This</button>
      `;

      card.querySelector('.btn-try-combo').addEventListener('click', async () => {
        // Clear current
        this.mixer.stop();
        this.timeline.clearSFXMarkers();
        this.mixer.sfxQueue = [];

        // Apply combo
        await this.mixer.setMusic(combo.music);
        this.mixer._currentMusicId = combo.music;

        for (const sfx of combo.sfx) {
          await this.mixer.addSFX(sfx.id, sfx.time);
          this.timeline.addSFXMarker(sfx.id, sfx.time);
        }

        alert(`Applied: ${combo.name}`);
      });

      container.appendChild(card);
    });
  }

  buildQuickActions() {
    const container = document.getElementById('quick-actions');

    container.innerHTML = `
      <button id="btn-back" class="btn-action">⬅️ Back</button>
      <button id="btn-randomize" class="btn-action">🎲 Randomize Audio</button>
      <button id="btn-finish" class="btn-action btn-primary">Finish & Share! ✨</button>
    `;

    document.getElementById('btn-back').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('btn-randomize').addEventListener('click', () => {
      this.randomizeAudio();
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
      this.finishAndShare();
    });
  }

  async randomizeAudio() {
    const manifest = this.assetManager.manifest;

    // Random music
    const allMusic = manifest.audio.music;
    const randomMusic = allMusic[Math.floor(Math.random() * allMusic.length)];
    await this.mixer.setMusic(randomMusic.id);
    this.mixer._currentMusicId = randomMusic.id;

    // Clear existing SFX
    this.mixer.sfxQueue = [];
    this.timeline.clearSFXMarkers();

    // Random SFX (3-5)
    const allSFX = Object.values(manifest.audio.sfx).flat();
    const sfxCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < sfxCount; i++) {
      const randomSFX = allSFX[Math.floor(Math.random() * allSFX.length)];
      const randomTime = Math.random() * 15;

      await this.mixer.addSFX(randomSFX.id, randomTime);
      this.timeline.addSFXMarker(randomSFX.id, randomTime);
    }

    alert('Audio randomized! Press play to hear it.');
  }

  finishAndShare() {
    // Get all data
    const sceneData = JSON.parse(sessionStorage.getItem('scene-data'));
    const audioData = this.mixer.getAudioData();

    const completeData = {
      ...sceneData,
      audio: audioData
    };

    // Encode and create share URL
    const encoded = BrainrotEncoder.encode(completeData);
    const shareUrl = window.location.origin + '/b/' + encoded;

    // Show share modal
    this.showShareModal(shareUrl, completeData);
  }

  showShareModal(url, data) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>🎉 Your Brainrot is Ready!</h2>

        <div class="share-url">
          <input type="text" id="share-url-input" value="${url}" readonly>
          <button id="btn-copy-url">📋 Copy Link</button>
        </div>

        <div class="share-buttons">
          <button class="btn-share" id="btn-download">💾 Download Image</button>
          <button class="btn-share" id="btn-new">🔄 Make Another</button>
        </div>

        <button id="btn-close-modal" class="btn-close">✕</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Copy URL
    document.getElementById('btn-copy-url').addEventListener('click', () => {
      const input = document.getElementById('share-url-input');
      input.select();
      document.execCommand('copy');
      alert('Link copied! Share it with your friends!');
    });

    // Download image
    document.getElementById('btn-download').addEventListener('click', () => {
      // Use scene canvas to export
      const canvas = document.getElementById('scene-canvas');
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = 'my-brainrot.png';
      link.href = dataUrl;
      link.click();
    });

    // Make another
    document.getElementById('btn-new').addEventListener('click', () => {
      window.location.href = '/builder-character.php';
    });

    // Close modal
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
}
```

## ✅ Completion Checks

### Automated Tests

```javascript
// test/test-audio-mixer.js

async function testAudioMixer() {
  console.log('Testing Audio Mixer...\n');

  const mixer = new AudioMixer();

  // Test 1: Set music
  console.log('Test 1: Set music');
  await mixer.setMusic('music-skibidi-beat-01');
  console.assert(mixer.music !== null, 'Music should be set');
  console.log('✓ Test 1 passed\n');

  // Test 2: Add SFX
  console.log('Test 2: Add SFX');
  await mixer.addSFX('sfx-reaction-vine-boom', 2.0);
  console.assert(mixer.sfxQueue.length === 1, 'Should have 1 SFX');
  console.log('✓ Test 2 passed\n');

  // Test 3: Get audio data
  console.log('Test 3: Get audio data');
  const data = mixer.getAudioData();
  console.assert(data.music !== null, 'Should have music data');
  console.assert(data.sfx.length === 1, 'Should have SFX data');
  console.log('✓ Test 3 passed\n');

  console.log('✅ All Audio Mixer tests passed!');
}
```

## 📊 Success Criteria

Task 08 is complete when:
1. ✅ Audio mixer can play music + SFX in sync
2. ✅ Music selector shows all tracks organized by vibe
3. ✅ SFX browser allows previewing and adding sounds
4. ✅ Timeline visualizes music and SFX placement
5. ✅ Playback controls work (play/pause/stop/seek)
6. ✅ Quick combos apply pre-made audio mixes
7. ✅ Randomize creates fun audio combinations
8. ✅ Finish button encodes complete brainrot
9. ✅ Share modal displays with copy/download options
10. ✅ Audio works on mobile (iOS/Android)

## 🎓 Key Deliverables

- `/public/builder-audio.php`
- `/public/assets/js/AudioMixer.js`
- `/public/assets/js/TimelineUI.js`
- `/public/assets/js/AudioBuilderUI.js`
- `/test/test-audio-mixer.js`

## ⚠️ Common Pitfalls to Avoid

1. **iOS Autoplay**: Requires user interaction before audio plays
2. **Audio Sync Issues**: SFX triggers not accurate
3. **Memory Leaks**: Not disposing audio objects
4. **Volume Wars**: Some sounds way louder than others
5. **Timeline Complexity**: Too complicated for kids
6. **No Preview**: Can't hear before committing
7. **Lost Data**: Scene data not persisted between pages
8. **Share URL Too Long**: Encoding creates huge URLs

## 🔗 Dependencies for Next Task

Task 09 will need:
- ✅ Complete encoded brainrot data
- ✅ Decoder from Task 04
- ✅ Asset manager for loading
- ✅ Scene canvas for rendering
- ✅ Audio mixer for playback

## 🚀 Future Enhancements

- Waveform visualization
- Beat detection (auto-sync SFX to BPM)
- Volume per SFX
- Fade in/out
- Voice recording
- Audio filters/effects
- Export as video with audio
