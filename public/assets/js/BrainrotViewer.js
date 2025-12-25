/**
 * BRAINROT VIEWER
 *
 * Reconstruction engine for viewing shared brainrots
 * Decodes URL data, loads assets, renders scene, plays audio
 */

class BrainrotViewer {
  constructor(canvasId, encodedData) {
    this.canvasId = canvasId;
    this.encodedData = encodedData;

    this.assetManager = window.assetManager;
    this.canvas = null;
    this.mixer = null;
    this.brainrotData = null;

    this.isPlaying = false;
    this.isMuted = false;
  }

  /**
   * Load and display brainrot
   *
   * @returns {Promise<void>}
   */
  async load() {
    try {
      // Show loading screen
      this.showLoading();

      // Step 1: Decode data
      this.updateLoading('Decoding brainrot...', 10);
      this.brainrotData = BrainrotEncoder.decode(this.encodedData);

      console.log('Decoded brainrot:', this.brainrotData);

      // Step 2: Initialize asset manager
      this.updateLoading('Loading asset library...', 20);
      await this.assetManager.init();

      // Step 3: Validate assets exist
      this.updateLoading('Validating assets...', 30);
      this.validateAssets();

      // Step 4: Preload all assets
      this.updateLoading('Loading images...', 40);
      await this.preloadAssets();

      // Step 5: Setup canvas
      this.updateLoading('Preparing canvas...', 70);
      this.setupCanvas();

      // Step 6: Setup audio
      this.updateLoading('Loading audio...', 80);
      await this.setupAudio();

      // Step 7: Render scene
      this.updateLoading('Rendering scene...', 90);
      await this.renderScene();

      // Step 8: Setup controls
      this.updateLoading('Almost ready...', 95);
      this.setupControls();

      // Step 9: Show view screen
      this.updateLoading('Done!', 100);
      setTimeout(() => {
        this.showView();
        this.autoplay();
      }, 500);

    } catch (error) {
      console.error('Failed to load brainrot:', error);
      this.showError(error.message);
    }
  }

  /**
   * Validate that all referenced assets exist
   */
  validateAssets() {
    const requiredAssets = [
      this.brainrotData.character?.body,
      this.brainrotData.scene?.background,
      ...(this.brainrotData.character?.accessories?.map(a => a.id) || []),
      ...(this.brainrotData.scene?.stickers?.map(s => s.id) || []),
      this.brainrotData.audio?.music?.id,
      ...(this.brainrotData.audio?.sfx?.map(s => s.id) || [])
    ].filter(Boolean);

    const missing = [];
    requiredAssets.forEach(id => {
      if (!this.assetManager.findAsset(id)) {
        missing.push(id);
      }
    });

    if (missing.length > 0) {
      console.warn('Missing assets:', missing);
      // Continue anyway, will use placeholders
    }
  }

  /**
   * Preload all assets needed
   *
   * @returns {Promise<void>}
   */
  async preloadAssets() {
    const assetIds = [
      this.brainrotData.character?.body,
      this.brainrotData.character?.face?.eyes,
      this.brainrotData.character?.face?.mouth,
      this.brainrotData.scene?.background,
      ...(this.brainrotData.character?.accessories?.map(a => a.id) || []),
      ...(this.brainrotData.scene?.stickers?.map(s => s.id) || [])
    ].filter(Boolean);

    await this.assetManager.loadBatch(assetIds, (progress) => {
      const percentage = 40 + (progress.percentage * 0.3); // 40-70%
      this.updateLoading(`Loading ${progress.currentAsset}...`, percentage);
    });
  }

  /**
   * Setup canvas for rendering
   */
  setupCanvas() {
    this.canvas = new SceneCanvas(this.canvasId);

    // Make canvas responsive
    const container = document.getElementById('view-screen');
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 200; // Leave room for controls

    const scale = Math.min(maxWidth / 1920, maxHeight / 1080, 0.8);
    const canvas = document.getElementById(this.canvasId);
    canvas.style.width = (1920 * scale) + 'px';
    canvas.style.height = (1080 * scale) + 'px';
  }

  /**
   * Setup audio mixer
   *
   * @returns {Promise<void>}
   */
  async setupAudio() {
    this.mixer = new AudioMixer();

    // Load music
    if (this.brainrotData.audio?.music) {
      await this.mixer.setMusic(this.brainrotData.audio.music.id);
      this.mixer.setMusicVolume(this.brainrotData.audio.music.volume || 0.8);
    }

    // Load SFX
    if (this.brainrotData.audio?.sfx) {
      for (const sfx of this.brainrotData.audio.sfx) {
        await this.mixer.addSFX(sfx.id, sfx.time);
      }
    }

    // Load voice (future feature)
    if (this.brainrotData.audio?.voice) {
      await this.mixer.setVoice(
        this.brainrotData.audio.voice.id,
        this.brainrotData.audio.voice.time
      );
    }

    // Setup time update callback
    this.mixer.onTimeUpdate = (time) => {
      this.updatePlaybackBar(time);
    };
  }

