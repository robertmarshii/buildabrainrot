#!/usr/bin/env node

/**
 * CREATE PLACEHOLDER ASSETS
 *
 * Creates simple placeholder files for development purposes
 * These will be replaced with real AI-generated assets later
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure all directories exist
function ensureDirectories() {
  const dirs = [
    'public/assets/images/characters/bodies',
    'public/assets/images/accessories',
    'public/assets/images/backgrounds',
    'public/assets/images/stickers',
    'public/assets/audio/music',
    'public/assets/audio/sfx/reactions',
    'public/assets/audio/sfx/animals',
    'public/assets/audio/sfx/silly',
    'public/assets/audio/voices'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// Create a simple colored square image
async function createPlaceholderImage(filepath, width, height, color) {
  // Create a solid color image with text
  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white"
            text-anchor="middle" dominant-baseline="middle">
        PLACEHOLDER
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(filepath);
}

// Create a minimal silent MP3 file (valid MP3 header)
function createPlaceholderAudio(filepath) {
  // This is a minimal valid MP3 file (silent, ~0.026 seconds)
  const minimalMP3 = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x6E, 0x66, 0x6F,
    0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00
  ]);

  fs.writeFileSync(filepath, minimalMP3);
}

// Image placeholders with different colors
const imagePlaceholders = [
  { path: 'public/assets/images/characters/bodies/char-body-shark.png', width: 512, height: 512, color: '#4A90E2' },
  { path: 'public/assets/images/characters/bodies/char-body-cat.png', width: 512, height: 512, color: '#F5A623' },
  { path: 'public/assets/images/characters/bodies/char-body-banana.png', width: 512, height: 512, color: '#F8E71C' },
  { path: 'public/assets/images/characters/bodies/char-body-dog.png', width: 512, height: 512, color: '#8B572A' },
  { path: 'public/assets/images/characters/bodies/char-body-pickle.png', width: 512, height: 512, color: '#7ED321' },

  { path: 'public/assets/images/accessories/acc-head-sunglasses.png', width: 256, height: 128, color: '#000000' },
  { path: 'public/assets/images/accessories/acc-head-crown.png', width: 256, height: 256, color: '#FFD700' },
  { path: 'public/assets/images/accessories/acc-feet-sneakers.png', width: 256, height: 128, color: '#E74C3C' },

  { path: 'public/assets/images/backgrounds/bg-toilet.png', width: 1024, height: 1024, color: '#E8F5E9' },
  { path: 'public/assets/images/backgrounds/bg-space.png', width: 1024, height: 1024, color: '#1A237E' },
  { path: 'public/assets/images/backgrounds/bg-classroom.png', width: 1024, height: 1024, color: '#FFF9C4' },

  { path: 'public/assets/images/stickers/sticker-skull.png', width: 128, height: 128, color: '#FFFFFF' },
  { path: 'public/assets/images/stickers/sticker-fire.png', width: 128, height: 128, color: '#FF5722' },
  { path: 'public/assets/images/stickers/sticker-text-sheesh.png', width: 256, height: 128, color: '#9C27B0' }
];

// Audio placeholders
const audioPlaceholders = [
  'public/assets/audio/music/music-skibidi-beat-01.mp3',
  'public/assets/audio/music/music-chill-lofi-01.mp3',
  'public/assets/audio/sfx/reactions/sfx-reaction-vine-boom.mp3',
  'public/assets/audio/sfx/reactions/sfx-reaction-airhorn.mp3',
  'public/assets/audio/sfx/animals/sfx-animal-dog-bark.mp3',
  'public/assets/audio/sfx/silly/sfx-silly-boing.mp3',
  'public/assets/audio/sfx/silly/sfx-silly-honk.mp3',
  'public/assets/audio/voices/voice-sheesh.mp3',
  'public/assets/audio/voices/voice-nocap.mp3'
];

async function createAllPlaceholders() {
  console.log('🎨 Creating placeholder assets for development...\n');

  ensureDirectories();

  // Create image placeholders
  console.log('Creating image placeholders...');
  for (const img of imagePlaceholders) {
    const fullPath = path.join(__dirname, '..', img.path);

    if (fs.existsSync(fullPath)) {
      console.log(`  ⊘ Skipping ${path.basename(fullPath)} (exists)`);
      continue;
    }

    try {
      await createPlaceholderImage(fullPath, img.width, img.height, img.color);
      const stats = fs.statSync(fullPath);
      console.log(`  ✓ Created ${path.basename(fullPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`  ✗ Failed ${path.basename(fullPath)}: ${error.message}`);
    }
  }

  // Create audio placeholders
  console.log('\nCreating audio placeholders...');
  for (const audioPath of audioPlaceholders) {
    const fullPath = path.join(__dirname, '..', audioPath);

    if (fs.existsSync(fullPath)) {
      console.log(`  ⊘ Skipping ${path.basename(fullPath)} (exists)`);
      continue;
    }

    try {
      createPlaceholderAudio(fullPath);
      const stats = fs.statSync(fullPath);
      console.log(`  ✓ Created ${path.basename(fullPath)} (${stats.size} bytes)`);
    } catch (error) {
      console.error(`  ✗ Failed ${path.basename(fullPath)}: ${error.message}`);
    }
  }

  console.log('\n✅ Placeholder creation complete!');
  console.log('   These are simple placeholders for development.');
  console.log('   Run "npm run generate-all" locally to create real AI assets.\n');
}

createAllPlaceholders().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
