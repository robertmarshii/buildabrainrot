#!/usr/bin/env node

/**
 * BUILD A BRAINROT - Audio Asset Generator
 *
 * Generates audio assets (music, SFX, voices) using Replicate API
 *
 * Models used:
 * - Music: Meta MusicGen for beats/loops
 * - SFX: AudioCraft for sound effects
 * - Voices: Coqui XTTS for text-to-speech
 */

require('dotenv').config();
const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Replicate models for audio generation
const MODELS = {
  // Meta MusicGen - for music tracks
  music: 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',

  // Meta AudioCraft - for sound effects
  sfx: 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',

  // Suno Bark - for voices/speech
  voice: 'suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787'
};

// Asset configurations with prompts
const AUDIO_ASSETS = {
  music: [
    {
      id: 'music-skibidi-beat-01',
      name: 'Glitchy Chaos Beat',
      prompt: 'fast electronic glitchy chaotic meme beat, 140 bpm, energetic, EDM style, repetitive loop, no vocals',
      duration: 20,
      model: 'music'
    },
    {
      id: 'music-chill-lofi-01',
      name: 'Chill Lo-Fi Beat',
      prompt: 'chill relaxing lo-fi hip hop beat, 85 bpm, calm and happy, piano and soft drums, simple loop, no vocals',
      duration: 30,
      model: 'music'
    }
  ],

  sfx: [
    {
      id: 'sfx-reaction-vine-boom',
      name: 'Vine Boom',
      prompt: 'deep dramatic bass boom sound effect, impact hit, short 1 second',
      duration: 1.2,
      model: 'sfx'
    },
    {
      id: 'sfx-reaction-airhorn',
      name: 'Airhorn',
      prompt: 'loud airhorn blast sound effect, meme sound, attention grabbing, 1.5 seconds',
      duration: 1.5,
      model: 'sfx'
    },
    {
      id: 'sfx-animal-dog-bark',
      name: 'Dog Bark',
      prompt: 'cartoon dog bark sound effect, cute friendly bark, short 0.8 seconds',
      duration: 0.8,
      model: 'sfx'
    },
    {
      id: 'sfx-silly-boing',
      name: 'Boing',
      prompt: 'cartoon spring boing sound effect, bouncy silly sound, 0.6 seconds',
      duration: 0.6,
      model: 'sfx'
    },
    {
      id: 'sfx-silly-honk',
      name: 'Honk',
      prompt: 'clown honk sound effect, silly funny cartoon honk, 0.5 seconds',
      duration: 0.5,
      model: 'sfx'
    }
  ],

  voices: [
    {
      id: 'voice-sheesh',
      name: 'Sheesh!',
      text: 'Sheesh!',
      prompt: 'excited energetic teenage voice saying "Sheesh!"',
      duration: 1.0,
      model: 'voice'
    },
    {
      id: 'voice-nocap',
      name: 'No Cap!',
      text: 'No cap!',
      prompt: 'casual cool teenage voice saying "No cap!"',
      duration: 0.8,
      model: 'voice'
    }
  ]
};

// Output directories
const OUTPUT_DIRS = {
  music: path.join(__dirname, '../public/assets/audio/music'),
  sfx: path.join(__dirname, '../public/assets/audio/sfx'),
  voices: path.join(__dirname, '../public/assets/audio/voices')
};

