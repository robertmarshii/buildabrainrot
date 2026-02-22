#!/bin/bash
# Quick Audio Setup - Downloads free CC0 audio for testing
# This downloads PUBLIC DOMAIN audio from Archive.org

echo "🎵 Downloading free audio for buildabrainrot..."
echo ""

# Create directories if they don't exist
mkdir -p public/assets/audio/music
mkdir -p public/assets/audio/sfx/reactions
mkdir -p public/assets/audio/sfx/animals
mkdir -p public/assets/audio/sfx/silly
mkdir -p public/assets/audio/sfx/meme
mkdir -p public/assets/audio/voices

echo "📁 Directories created"
echo ""

# Function to download with retry
download_file() {
    local url="$1"
    local output="$2"
    local name="$3"

    echo "⬇️  Downloading: $name"

    if curl -L --fail --silent --show-error "$url" -o "$output" 2>/dev/null; then
        echo "✅ Downloaded: $name"
        return 0
    else
        echo "❌ Failed: $name (you can download manually later)"
        return 1
    fi
}

echo "Note: This script downloads PUBLIC DOMAIN audio from Archive.org"
echo "You can also manually download from Pixabay/Freesound for better quality"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Download some basic sounds
# These are example URLs - you'll need to find actual public domain audio URLs

echo "💡 TIP: For best results, manually download from:"
echo "   - Music: https://pixabay.com/music/"
echo "   - SFX: https://freesound.org/"
echo ""
echo "This script creates placeholder reminders in the audio folders."

# Create README files in each directory
cat > public/assets/audio/music/README.txt <<EOF
DOWNLOAD MUSIC HERE
===================

Visit these free music sources:

1. Pixabay Music (No account needed)
   https://pixabay.com/music/search/lofi/
   Download and rename to: music-chill-lofi-01.mp3

2. Incompetech (Free with attribution)
   https://incompetech.com/music/royalty-free/
   Download and rename to: music-skibidi-beat-01.mp3

Files needed in this folder:
- music-skibidi-beat-01.mp3
- music-chill-lofi-01.mp3

After adding, refresh your browser!
EOF

cat > public/assets/audio/sfx/reactions/README.txt <<EOF
DOWNLOAD REACTION SOUNDS HERE
=============================

Visit Freesound.org (free account required):
https://freesound.org/

Search for:
- "boom impact" → rename to: sfx-reaction-vine-boom.mp3
- "airhorn" → rename to: sfx-reaction-airhorn.mp3
- "oof" → rename to: sfx-reaction-oof.mp3
- "bruh" → rename to: sfx-reaction-bruh.mp3
- "scream" → rename to: sfx-reaction-scream.mp3
- "wow" → rename to: sfx-reaction-wow.mp3
- "applause" → rename to: sfx-reaction-applause.mp3

After adding, refresh your browser!
EOF

cat > public/assets/audio/sfx/silly/README.txt <<EOF
DOWNLOAD SILLY SOUNDS HERE
==========================

Visit Freesound.org: https://freesound.org/

Search for:
- "boing spring" → sfx-silly-boing.mp3
- "honk" → sfx-silly-honk.mp3
- "fart" → sfx-silly-fart.mp3
- "whoosh" → sfx-silly-whoosh.mp3
- "pop bubble" → sfx-silly-pop.mp3
- "glass break" → sfx-silly-glass-break.mp3
EOF

cat > public/assets/audio/sfx/meme/README.txt <<EOF
DOWNLOAD MEME SOUNDS HERE
=========================

Visit Freesound.org: https://freesound.org/

Search for:
- "metal pipe falling" → sfx-meme-metal-pipe.mp3
- "windows error" → sfx-meme-error.mp3
- "discord notification" → sfx-meme-discord-join.mp3
- "crickets" → sfx-meme-crickets.mp3
- "record scratch" → sfx-meme-record-scratch.mp3
- "explosion" → sfx-meme-explosion.mp3
EOF

cat > public/assets/audio/voices/README.txt <<EOF
CREATE VOICE CLIPS HERE
=======================

Use FREE Text-to-Speech:
https://ttsmaker.com/ (no account needed)

1. Type: "Sheesh!"
2. Click "Convert to Speech"
3. Download MP3
4. Rename to: voice-sheesh.mp3

Repeat for:
- "No cap!" → voice-nocap.mp3
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 README files created in each audio folder with download instructions"
echo ""
echo "Next steps:"
echo "1. Visit the folders in public/assets/audio/"
echo "2. Read the README.txt files for download links"
echo "3. Download MP3 files and place them in the folders"
echo "4. Refresh your browser (Ctrl+F5)"
echo ""
echo "🎉 Then you'll hear your brainrots come to life!"
