# buildabrainrot - Project Specification

## Vision

A simple, fun, client-side web application where users can **build their own viral meme characters and brainrots** and share them on social media — with zero signup, zero data storage, and maximum chaos.

**Core Principle**: "You don't just scroll brainrots — you build them."

---

## Technical Approach

### No Backend Storage
- **100% client-side** - Everything runs in the browser
- **No database** - No user data storage whatsoever
- **No user accounts** - Anonymous, instant access
- **No cookies/tracking** - Privacy-first approach

### Sharing Mechanism
When users create a brainrot:
1. Generate a shareable **URL with encoded parameters** (e.g., `buildabrainrot.com/?vibe=skibidi&char=shark_sneakers&phrase=...`)
2. Create **social media share buttons** with pre-filled text including attribution
3. Generate **downloadable images/videos** with watermark: "Made on buildabrainrot.com"
4. Optional: Generate **Open Graph meta tags** dynamically so shared links show preview

---

## User Flow

### 1. Landing Page
- Eye-catching, chaotic design
- Big CTA: "Make My Brainrot!"
- Random animations and sounds playing
- Examples of brainrots (hardcoded, not from database)

### 2. Brainrot Builder (Interactive Tool)
Step-by-step creation flow:

**Step 1: Choose Your Vibe**
- Italian / Skibidi / Rizzler / Goofy / Hyperpop / Random
- Each vibe has associated colors, fonts, and energy

**Step 2: Create Your Character**
- Simple text input: "Describe your character" (e.g., "Shark in sneakers")
- Auto-generate character art using:
  - Pre-made SVG components that mix/match
  - OR simple emoji/icon combinations
  - OR placeholder for future AI generation

**Step 3: Generate Your Chant**
- Auto-generate nonsense phrases based on vibe
- "Skibidi wop wop yes yes" style
- User can regenerate or edit manually
- Examples: "Ratio + L + Fanum Tax" / "Gyatt gyatt boom boom"

**Step 4: Pick Your Beat**
- Select from 5-10 license-free audio loops
- Each vibe has 2-3 associated beats
- Plays preview on selection

**Step 5: Preview & Share**
- Animated preview of the full brainrot
- Character + chant text + beat playing
- Background matches vibe aesthetic

**Share Options:**
- Copy shareable link (encodes all parameters in URL)
- Twitter/X share button (pre-filled with "I just built my brainrot at buildabrainrot.com! [link]")
- TikTok/Instagram share (copies link + suggested caption)
- Download as MP4/GIF with watermark

### 3. Discover Page (Optional)
- Show example brainrots (hardcoded)
- "Hall of Fame" - manually curated favorites
- Each example is clickable and loads the builder with those settings

---

## Visual Design

### Brand Identity
- **Name**: buildabrainrot
- **Mascot**: "Rotto" - a cartoon brain with googly eyes and sneakers
- **Tagline**: "Build the chaos. Share the chaos."

### Aesthetic
- Chunky bubble letters
- Pastel chaos colors (pink, yellow, cyan, lime)
- Gen Alpha TikTok meets early 2000s Flash games
- Constant subtle animations (wobbles, bounces, glitches)

### UI Components
- Big, tactile buttons with hover effects
- Progress indicator during builder flow
- Sound effects on clicks/interactions
- Random Rotto reactions/comments

---

## Technical Implementation

### Frontend
- **Vanilla JavaScript** (no framework needed)
- **HTML5 Canvas** or **SVG** for character composition
- **Web Audio API** for beat playback
- **URL encoding** for shareable state
- **Responsive design** for mobile/desktop

### Assets
- **Sounds**: 10-15 short license-free loops (stored in `/public/assets/sounds/`)
- **Character components**: SVG parts (eyes, bodies, accessories) that combine
- **Fonts**: Fun, chunky web fonts
- **Animations**: CSS animations + optional simple sprite sheets

### File Structure
```
public/
├── index.html              # Landing page
├── builder.html            # Brainrot builder tool
├── discover.html           # Example gallery (optional)
├── share.html              # Dynamic share page (reads URL params)
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── builder.css
│   ├── js/
│   │   ├── builder.js      # Main builder logic
│   │   ├── share.js        # URL encoding/decoding
│   │   └── preview.js      # Animation/preview rendering
│   ├── sounds/
│   │   ├── skibidi-beat.mp3
│   │   ├── hyperpop-loop.mp3
│   │   └── ...
│   ├── images/
│   │   ├── rotto-mascot.svg
│   │   └── character-parts/  # SVG components
│   └── fonts/
```

---

## Sharing Strategy

### URL Encoding
Example shareable URL:
```
https://buildabrainrot.com/share?v=skibidi&c=shark_sneakers&p=gyatt_gyatt_boom&b=2
```

Parameters:
- `v` = vibe ID
- `c` = character (encoded text or preset ID)
- `p` = phrase (encoded text)
- `b` = beat ID

### Social Media Templates

**Twitter/X:**
```
🧠💥 I just built my own brainrot!

[Character name] says: "[Phrase]"

Make yours → buildabrainrot.com
```

**TikTok/Instagram Caption:**
```
POV: You're building brainrots instead of scrolling them 💀🔥

Link in bio to make your own! #brainrot #buildabrainrot
```

### Download Options
- **Static image** (PNG) - Character + phrase text + watermark
- **Animated GIF** - Simple loop with beat visualization
- **Video (MP4)** - 5-10 second clip with audio

All downloads include: **"buildabrainrot.com"** watermark

---

## Future Enhancements (Phase 2)

- **AI Integration**: Text-to-image for custom characters
- **Remix Feature**: Load someone's brainrot and edit it
- **Brainrot Templates**: Quick-start presets
- **Sound Upload**: Let users upload their own beats (client-side only, no storage)
- **Battle Mode**: Side-by-side comparison tool

---

## Success Metrics

Since we're not tracking users, success = **organic sharing**:
- Social media mentions
- Backlinks from shared URLs
- Viral examples spreading in the wild

---

## Launch Checklist

- [ ] Landing page with CTA
- [ ] Builder tool (all 5 steps)
- [ ] URL encoding/decoding system
- [ ] Share functionality (copy link, social buttons)
- [ ] 5+ beats with license-free audio
- [ ] Character component system (SVGs or simple graphics)
- [ ] Preview/animation system
- [ ] Download image with watermark
- [ ] Mobile responsive design
- [ ] Domain: buildabrainrot.com

---

## Brand Voice

- Chaotic but friendly
- Self-aware parody of internet culture
- Encourages creativity and silliness
- Never takes itself seriously

**Example Copy:**
- "Your brain. Your rules. Make it weird."
- "Warning: May cause uncontrollable creativity"
- "Side effects include: going viral, confusing your parents"

---

## Questions?

This spec prioritizes **simplicity, shareability, and fun** over features. No backend complexity, just pure creative chaos in the browser.
