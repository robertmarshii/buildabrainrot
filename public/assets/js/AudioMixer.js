/**
 * AUDIO MIXER
 *
 * Manages audio playback with music, sound effects, and voice clips
 * Provides simple timeline-based mixing for kid-friendly audio creation
 */

class AudioMixer {
  constructor() {
    this.assetManager = window.assetManager;

    this.music = null;
    this.musicId = null;
    this.musicVolume = 0.8;

    this.sfxQueue = []; // [{id, audio, time, duration, played}]
    this.voiceClip = null;

    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = null;
    this.pauseTime = 0;
    this.currentTime = 0;
    this.duration = 20; // Default 20 seconds

    this.animationFrame = null;
    this.onTimeUpdate = null; // Callback for timeline UI
  }

  /**
   * Set background music
   *
   * @param {string} musicId - Music asset ID
   * @returns {Promise<Object>} Asset metadata
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
      this.musicId = musicId;
      this.music.loop = true;
      this.music.volume = this.musicVolume;
      this.duration = Math.max(this.duration, asset.duration || 20);

      console.log('Music set:', asset.name);
      return asset;
    } catch (error) {
      console.error('Failed to load music:', error);
      throw error;
    }
  }

  /**
   * Set music volume
   *
   * @param {number} volume - Volume (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  /**
   * Add sound effect at specific time
   *
   * @param {string} sfxId - SFX asset ID
   * @param {number} time - Time in seconds
   * @returns {Promise<Object>} Asset metadata
   */
  async addSFX(sfxId, time) {
    try {
      // Try to find asset directly from getAssetsByCategory first
      const availableSfx = this.assetManager.getAssetsByCategory('sfx');
      let asset = availableSfx.find(s => s.id === sfxId);

      // Fallback to findAsset method
      if (!asset) {
        asset = this.assetManager.findAsset(sfxId);
      }

      if (!asset) {
        console.error('SFX asset not found:', sfxId);
        console.log('Available SFX IDs:', availableSfx.map(s => s.id));
        console.log('Full SFX assets:', availableSfx);
        throw new Error(`SFX asset not found: ${sfxId}`);
      }

      // Create new Audio element for this SFX instance
      // Don't clone - create fresh instance to ensure it loads properly
      const sfxAudio = new Audio();
      sfxAudio.src = this.assetManager.baseUrl + asset.file;
      sfxAudio.volume = 1.0;
      sfxAudio.preload = 'auto';

      this.sfxQueue.push({
        id: sfxId,
        audio: sfxAudio,
        time: time,
        duration: asset.duration || 1,
        played: false,
        metadata: asset
      });

      // Sort by time
      this.sfxQueue.sort((a, b) => a.time - b.time);

      console.log('SFX added:', asset.name, 'at', time + 's');
      return asset;
    } catch (error) {
      console.error('Failed to load SFX:', error);
      throw error;
    }
  }

  /**
   * Remove SFX at index
   *
   * @param {number} index - SFX index
   */
  removeSFX(index) {
    if (index >= 0 && index < this.sfxQueue.length) {
      this.sfxQueue.splice(index, 1);
    }
  }

  /**
   * Set voice clip
   *
   * @param {string} voiceId - Voice asset ID
   * @param {number} time - Time in seconds
   * @returns {Promise<Object>} Asset metadata
   */
  async setVoice(voiceId, time) {
    try {
      const audio = await this.assetManager.loadAudio(voiceId);
      const asset = this.assetManager.findAsset(voiceId);

      this.voiceClip = {
        id: voiceId,
        audio: audio,
        time: time,
        duration: asset.duration || 1,
        played: false,
        metadata: asset
      };

      console.log('Voice set:', asset.name, 'at', time + 's');
      return asset;
    } catch (error) {
      console.error('Failed to load voice:', error);
      throw error;
    }
  }

  /**
   * Clear voice clip
   */
  clearVoice() {
    this.voiceClip = null;
  }

  /**
   * Preview single sound
   *
   * @param {string} soundId - Asset ID
   */
  async previewSound(soundId) {
    try {
      const audio = await this.assetManager.loadAudio(soundId);
      audio.currentTime = 0;
      audio.volume = 1.0;
      await audio.play();
    } catch (error) {
      console.error('Failed to preview sound:', error);
    }
  }

