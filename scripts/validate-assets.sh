#!/bin/bash
# Asset validation script for Build a Brainrot
# Validates directory structure, manifest.json, and asset files

echo "🔍 Validating Build a Brainrot Assets..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if we're in the right directory
if [ ! -d "public/assets" ]; then
    echo -e "${RED}✗ Error: public/assets directory not found${NC}"
    echo "  Run this script from project root"
    exit 1
fi

echo "📁 Checking directory structure..."

# Required directories
REQUIRED_DIRS=(
    "public/assets/audio/music"
    "public/assets/audio/sfx/reactions"
    "public/assets/audio/sfx/animals"
    "public/assets/audio/sfx/silly"
    "public/assets/audio/voices"
    "public/assets/images/characters/bodies"
    "public/assets/images/characters/accessories"
    "public/assets/images/characters/faces"
    "public/assets/images/characters/effects"
    "public/assets/images/backgrounds"
    "public/assets/images/stickers"
    "public/assets/images/ui"
    "public/assets/animations"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir"
    else
        echo -e "  ${RED}✗${NC} Missing: $dir"
        ((ERRORS++))
    fi
done

echo ""
echo "📄 Checking manifest.json..."

# Check if manifest exists
if [ ! -f "public/assets/manifest.json" ]; then
    echo -e "${RED}✗ manifest.json not found${NC}"
    ((ERRORS++))
    exit 1
fi

# Validate JSON syntax
if command -v jq &> /dev/null; then
    if jq empty public/assets/manifest.json 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Valid JSON syntax"
    else
        echo -e "  ${RED}✗${NC} Invalid JSON syntax"
        ((ERRORS++))
        exit 1
    fi

    # Check required top-level keys
    REQUIRED_KEYS=("version" "audio" "images" "animations" "metadata")
    for key in "${REQUIRED_KEYS[@]}"; do
        if jq -e ".$key" public/assets/manifest.json > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Has '$key' key"
        else
            echo -e "  ${RED}✗${NC} Missing '$key' key"
            ((ERRORS++))
        fi
    done

    # Get version
    VERSION=$(jq -r '.version' public/assets/manifest.json)
    echo -e "  ${GREEN}✓${NC} Version: $VERSION"

else
    echo -e "  ${YELLOW}⚠${NC}  jq not installed, skipping detailed JSON validation"
    echo "     Install with: sudo apt-get install jq"
    ((WARNINGS++))
fi

echo ""
echo "🖼️  Checking image assets..."

# Count image files
BODY_COUNT=$(find public/assets/images/characters/bodies -type f \( -name "*.png" -o -name "*.jpg" \) 2>/dev/null | wc -l)
ACC_COUNT=$(find public/assets/images/characters/accessories -type f \( -name "*.png" -o -name "*.jpg" \) 2>/dev/null | wc -l)
BG_COUNT=$(find public/assets/images/backgrounds -type f \( -name "*.png" -o -name "*.jpg" \) 2>/dev/null | wc -l)
STICKER_COUNT=$(find public/assets/images/stickers -type f \( -name "*.png" -o -name "*.jpg" \) 2>/dev/null | wc -l)

echo "  Character bodies: $BODY_COUNT (target: 12+)"
echo "  Accessories: $ACC_COUNT (target: 15+)"
echo "  Backgrounds: $BG_COUNT (target: 8+)"
echo "  Stickers: $STICKER_COUNT (target: 15+)"

if [ $BODY_COUNT -lt 12 ]; then
    echo -e "  ${YELLOW}⚠${NC}  Need more character bodies"
    ((WARNINGS++))
fi

# Check for files with spaces in names (not allowed)
echo ""
echo "🔍 Checking naming conventions..."

FILES_WITH_SPACES=$(find public/assets -type f -name "* *" 2>/dev/null | wc -l)
if [ $FILES_WITH_SPACES -gt 0 ]; then
    echo -e "  ${RED}✗${NC} Found $FILES_WITH_SPACES files with spaces in names"
    find public/assets -type f -name "* *" -exec echo "     {}" \;
    ((ERRORS++))
else
    echo -e "  ${GREEN}✓${NC} No files with spaces in names"
fi

# Check for uppercase in filenames (prefer lowercase)
FILES_WITH_UPPERCASE=$(find public/assets -type f -name "*[A-Z]*" ! -name "README.md" ! -name "*.txt" 2>/dev/null | wc -l)
if [ $FILES_WITH_UPPERCASE -gt 0 ]; then
    echo -e "  ${YELLOW}⚠${NC}  Found $FILES_WITH_UPPERCASE files with uppercase letters"
    ((WARNINGS++))
else
    echo -e "  ${GREEN}✓${NC} All filenames are lowercase"
fi

echo ""
echo "🎵 Checking audio assets..."

# Count audio files
MUSIC_COUNT=$(find public/assets/audio/music -type f -name "*.mp3" 2>/dev/null | wc -l)
SFX_COUNT=$(find public/assets/audio/sfx -type f -name "*.mp3" 2>/dev/null | wc -l)
VOICE_COUNT=$(find public/assets/audio/voices -type f -name "*.mp3" 2>/dev/null | wc -l)

echo "  Music tracks: $MUSIC_COUNT (target: 15+)"
echo "  Sound effects: $SFX_COUNT (target: 40+)"
echo "  Voice clips: $VOICE_COUNT (target: 10+)"

if [ $MUSIC_COUNT -lt 15 ]; then
    echo -e "  ${YELLOW}⚠${NC}  Need more music tracks"
    ((WARNINGS++))
fi

# Check for large files
echo ""
echo "📦 Checking file sizes..."

if command -v find &> /dev/null; then
    LARGE_IMAGES=$(find public/assets/images -type f -size +500k 2>/dev/null | wc -l)
    LARGE_AUDIO=$(find public/assets/audio -type f -size +1000k 2>/dev/null | wc -l)

    if [ $LARGE_IMAGES -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC}  Found $LARGE_IMAGES images > 500KB"
        find public/assets/images -type f -size +500k -exec ls -lh {} \; | awk '{print "     " $9 " (" $5 ")"}'
        ((WARNINGS++))
    else
        echo -e "  ${GREEN}✓${NC} All images under 500KB"
    fi

    if [ $LARGE_AUDIO -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC}  Found $LARGE_AUDIO audio files > 1MB"
        find public/assets/audio -type f -size +1000k -exec ls -lh {} \; | awk '{print "     " $9 " (" $5 ")"}'
        ((WARNINGS++))
    else
        echo -e "  ${GREEN}✓${NC} All audio files under 1MB"
    fi
fi

# Check README exists
echo ""
echo "📚 Checking documentation..."

if [ -f "public/assets/README.md" ]; then
    echo -e "  ${GREEN}✓${NC} README.md exists"
else
    echo -e "  ${RED}✗${NC} Missing README.md"
    ((ERRORS++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════"
echo "Summary:"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ No errors found${NC}"
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ No warnings${NC}"
else
    echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
fi
echo "═══════════════════════════════════════"

# Exit code
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