// Ensure directories exist
function ensureDirectories() {
  Object.values(OUTPUT_DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create SFX subdirectories
  const sfxSubdirs = ['reactions', 'animals', 'silly'];
  sfxSubdirs.forEach(subdir => {
    const dir = path.join(OUTPUT_DIRS.sfx, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Download audio file from URL
 */
function downloadAudio(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Get output file path for asset
 */
function getOutputPath(assetId, category) {
  if (category === 'music') {
    return path.join(OUTPUT_DIRS.music, `${assetId}.mp3`);
  } else if (category === 'voices') {
    return path.join(OUTPUT_DIRS.voices, `${assetId}.mp3`);
  } else if (category === 'sfx') {
    // Determine subfolder based on asset ID
    let subfolder = 'reactions';
    if (assetId.includes('animal')) subfolder = 'animals';
    else if (assetId.includes('silly')) subfolder = 'silly';

    return path.join(OUTPUT_DIRS.sfx, subfolder, `${assetId}.mp3`);
  }

  throw new Error(`Unknown category: ${category}`);
}

/**
 * Generate a single audio asset
 */
async function generateAudio(assetConfig, category) {
  const { id, name, prompt, text, duration, model } = assetConfig;
  const outputPath = getOutputPath(id, category);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`   ⊘ Skipping (already exists): ${name}`);
    return { success: true, cached: true };
  }

  try {
    console.log(`🎵 Generating: ${name} (${id})...`);
    console.log(`   Prompt: ${prompt?.substring(0, 80) || text}...`);

    let output;

    if (model === 'voice') {
      // Text-to-speech generation
      output = await replicate.run(MODELS.voice, {
        input: {
          prompt: text,
          text_temp: 0.7,
          waveform_temp: 0.7,
          output_format: 'mp3'
        }
      });
    } else {
      // Music or SFX generation
      output = await replicate.run(MODELS[model], {
        input: {
          prompt: prompt,
          duration: duration,
          model_version: 'stereo-melody-large',
          output_format: 'mp3',
          normalization_strategy: 'loudness'
        }
      });
    }

    // Download the generated audio
    const audioUrl = typeof output === 'string' ? output : output.audio || output[0];

    if (!audioUrl) {
      throw new Error('No audio URL in response');
    }

    console.log(`   ⬇ Downloading from: ${audioUrl.substring(0, 60)}...`);
    await downloadAudio(audioUrl, outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`   ✓ Saved: ${outputPath}`);
    console.log(`   ℹ Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log();

    return { success: true, cached: false };

  } catch (error) {
    console.error(`   ✗ Failed: ${error.message}`);
    console.error(`   Error details:`, error);
    console.error();
    return { success: false, error: error.message };
  }
}

/**
 * Generate all assets in a category
 */
async function generateCategory(categoryName, assets) {
  console.log();
  console.log('============================================================');
  console.log(`🎼 Generating ${categoryName.toUpperCase()}`);
  console.log('============================================================');
  console.log();

  const results = [];

  // Generate sequentially to avoid rate limits
  for (const asset of assets) {
    const result = await generateAudio(asset, categoryName);
    results.push({ id: asset.id, ...result });

    // Small delay between generations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

/**
 * Generate all audio assets
 */
async function generateAll() {
  console.log();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     BUILD A BRAINROT - Audio Asset Generation              ║');
  console.log('║                   Powered by Replicate                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  // Ensure output directories exist
  ensureDirectories();

  // Generate all categories
  const musicResults = await generateCategory('music', AUDIO_ASSETS.music);
  const sfxResults = await generateCategory('sfx', AUDIO_ASSETS.sfx);
  const voiceResults = await generateCategory('voices', AUDIO_ASSETS.voices);

  // Combine results
  const allResults = [...musicResults, ...sfxResults, ...voiceResults];

  // Print summary
  console.log();
  console.log('============================================================');
  console.log('📊 GENERATION SUMMARY');
  console.log('============================================================');
  console.log();

  const successful = allResults.filter(r => r.success && !r.cached).length;
  const cached = allResults.filter(r => r.cached).length;
  const failed = allResults.filter(r => !r.success).length;

  console.log(`✓ Successfully generated: ${successful}`);
  console.log(`⊘ Cached (skipped): ${cached}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`━ Total assets: ${allResults.length}`);
  console.log();

  if (failed > 0) {
    console.log('Failed assets:');
    allResults
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.id}: ${r.error}`));
    console.log();
  }

  console.log('✅ Audio generation complete!');
  console.log('   Run: npm run validate-assets');
  console.log();
}

// Run the generator
generateAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