  /**
   * Start playback
   */
  async play() {
    if (this.isPlaying) return;

    try {
      this.isPlaying = true;
      this.isPaused = false;

      // Reset SFX played flags
      this.sfxQueue.forEach(sfx => { sfx.played = false; });
      if (this.voiceClip) {
        this.voiceClip.played = false;
      }

      // Start music
      if (this.music) {
        this.music.currentTime = this.currentTime;
        await this.music.play();
      }

      this.startTime = Date.now() - (this.currentTime * 1000);
      this.updateLoop();

      console.log('Playback started');
    } catch (error) {
      console.error('Failed to start playback:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (!this.isPlaying) return;

    this.isPaused = true;
    this.isPlaying = false;

    if (this.music) {
      this.music.pause();
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    console.log('Playback paused at', this.currentTime.toFixed(2) + 's');
  }

  /**
   * Stop playback
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.pauseTime = 0;

    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }

    // Reset SFX
    this.sfxQueue.forEach(sfx => {
      sfx.played = false;
      if (sfx.audio) {
        sfx.audio.pause();
        sfx.audio.currentTime = 0;
      }
    });

    if (this.voiceClip) {
      this.voiceClip.played = false;
      if (this.voiceClip.audio) {
        this.voiceClip.audio.pause();
        this.voiceClip.audio.currentTime = 0;
      }
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(0);
    }

    console.log('Playback stopped');
  }

  /**
   * Update loop (called every frame during playback)
   *
   * @private
   */
  updateLoop() {
    if (!this.isPlaying) return;

    // Calculate current time
    this.currentTime = (Date.now() - this.startTime) / 1000;

    // Check if reached end
    if (this.currentTime >= this.duration) {
      this.stop();
      return;
    }

    // Trigger SFX at their scheduled times
    this.sfxQueue.forEach(sfx => {
      if (!sfx.played && this.currentTime >= sfx.time) {
        this.playSFX(sfx);
        sfx.played = true;
      }
    });

    // Trigger voice clip
    if (this.voiceClip && !this.voiceClip.played && this.currentTime >= this.voiceClip.time) {
      this.playVoice(this.voiceClip);
      this.voiceClip.played = true;
    }

    // Call time update callback
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime);
    }

    // Continue loop
    this.animationFrame = requestAnimationFrame(() => this.updateLoop());
  }

  /**
   * Play SFX
   *
   * @private
   */
  playSFX(sfx) {
    try {
      sfx.audio.currentTime = 0;
      sfx.audio.play().catch(err => {
        console.warn('SFX play failed:', err);
      });
    } catch (error) {
      console.error('Failed to play SFX:', error);
    }
  }

  /**
   * Play voice
   *
   * @private
   */
  playVoice(voice) {
    try {
      voice.audio.currentTime = 0;
      voice.audio.play().catch(err => {
        console.warn('Voice play failed:', err);
      });
    } catch (error) {
      console.error('Failed to play voice:', error);
    }
  }

  /**
   * Get audio data for encoding
   *
   * @returns {Object} Audio data
   */
  getAudioData() {
    return {
      music: this.musicId ? {
        id: this.musicId,
        volume: this.musicVolume,
        startTime: 0
      } : null,
      sfx: this.sfxQueue.map(sfx => ({
        id: sfx.id,
        time: sfx.time,
        volume: 1.0
      })),
      voice: this.voiceClip ? {
        id: this.voiceClip.id,
        time: this.voiceClip.time,
        volume: 1.0
      } : null
    };
  }

  /**
   * Load audio data
   *
   * @param {Object} audioData - Audio data
   * @returns {Promise<void>}
   */
  async loadAudioData(audioData) {
    this.stop();

    if (audioData.music) {
      await this.setMusic(audioData.music.id);
      this.setMusicVolume(audioData.music.volume || 0.8);
    }

    if (audioData.sfx) {
      for (const sfx of audioData.sfx) {
        await this.addSFX(sfx.id, sfx.time);
      }
    }

    if (audioData.voice) {
      await this.setVoice(audioData.voice.id, audioData.voice.time);
    }
  }

  /**
   * Clear all audio
   */
  clear() {
    this.stop();
    this.music = null;
    this.musicId = null;
    this.sfxQueue = [];
    this.voiceClip = null;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioMixer;
}
