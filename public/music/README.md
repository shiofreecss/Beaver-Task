# Pomodoro Music Files

This directory contains background music files for the Pomodoro timer.

## How to Add Music Files

1. **Supported Formats**: MP3, WAV, OGG
2. **File Naming**: Use descriptive names like `ambient-1.mp3`, `focus-1.mp3`, etc.
3. **File Size**: Keep files under 10MB for optimal loading
4. **Quality**: 128-320 kbps MP3 is recommended

## Current Music Options

The following music files are referenced in the Pomodoro component:

- `ambient-1.mp3` - Ambient Music 1
- `focus-1.mp3` - Focus Music 1  
- `nature-1.mp3` - Nature Sounds
- `white-noise.mp3` - White Noise

## Adding New Music

1. Place your music files in this directory
2. Update the `musicOptions` array in `src/components/pomodoro/pomodoro-view.tsx`:

```typescript
const musicOptions = [
  { value: 'none', label: 'No Music' },
  { value: '/music/your-new-file.mp3', label: 'Your Music Name' },
  // ... existing options
]
```

## Recommended Music Types

- **Focus Sessions**: Instrumental, ambient, or white noise
- **Break Sessions**: Calming nature sounds or gentle music
- **Volume**: Keep at comfortable levels for extended listening

## Legal Considerations

- Only use royalty-free music or music you have rights to
- Consider Creative Commons licensed music
- Ensure compliance with copyright laws 