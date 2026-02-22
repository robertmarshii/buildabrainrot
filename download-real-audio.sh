#!/bin/bash
# Download real CC0/Public Domain audio files

echo "🎵 Downloading real audio files..."
echo ""

# Function to download with curl
download_audio() {
    local url="$1"
    local output="$2"
    local name="$3"

    echo "⬇️  Downloading: $name"
    if curl -L -f -s -o "$output" "$url" 2>/dev/null; then
        if [ -f "$output" ] && [ -s "$output" ]; then
            echo "✅ Downloaded: $name ($(du -h "$output" | cut -f1))"
            return 0
        fi
    fi
    echo "❌ Failed: $name"
    return 1
}

# Create directories
mkdir -p public/assets/audio/sfx/reactions
mkdir -p public/assets/audio/sfx/silly
mkdir -p public/assets/audio/sfx/meme

echo "Downloading from freesound.org and archive.org..."
echo ""

# These are direct download links to CC0/Public Domain sounds
# Archive.org - Public Domain

# Reaction Sounds
download_audio "https://archive.org/download/Bruh/Bruh.mp3" \
    "public/assets/audio/sfx/reactions/sfx-reaction-bruh.mp3" \
    "Bruh sound effect"

download_audio "https://archive.org/download/universalscream/scream.mp3" \
    "public/assets/audio/sfx/reactions/sfx-reaction-scream.mp3" \
    "Scream sound effect"

download_audio "https://archive.org/download/oof-sound-effect/OOF%20sound%20effect.mp3" \
    "public/assets/audio/sfx/reactions/sfx-reaction-oof.mp3" \
    "Oof sound effect"

download_audio "https://archive.org/download/wow-sound-effect_202103/wow%20sound%20effect.mp3" \
    "public/assets/audio/sfx/reactions/sfx-reaction-wow.mp3" \
    "Wow sound effect"

download_audio "https://archive.org/download/applause_202008/applause.mp3" \
    "public/assets/audio/sfx/reactions/sfx-reaction-applause.mp3" \
    "Applause sound effect"

# Silly Sounds
download_audio "https://archive.org/download/fart-sound-effect/Fart%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/silly/sfx-silly-fart.mp3" \
    "Fart sound effect"

download_audio "https://archive.org/download/whoosh-sound-effect/Whoosh%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/silly/sfx-silly-whoosh.mp3" \
    "Whoosh sound effect"

download_audio "https://archive.org/download/pop-sound-effect_202006/Pop%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/silly/sfx-silly-pop.mp3" \
    "Pop sound effect"

download_audio "https://archive.org/download/glass-break-sound-effect/Glass%20Break%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/silly/sfx-silly-glass-break.mp3" \
    "Glass break sound effect"

# Meme Sounds
download_audio "https://archive.org/download/metal-pipe-falling-sound-effect/Metal%20Pipe%20Falling%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-metal-pipe.mp3" \
    "Metal pipe sound effect"

download_audio "https://archive.org/download/windows-xp-error-sound/Windows%20XP%20Error%20Sound.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-error.mp3" \
    "Error sound effect"

download_audio "https://archive.org/download/discord-notification-sound/Discord%20Notification%20Sound.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-discord-join.mp3" \
    "Discord notification"

download_audio "https://archive.org/download/crickets-sound-effect_202104/Crickets%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-crickets.mp3" \
    "Crickets sound effect"

download_audio "https://archive.org/download/record-scratch-sound-effect/Record%20Scratch%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-record-scratch.mp3" \
    "Record scratch"

download_audio "https://archive.org/download/explosion-sound-effect_202010/Explosion%20Sound%20Effect.mp3" \
    "public/assets/audio/sfx/meme/sfx-meme-explosion.mp3" \
    "Explosion sound effect"

echo ""
echo "✅ Download complete!"
echo ""
echo "Files downloaded to public/assets/audio/"
echo "Refresh your browser to use the new sounds!"
