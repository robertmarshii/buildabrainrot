# Testing Notes - Current Issues

## SFX Audio Not Playing - Debugging Steps

If you're seeing errors like "Cannot read properties of null (reading 'file')" when clicking SFX buttons:

1. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

2. **Clear manifest cache** (in browser console):
   ```javascript
   assetManager.clearCache();
   location.reload();
   ```

3. **Check console output**:
   - Open browser DevTools (F12)
   - Look for: `✓ Loaded SFX assets: 5 [array of IDs]`
   - If it shows 0 assets, the manifest isn't loading correctly

4. **Verify manifest version**:
   - Current version should be 1.0.4
   - Check `/assets/manifest.json` in Network tab

## Expected Behavior

### Character Builder → Scene Builder
- Accessories positioned in character-builder should maintain their relative positions
- When character is centered in scene-builder, accessories should be in same relative positions
- All positions are relative to character body center

### Audio Builder
- Music should play (tone-based)
- SFX buttons should add sound effects to timeline
- Timeline should show SFX icons at correct positions
- Playback should trigger SFX at scheduled times

## Quick Fix if SFX Still Broken

If SFX assets aren't loading after cache clear:

1. Check browser console for the debug output showing loaded SFX
2. If 0 assets are loaded, uncomment this line in `audio-builder.php` line 475:
   ```javascript
   assetManager.clearCache(); // Remove the // to uncomment
   ```
3. Refresh the page
4. Comment it back out after one refresh

## Files Modified in Latest Session

1. `AudioMixer.js` - Added null check for assets
2. `CharacterCanvas.js` - Deep copy positions in getCharacterData
3. `audio-builder.php` - Added debug logging
4. `manifest.json` - Bumped version to 1.0.4

## Testing Checklist

- [ ] Character builder: Create character with accessories
- [ ] Scene builder: Verify accessories are in correct positions
- [ ] Scene builder: Drag accessories around
- [ ] Scene builder: Add stickers and text
- [ ] Audio builder: Play music (tone should play)
- [ ] Audio builder: Click SFX buttons (should add to list)
- [ ] Audio builder: Play timeline (SFX should trigger)
- [ ] Share modal: Generate URL
- [ ] View page: Decode and display brainrot

