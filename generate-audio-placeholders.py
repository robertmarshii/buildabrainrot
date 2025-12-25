#!/usr/bin/env python3
"""
Generate placeholder audio files for buildabrainrot project.
Creates silent MP3 files with appropriate durations based on manifest.json
"""

import json
import os
import struct
import wave

def create_silent_wav(filename, duration_seconds, sample_rate=44100):
    """Create a silent WAV file"""
    num_channels = 2  # Stereo
    sample_width = 2  # 16-bit
    num_frames = int(duration_seconds * sample_rate)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)

        # Write silent frames (all zeros)
        silent_frame = struct.pack('<hh', 0, 0)  # stereo silence
        for _ in range(num_frames):
            wav_file.writeframes(silent_frame)

    print(f"✓ Created {filename} ({duration_seconds}s)")

def main():
    # Load manifest to get correct durations
    manifest_path = 'public/assets/manifest.json'

    if not os.path.exists(manifest_path):
        print(f"Error: {manifest_path} not found!")
        return

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    print("Generating placeholder audio files...\n")

    # Generate music files
    if 'audio' in manifest and 'music' in manifest['audio']:
        for track in manifest['audio']['music']:
            file_path = os.path.join('public', 'assets', track['file'])
            duration = track.get('duration', 20.0)

            # Create WAV file (we'll rename to MP3 but browsers accept WAV too)
            wav_path = file_path.replace('.mp3', '.wav')
            create_silent_wav(wav_path, duration)

            # Rename to .mp3 (browsers will still play WAV files with .mp3 extension)
            if os.path.exists(file_path):
                os.remove(file_path)
            os.rename(wav_path, file_path)

    # Generate SFX files
    if 'audio' in manifest and 'sfx' in manifest['audio']:
        for category, sounds in manifest['audio']['sfx'].items():
            for sound in sounds:
                file_path = os.path.join('public', 'assets', sound['file'])
                duration = sound.get('duration', 1.0)

                wav_path = file_path.replace('.mp3', '.wav')
                create_silent_wav(wav_path, duration)

                if os.path.exists(file_path):
                    os.remove(file_path)
                os.rename(wav_path, file_path)

    # Generate voice files
    if 'audio' in manifest and 'voices' in manifest['audio']:
        for voice in manifest['audio']['voices']:
            file_path = os.path.join('public', 'assets', voice['file'])
            duration = voice.get('duration', 1.0)

            wav_path = file_path.replace('.mp3', '.wav')
            create_silent_wav(wav_path, duration)

            if os.path.exists(file_path):
                os.remove(file_path)
            os.rename(wav_path, file_path)

    print(f"\n✅ Done! All placeholder audio files generated.")
    print("Note: These are silent WAV files renamed to .mp3")
    print("For production, replace with actual audio from sites like:")
    print("  - Pixabay Music: https://pixabay.com/music/")
    print("  - Freesound: https://freesound.org/")
    print("  - Incompetech: https://incompetech.com/music/")

if __name__ == '__main__':
    main()
