#!/bin/bash
# Download free CC0 audio files for buildabrainrot
# Uses archive.org and other public domain sources

echo "Downloading free audio files..."
echo ""

# Create directories if they don't exist
mkdir -p public/assets/audio/music
mkdir -p public/assets/audio/sfx/reactions
mkdir -p public/assets/audio/sfx/animals
mkdir -p public/assets/audio/sfx/silly
mkdir -p public/assets/audio/voices

# Function to download with retry
download_file() {
    local url="$1"
    local output="$2"
    local desc="$3"

    echo "Downloading: $desc"
    if curl -L -f -o "$output" "$url" 2>/dev/null; then
        echo "✓ Downloaded: $output"
        return 0
    else
        echo "✗ Failed: $desc"
        return 1
    fi
}

# Music tracks from Free Music Archive / Archive.org (CC0)
echo "=== Music Tracks ==="

# Upbeat electronic track (CC0 from Archive.org)
download_file \
    "https://archive.org/download/999WavFiles/Sfx/upbeat_electronic.wav" \
    "public/assets/audio/music/music-skibidi-beat-01.mp3" \
    "Upbeat electronic beat"

# Chill lofi track (CC0 from Archive.org)
download_file \
    "https://archive.org/download/999WavFiles/Sfx/chill_lofi.wav" \
    "public/assets/audio/music/music-chill-lofi-01.mp3" \
    "Chill lo-fi beat"

echo ""
echo "=== Sound Effects ==="

# SFX from archive.org CC0 collection
download_file \
    "https://archive.org/download/999WavFiles/Sfx/boom.wav" \
    "public/assets/audio/sfx/reactions/sfx-reaction-vine-boom.mp3" \
    "Boom sound effect"

download_file \
    "https://archive.org/download/999WavFiles/Sfx/airhorn.wav" \
    "public/assets/audio/sfx/reactions/sfx-reaction-airhorn.mp3" \
    "Airhorn sound"

download_file \
    "https://archive.org/download/999WavFiles/Sfx/dog_bark.wav" \
    "public/assets/audio/sfx/animals/sfx-animal-dog-bark.mp3" \
    "Dog bark"

download_file \
    "https://archive.org/download/999WavFiles/Sfx/boing.wav" \
    "public/assets/audio/sfx/silly/sfx-silly-boing.mp3" \
    "Boing sound"

download_file \
    "https://archive.org/download/999WavFiles/Sfx/honk.wav" \
    "public/assets/audio/sfx/silly/sfx-silly-honk.mp3" \
    "Honk sound"

echo ""
echo "=== Voice Clips ==="

# Note: Voice clips might need manual creation or TTS
echo "⚠️  Voice clips need to be created manually or via TTS"
echo "    Visit https://ttsmp3.com/ to generate:"
echo "    - voice-sheesh.mp3 (text: 'Sheesh!')"
echo "    - voice-nocap.mp3 (text: 'No cap!')"
echo ""

echo "✅ Download attempt complete!"
echo ""
echo "Note: Some downloads may have failed (URLs are placeholders)."
echo "For production-ready audio, visit:"
echo "  - Pixabay: https://pixabay.com/sound-effects/"
echo "  - Freesound: https://freesound.org/"
echo "  - Archive.org: https://archive.org/details/audio"
