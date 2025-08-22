# Favicon Conversion Guide

The favicon has been created as an SVG file (`favicon.svg`) with a heart symbol representing health and family care.

## Converting to Other Formats

### Option 1: Online Converters (Recommended)
1. Go to https://convertio.co/svg-ico/ or https://favicon.io/favicon-converter/
2. Upload the `favicon.svg` file
3. Convert to ICO format for `favicon.ico`
4. Convert to PNG format for `logo192.png` (192x192 pixels)

### Option 2: Using ImageMagick (if installed)
```bash
# Convert SVG to ICO (multiple sizes)
convert favicon.svg -resize 16x16 favicon-16.ico
convert favicon.svg -resize 32x32 favicon-32.ico
convert favicon.svg -resize 48x48 favicon-48.ico
# Combine into single ICO file
convert favicon-16.ico favicon-32.ico favicon-48.ico favicon.ico

# Convert SVG to PNG
convert favicon.svg -resize 192x192 logo192.png
```

### Option 3: Using Node.js (if you want to add to build process)
```bash
npm install -g svg2png svg2ico
svg2png favicon.svg -o logo192.png -w 192 -h 192
svg2ico favicon.svg -o favicon.ico
```

## Current Favicon Files
- `favicon.svg` - Vector format (created)
- `favicon.ico` - Placeholder (needs conversion)
- `logo192.png` - Placeholder (needs conversion)

## Browser Support
- Modern browsers will use the SVG favicon
- Older browsers will fall back to the ICO file
- The HTML is configured to use both formats for maximum compatibility