  /**
   * Render the complete scene
   *
   * @returns {Promise<void>}
   */
  async renderScene() {
    // Load character data
    if (this.brainrotData.character) {
      await this.canvas.loadCharacterData(this.brainrotData.character);
    }

    // Set background
    if (this.brainrotData.scene?.background) {
      await this.canvas.setBackground(this.brainrotData.scene.background);
    }

    // Add stickers
    if (this.brainrotData.scene?.stickers) {
      for (const sticker of this.brainrotData.scene.stickers) {
        await this.canvas.addSticker(sticker.id, sticker.position);
      }
    }

    // Add texts
    if (this.brainrotData.scene?.texts) {
      for (const text of this.brainrotData.scene.texts) {
        this.canvas.addText(text.content, text.style, text.position);
      }
    }

    // Final render
    await this.canvas.render();
  }

  /**
   * Setup UI controls
   */
  setupControls() {
    // Replay button
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.replay();
    });

    // Remix button
    document.getElementById('btn-remix').addEventListener('click', () => {
      // Save data to session storage and redirect to builder
      sessionStorage.setItem('character-data', JSON.stringify(this.brainrotData.character));
      sessionStorage.setItem('complete-brainrot', JSON.stringify({
        character: this.brainrotData.character,
        scene: this.brainrotData.scene
      }));
      window.location.href = '/character-builder.php?remix=true';
    });

    // Share button
    document.getElementById('btn-share').addEventListener('click', () => {
      this.showShareOptions();
    });

    // Download button
    document.getElementById('btn-download').addEventListener('click', () => {
      this.downloadImage();
    });

    // Mute button
    document.getElementById('btn-mute').addEventListener('click', () => {
      this.toggleMute();
    });

    // Tap canvas to replay (mobile)
    document.getElementById(this.canvasId).addEventListener('click', () => {
      if (!this.isPlaying) {
        this.replay();
      }
    });
  }

  /**
   * Autoplay (if browser allows)
   */
  autoplay() {
    // Try to play, but might be blocked on mobile
    this.mixer.play()
      .then(() => {
        this.isPlaying = true;
        console.log('Autoplay started');
      })
      .catch(error => {
        console.log('Autoplay blocked, user must tap to play');
        // Show play button overlay
        this.showPlayButton();
      });
  }

  /**
   * Show play button overlay (for mobile)
   */
  showPlayButton() {
    const overlay = document.createElement('div');
    overlay.id = 'play-overlay';
    overlay.className = 'play-overlay';
    overlay.innerHTML = `
      <button class="btn-play-large">▶️ Tap to Play</button>
    `;

    document.getElementById('view-screen').appendChild(overlay);

    overlay.addEventListener('click', () => {
      this.mixer.play();
      this.isPlaying = true;
      overlay.remove();
    });
  }

  /**
   * Replay audio and animations
   */
  replay() {
    this.mixer.stop();
    this.mixer.play();
    this.isPlaying = true;
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.mixer.setMusicVolume(0);
      document.getElementById('btn-mute').textContent = '🔇';
    } else {
      this.mixer.setMusicVolume(0.8);
      document.getElementById('btn-mute').textContent = '🔊';
    }
  }

  /**
   * Update playback progress bar
   *
   * @param {number} time - Current time in seconds
   */
  updatePlaybackBar(time) {
    const progress = (time / this.mixer.duration) * 100;
    const progressEl = document.getElementById('playback-progress');
    if (progressEl) {
      progressEl.style.width = progress + '%';
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const timeEl = document.getElementById('playback-time');
    if (timeEl) {
      timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Show share options modal
   */
  showShareOptions() {
    const url = window.location.href;

    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>📤 Share This Brainrot</h2>

        <div class="share-url">
          <input type="text" id="share-url-input" value="${url}" readonly>
          <button id="btn-copy-url" class="btn-copy">📋 Copy Link</button>
        </div>

        <p class="share-hint">
          Share this link with your friends! They'll see your creation in action.
        </p>

        <button id="btn-close-modal" class="btn-close">✕ Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Copy URL
    document.getElementById('btn-copy-url').addEventListener('click', () => {
      const input = document.getElementById('share-url-input');
      input.select();
      document.execCommand('copy');

      // Modern clipboard API fallback
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }

      alert('Link copied! 🎉');
    });

    // Close modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.getElementById('btn-close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }

  /**
   * Download as image
   */
  downloadImage() {
    this.canvas.exportPNG('my-brainrot.png');
  }

  /**
   * Update loading screen
   *
   * @param {string} message - Status message
   * @param {number} percentage - Progress 0-100
   */
  updateLoading(message, percentage) {
    const statusEl = document.getElementById('loading-status');
    const percentEl = document.getElementById('loading-percentage');
    const fillEl = document.getElementById('progress-fill');

    if (statusEl) statusEl.textContent = message;
    if (percentEl) percentEl.textContent = Math.round(percentage) + '%';
    if (fillEl) fillEl.style.width = percentage + '%';
  }

  /**
   * Show loading screen
   */
  showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('view-screen').style.display = 'none';
    document.getElementById('error-screen').style.display = 'none';
  }

  /**
   * Show view screen
   */
  showView() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('view-screen').style.display = 'flex';
    document.getElementById('error-screen').style.display = 'none';
  }

  /**
   * Show error screen
   *
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
    }
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('view-screen').style.display = 'none';
    document.getElementById('error-screen').style.display = 'flex';
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrainrotViewer;
}
