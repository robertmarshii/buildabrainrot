#!/usr/bin/env node

/**
 * Automated Image Generation using Replicate API
 * Generates all image assets for Build a Brainrot
 */

require('dotenv').config();
const Replicate = require('replicate');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Asset prompts configuration
const ASSET_PROMPTS = {
  characterBodies: [
    {
      id: 'char-body-shark',
      name: 'Silly Shark',
      prompt: 'Cartoon silly shark character, simple bold black outlines, flat pastel colors, transparent background, kid-friendly, facing forward, full body, centered, cute Gen Z meme aesthetic, no text, clipart style, white/gray base color, chunky proportions, googly eyes, derpy expression',
      size: { width: 512, height: 512 }
    },
    {
      id: 'char-body-cat',
      name: 'Cool Cat',
      prompt: 'Cartoon chubby cat character, simple bold black outlines, flat pastel colors, transparent background, kid-friendly, standing upright, full body, centered, cute Gen Z meme aesthetic, stubby legs, big head, derpy face',
      size: { width: 512, height: 512 }
    },
    {
      id: 'char-body-banana',
      name: 'Banana Buddy',
      prompt: 'Cartoon banana character with arms and legs, simple bold outlines, flat yellow color, transparent background, happy derpy face, full body, centered, meme aesthetic, chunky proportions',
      size: { width: 512, height: 512 }
    },
    {
      id: 'char-body-dog',
      name: 'Goofy Dog',
      prompt: 'Cartoon goofy dog character, simple bold outlines, flat pastel colors, transparent background, full body, standing, centered, kid-friendly meme style, big floppy ears, silly expression',
      size: { width: 512, height: 512 }
    },
    {
      id: 'char-body-pickle',
      name: 'Pickle Pal',
      prompt: 'Cartoon pickle character with stick arms and legs, simple bold outlines, flat green color, transparent background, goofy face, standing, centered, meme style, derpy expression',
      size: { width: 512, height: 512 }
    }
  ],

  accessories: [
    {
      id: 'acc-head-sunglasses',
      name: 'Cool Sunglasses',
      prompt: 'Cartoon cool sunglasses icon, simple bold outlines, flat colors, transparent background, clipart style, facing forward, kid-friendly',
      size: { width: 150, height: 60 }
    },
    {
      id: 'acc-head-crown',
      name: 'Golden Crown',
      prompt: 'Cartoon golden crown icon, simple bold outlines, flat yellow gold color, transparent background, clipart style, facing forward, kid-friendly, shiny',
      size: { width: 120, height: 100 }
    },
    {
      id: 'acc-feet-sneakers',
      name: 'Red Sneakers',
      prompt: 'Cartoon red sneakers icon, simple bold outlines, flat colors, transparent background, clipart style, pair of shoes, kid-friendly',
      size: { width: 180, height: 80 }
    }
  ],

  backgrounds: [
    {
      id: 'bg-toilet',
      name: 'Bathroom',
      prompt: 'Toilet bathroom background scene, cartoon style, vibrant pastel colors, tiles, simple design, no characters, kid-friendly, landscape orientation, Gen Z meme aesthetic, bright and colorful, flat design',
      size: { width: 1920, height: 1080 }
    },
    {
      id: 'bg-space',
      name: 'Outer Space',
      prompt: 'Outer space background, cartoon style, stars, colorful planets, nebula, simple design, no characters, kid-friendly, vibrant colors, landscape orientation, dreamy cosmic scene',
      size: { width: 1920, height: 1080 }
    },
    {
      id: 'bg-classroom',
      name: 'Classroom',
      prompt: 'Colorful classroom background, cartoon style, desks, chalkboard, bright colors, simple design, no characters, kid-friendly, landscape orientation, fun educational vibe',
      size: { width: 1920, height: 1080 }
    }
  ],

  stickers: [
    {
      id: 'sticker-skull',
      name: 'Skull Emoji',
      prompt: 'Skull emoji clipart, simple bold outlines, flat colors, transparent background, cartoon style, kid-friendly, centered, meme style',
      size: { width: 200, height: 200 }
    },
    {
      id: 'sticker-fire',
      name: 'Fire Emoji',
      prompt: 'Fire emoji clipart, simple bold outlines, flat orange and yellow colors, transparent background, cartoon style, kid-friendly, centered',
      size: { width: 200, height: 200 }
    },
    {
      id: 'sticker-text-sheesh',
      name: 'Sheesh Text',
      prompt: 'Text sticker that says "SHEESH!" in bold chunky bubble letters, colorful outline, transparent background, Gen Z meme style, playful font',
      size: { width: 300, height: 100 }
    }
  ]
};

