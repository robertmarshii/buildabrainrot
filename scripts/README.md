# Asset Generation Scripts

Automated scripts for generating starter assets using AI via the Replicate API.

## Prerequisites

1. **Replicate API Key**: Get a free API key from [replicate.com](https://replicate.com)
2. **Node.js**: Version 18+ required
3. **Dependencies**: Run `npm install` first

## Setup

Create a `.env` file in the project root:

```bash
REPLICATE_API_TOKEN=your_api_key_here
```

**Note**: The `.env` file is git-ignored to protect your API key.

## Available Scripts

### Generate Images

Generates 14 starter image assets (characters, accessories, backgrounds, stickers):

```bash
npm run generate-images
```

**Assets generated:**
- 5 character bodies (shark, cat, banana, dog, pickle)
- 3 accessories (sunglasses, crown, sneakers)
- 3 backgrounds (toilet, space, classroom)
- 3 stickers (skull, fire, "sheesh" text)

**Model used:** Stability AI SDXL via Replicate

### Generate Audio

Generates 9 starter audio assets (music, sound effects, voices):

```bash
npm run generate-audio
```

**Assets generated:**
- 2 music tracks (glitchy chaos beat, chill lo-fi beat)
- 5 sound effects (vine boom, airhorn, dog bark, boing, honk)
- 2 voice clips ("Sheesh!", "No cap!")

**Models used:**
- Meta MusicGen for music tracks
- Meta AudioCraft for sound effects
- Suno Bark for voice clips

### Generate All Assets

Run both image and audio generation in sequence:

```bash
npm run generate-all
```

This will generate all 23 starter assets (14 images + 9 audio files).

### Validate Assets

Check that all generated assets match the manifest:

```bash
npm run validate-assets
```

## Output Locations

Generated assets are saved to:

```
public/assets/
├── images/
│   ├── characters/bodies/
│   ├── accessories/
│   ├── backgrounds/
│   └── stickers/
└── audio/
    ├── music/
    ├── sfx/
    │   ├── reactions/
    │   ├── animals/
    │   └── silly/
    └── voices/
```

## Features

- **Skip existing files**: Won't regenerate assets that already exist
- **Progress reporting**: Shows detailed progress for each asset
- **Error handling**: Continues generating even if some assets fail
- **Summary statistics**: Reports success/failure counts at the end

## Troubleshooting

### DNS Resolution Errors

If you see `getaddrinfo EAI_AGAIN` errors in certain environments (like Docker containers), the scripts include DNS workarounds. If issues persist, try:

1. Check your network connection
2. Verify your API key is valid
3. Test API access: `curl -H "Authorization: Token YOUR_KEY" https://api.replicate.com/v1/account`

### API Rate Limits

The scripts include small delays between generations to avoid rate limits. If you hit limits:

- Wait a few minutes and retry
- Generate in smaller batches
- Check your Replicate account credits

### Generation Quality

To improve generated assets:

1. Edit prompts in `scripts/generate-images.js` or `scripts/generate-audio.js`
2. Adjust generation parameters (size, duration, etc.)
3. Re-run generation (existing files will be skipped automatically)

## Cost Estimates

Based on Replicate's pricing (as of 2025):

- **Images**: ~$0.008 per image × 14 = ~$0.11
- **Audio**: ~$0.05 per track × 9 = ~$0.45
- **Total**: ~$0.56 for all starter assets

**Note**: Replicate offers $10 free credit for new accounts.

## Next Steps

After generating assets:

1. Review the generated files in `public/assets/`
2. Edit/replace any assets that don't meet quality standards
3. Run `npm run validate-assets` to verify manifest matches files
4. Commit assets to git: `git add public/assets/ && git commit -m "Add generated starter assets"`

## Expanding the Asset Library

To add more assets:

1. Edit the asset configurations in the generation scripts
2. Add corresponding entries to `public/assets/manifest.json`
3. Re-run the generation scripts
4. Update this README with new asset counts

## Models & Attribution

- **Stability AI SDXL**: Image generation (Apache 2.0 license)
- **Meta MusicGen**: Music generation (CC-BY-NC 4.0 license)
- **Suno Bark**: Text-to-speech (MIT license)

All generated assets should be reviewed for kid-appropriateness before production use.
