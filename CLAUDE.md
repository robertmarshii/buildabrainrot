# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**buildabrainrot** - An interactive web application that lets users create their own viral meme characters, songs, and trends. The core concept: "You don't just scroll brainrots — you build them."

## Tech Stack

- **Backend**: PHP
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Database**: PostgreSQL
- **Future**: Text-to-image/audio generation for custom characters and sounds

## Architecture

### Main Components

1. **Homepage** - Entry point with cartoon chaos design, "Make My Brainrot!" CTA, random animations/sounds
2. **Brainrot Builder Tool** - Step-by-step interactive creation flow:
   - Vibe selection (Italian/Skibidi/Rizzler/Goofy/Hyperpop/Random)
   - Character creation (e.g., "Shark in sneakers", "Banana in a suit")
   - Chant/phrase generation (auto-generate nonsense phrases)
   - Soundtrack/beat selection (license-free audio loops)
   - Preview and share/download functionality
3. **Brainrot Library** - Community showcase ranked by views/chaos level with reactions (💀 and 🧠🔥)
4. **Science of Brainrots** - Tongue-in-cheek educational section about virality

### Visual Design Guidelines

- Chunky bubble letters
- Cartoonish aesthetic (mascot: "Rotto" the brain with eyes and sneakers)
- Pastel chaos meets Gen Alpha TikTok aesthetics
- "Brainrot Labs" branding as parody scientific enterprise

## Database Schema

When implementing, the database should handle:
- User-created brainrots (characters, phrases, soundtracks, metadata)
- Community voting/reactions
- View counts and chaos level rankings
- Asset management for audio/visual elements

## Development Commands

### Running the Application

Start the application with Docker Compose:
```bash
docker-compose up -d
```

Access the application at: http://localhost:7777

Stop the application:
```bash
docker-compose down
```

Rebuild after changes to Dockerfile:
```bash
docker-compose up -d --build
```

View logs:
```bash
docker-compose logs -f web
```

### Database Access

Connect to PostgreSQL:
```bash
docker exec -it brainrot_db psql -U brainrot_user -d brainrot
```

### Project Structure

```
buildabrainrot/
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # PHP/Apache container definition
├── public/               # Web root (mounted to container)
│   ├── index.php        # Homepage
│   └── assets/
│       ├── css/         # Stylesheets
│       └── js/          # JavaScript files
```

## Future Features

- "Brainrot Battle" - voting system for user submissions
- "Brainrotify" - convert drawings/voice to full meme
- "Brainrot School" - parody educational content on virality laws
