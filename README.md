# 🧠 Build a Brainrot

> Create and share your own silly brainrot characters! A kid-friendly web application for ages 7+.

**You don't just scroll brainrots — you BUILD them! 🔥**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg)](https://php.net)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🎨 Features

- **Character Builder** - Create custom characters with bodies, colors, accessories, and faces
- **Scene Composer** - Add backgrounds, stickers, and text bubbles
- **Audio Mixer** - Pick background music and add sound effects
- **Instant Sharing** - Get a shareable URL to show friends
- **Download** - Save your creation as an image
- **Remix** - Edit and customize existing brainrots
- **100% Kid-Safe** - No chat, no personal info, COPPA compliant

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/buildabrainrot.git
cd buildabrainrot

# Start the application
docker-compose up -d

# Access at http://localhost:7777
```

### Manual Setup

**Requirements:**
- PHP 7.4 or higher
- Apache with mod_rewrite
- PostgreSQL (optional, for future database features)
- Node.js and npm (for asset generation)

**Installation:**

```bash
# 1. Clone repository
git clone https://github.com/your-username/buildabrainrot.git
cd buildabrainrot

# 2. Install dependencies
npm install

# 3. Generate placeholder assets
npm run generate-placeholders

# 4. Configure web server
# Point document root to /public
# Enable mod_rewrite and .htaccess

# 5. Access application
# http://localhost/
```

## 📖 How It Works

### User Flow

```
1. Homepage → 2. Character Builder → 3. Scene Builder → 4. Audio Mixer → 5. Share!
```

### Architecture

```
buildabrainrot/
├── public/                    # Web root
│   ├── index.php             # Homepage
│   ├── character-builder.php # Step 1: Character creation
│   ├── scene-builder.php     # Step 2: Scene composition
│   ├── audio-builder.php     # Step 3: Audio mixing
│   ├── view-brainrot.php     # Shared brainrot viewer
│   ├── assets/
│   │   ├── css/              # Stylesheets
│   │   ├── js/               # JavaScript modules
│   │   ├── images/           # Image assets
│   │   ├── audio/            # Audio assets
│   │   └── manifest.json     # Asset metadata
│   └── api/                  # API endpoints
├── scripts/                   # Build and utility scripts
├── test/                      # Test files
├── docs/                      # Documentation
└── docker-compose.yml         # Docker configuration
```

## 🎯 Core Concepts

### Asset System

All assets are defined in `public/assets/manifest.json`:

```json
{
  "version": "1.0",
  "categories": {
    "characters": [...],
    "accessories": [...],
    "backgrounds": [...],
    "stickers": [...],
    "music": [...],
    "sfx": [...]
  }
}
```

Assets are lazy-loaded and cached for performance.

### URL Encoding

Brainrots are encoded into shareable URLs using:
- Base64 encoding with URL-safe characters
- Optional gzip compression (via pako.js)
- Security validation to prevent XSS

Example URL: `https://buildabrainrot.com/b/c_H4sIAAAAAAAA...`

### Rendering Pipeline

1. **CharacterCanvas** - Renders character with accessories and face
2. **SceneCanvas** - Extends CharacterCanvas, adds background, stickers, text
3. **AudioMixer** - Manages music and SFX playback
4. **BrainrotViewer** - Reconstructs and plays shared brainrots

## 🛠️ Development

### Adding New Assets

```bash
# 1. Add image file to public/assets/images/{category}/
# 2. Add audio file to public/assets/audio/{category}/
# 3. Update public/assets/manifest.json

# Example manifest entry:
{
  "id": "char-body-new-character",
  "name": "New Character",
  "category": "characters",
  "subcategory": "bodies",
  "file": "/assets/images/characters/bodies/new-character.png",
  "colorizable": true
}
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
open test/integration-test.html

# Viewer tests
open test/test-viewer.html

# Asset manager tests
open test/test-asset-manager.html

# Encoder tests
open test/test-encoder.html
```

### Code Style

- **PHP**: Follow PSR-12 coding standards
- **JavaScript**: ES6+ with JSDoc comments
- **CSS**: Mobile-first, BEM naming convention
- **Comments**: Required for all public methods

## 📊 Analytics

Privacy-friendly analytics track:
- Page views
- Creation completions
- Share/download actions
- Error occurrences

**No personal data is collected.** Anonymous session IDs only.

## 🔒 Security

- XSS prevention via input sanitization
- CSRF protection
- Rate limiting on API endpoints
- Secure headers (X-Frame-Options, CSP, etc.)
- No user-uploaded content (Phase 1)
- Kid-safe content moderation

## 🎮 Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ iOS Safari (latest)
- ✅ Android Chrome (latest)

## 📱 Mobile Support

- Responsive design (mobile-first)
- Touch-friendly controls (60px+ targets)
- Optimized asset loading
- iOS audio handling

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and test
npm test

# 3. Commit with clear message
git commit -m "Add: new feature description"

# 4. Push and create PR
git push origin feature/your-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for kids ages 7+ with safety and fun in mind
- Inspired by Gen Alpha internet culture
- "Brainrot Labs" - A Serious Scientific Enterprise™

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/buildabrainrot/issues)
- **Email**: contact@buildabrainrot.com
- **Website**: https://buildabrainrot.com

## 🎉 Fun Facts

- Contains easter eggs! Try the Konami code on the homepage
- Every brainrot is unique - billions of possible combinations
- Over 23 placeholder assets ready to use
- Fully functional offline (with Service Worker)

---

**Made with 🧠 by Brainrot Labs**

*Remember: You don't just scroll brainrots — you BUILD them!*