// Replicate model to use
const MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

/**
 * Download image from URL
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      require('fs').unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Process image (resize, optimize)
 */
async function processImage(inputPath, outputPath, targetSize) {
  try {
    await sharp(inputPath)
      .resize(targetSize.width, targetSize.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`✓ Processed: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to process ${path.basename(inputPath)}:`, error.message);
  }
}

/**
 * Generate single image
 */
async function generateImage(assetConfig, outputDir) {
  const { id, name, prompt, size } = assetConfig;
  const outputPath = path.join(outputDir, `${id}.png`);

  // Check if already exists
  try {
    await fs.access(outputPath);
    console.log(`⊘ Skipping ${id} (already exists)`);
    return { success: true, cached: true };
  } catch {
    // Doesn't exist, generate it
  }

  console.log(`🎨 Generating: ${name} (${id})...`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt: prompt,
        negative_prompt: "text, watermark, signature, blurry, low quality, realistic, photographic, human hands",
        width: size.width,
        height: size.height,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 30,
        guidance_scale: 7.5
      }
    });

    if (!output || output.length === 0) {
      throw new Error('No output from Replicate');
    }

    const imageUrl = output[0];
    const tempPath = outputPath + '.tmp';

    // Download
    console.log(`   ↓ Downloading...`);
    await downloadImage(imageUrl, tempPath);

    // Process (resize, optimize)
    console.log(`   ⚙ Processing...`);
    await processImage(tempPath, outputPath, size);

    // Clean up temp
    await fs.unlink(tempPath);

    console.log(`   ✓ Saved: ${id}.png\n`);

    return { success: true, path: outputPath };

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
async function generateCategory(categoryName, assets, outputDir) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 Generating ${categoryName.toUpperCase()}`);
  console.log(`${'='.repeat(60)}\n`);

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const results = [];

  for (const asset of assets) {
    const result = await generateImage(asset, outputDir);
    results.push({ ...asset, ...result });

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Main generation function
 */
async function generateAll() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     BUILD A BRAINROT - Automated Asset Generation          ║
║                   Powered by Replicate                     ║
╚════════════════════════════════════════════════════════════╝
`);

  const baseDir = path.join(__dirname, '../public/assets');

  const categories = [
    {
      name: 'Character Bodies',
      assets: ASSET_PROMPTS.characterBodies,
      outputDir: path.join(baseDir, 'images/characters/bodies')
    },
    {
      name: 'Accessories',
      assets: ASSET_PROMPTS.accessories,
      outputDir: path.join(baseDir, 'images/characters/accessories')
    },
    {
      name: 'Backgrounds',
      assets: ASSET_PROMPTS.backgrounds,
      outputDir: path.join(baseDir, 'images/backgrounds')
    },
    {
      name: 'Stickers',
      assets: ASSET_PROMPTS.stickers,
      outputDir: path.join(baseDir, 'images/stickers')
    }
  ];

  const allResults = [];

  for (const category of categories) {
    const results = await generateCategory(
      category.name,
      category.assets,
      category.outputDir
    );
    allResults.push(...results);
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 GENERATION SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);

  const successful = allResults.filter(r => r.success);
  const cached = allResults.filter(r => r.cached);
  const failed = allResults.filter(r => !r.success);

  console.log(`✓ Successfully generated: ${successful.length - cached.length}`);
  console.log(`⊘ Cached (skipped): ${cached.length}`);
  console.log(`✗ Failed: ${failed.length}`);
  console.log(`━ Total assets: ${allResults.length}\n`);

  if (failed.length > 0) {
    console.log(`Failed assets:`);
    failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
    console.log();
  }

  console.log(`✅ Asset generation complete!`);
  console.log(`   Run: npm run validate-assets\n`);
}

// Run if called directly
if (require.main === module) {
  generateAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateAll, generateImage };
