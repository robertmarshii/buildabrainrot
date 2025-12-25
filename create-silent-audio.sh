#!/bin/bash
# Create minimal silent WAV files and rename to .mp3
# These will work as placeholders until real audio is added

echo "Creating placeholder audio files..."

# Helper function to create a minimal WAV header + silent data
create_silent_wav() {
    local file="$1"
    local duration_sec="$2"

    # Calculate file size for WAV
    # Sample rate: 44100 Hz, 16-bit, stereo
    # Bytes per second = 44100 * 2 * 2 = 176400
    local data_size=$((duration_sec * 176400))
    local file_size=$((data_size + 36))

    # Create WAV file with proper header
    (
        # RIFF header
        printf 'RIFF'
        printf '\x%02x\x%02x\x%02x\x%02x' $((file_size & 0xFF)) $(((file_size >> 8) & 0xFF)) $(((file_size >> 16) & 0xFF)) $(((file_size >> 24) & 0xFF))
        printf 'WAVE'

        # fmt chunk
        printf 'fmt '
        printf '\x10\x00\x00\x00'  # fmt chunk size (16)
        printf '\x01\x00'          # audio format (1 = PCM)
        printf '\x02\x00'          # number of channels (2 = stereo)
        printf '\x44\xAC\x00\x00' # sample rate (44100)
        printf '\x10\xB1\x02\x00' # byte rate (176400)
        printf '\x04\x00'          # block align (4)
        printf '\x10\x00'          # bits per sample (16)

        # data chunk
        printf 'data'
        printf '\x%02x\x%02x\x%02x\x%02x' $((data_size & 0xFF)) $(((data_size >> 8) & 0xFF)) $(((data_size >> 16) & 0xFF)) $(((data_size >> 24) & 0xFF))

        # Silent audio data (all zeros)
        dd if=/dev/zero bs=$data_size count=1 2>/dev/null
    ) > "$file"

    echo "✓ Created $file (${duration_sec}s)"
}

# Music files (20-30 seconds)
create_silent_wav "public/assets/audio/music/music-skibidi-beat-01.mp3" 20
create_silent_wav "public/assets/audio/music/music-chill-lofi-01.mp3" 30

# SFX - Reactions (1-2 seconds)
create_silent_wav "public/assets/audio/sfx/reactions/sfx-reaction-vine-boom.mp3" 1
create_silent_wav "public/assets/audio/sfx/reactions/sfx-reaction-airhorn.mp3" 2

# SFX - Animals (1 second)
create_silent_wav "public/assets/audio/sfx/animals/sfx-animal-dog-bark.mp3" 1

# SFX - Silly (0.5-1 second)
create_silent_wav "public/assets/audio/sfx/silly/sfx-silly-boing.mp3" 1
create_silent_wav "public/assets/audio/sfx/silly/sfx-silly-honk.mp3" 1

# Voices (1 second)
create_silent_wav "public/assets/audio/voices/voice-sheesh.mp3" 1
create_silent_wav "public/assets/audio/voices/voice-nocap.mp3" 1

echo ""
echo "✅ Done! All placeholder audio files created."
echo "Note: These are silent WAV files with .mp3 extension"
echo "Browsers will play them as valid audio files."
echo ""
echo "For production, replace with real audio from:"
echo "  - Pixabay Music: https://pixabay.com/music/"
echo "  - Freesound: https://freesound.org/"
echo "  - Incompetech: https://incompetech.com/music/"
