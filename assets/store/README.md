# Chrome Web Store Assets

This directory contains visual assets required for Chrome Web Store submission.

## Required Assets

### Screenshots (Required)
Store 3-5 screenshots in this directory:

- **Format**: PNG or JPEG
- **Recommended size**: 1280×800 pixels (16:10 aspect ratio)
- **Alternative size**: 640×400 pixels
- **Max file size**: 5MB per image
- **Naming convention**: 
  - `screenshot-1-sidebar-button.png` - Shows sidebar button on GitHub page
  - `screenshot-2-dropdown-menu.png` - Shows dropdown menu open with tools
  - `screenshot-3-github-dev.png` - Shows GitHub.dev opened from menu
  - `screenshot-4-nbviewer.png` - Shows nbviewer with Jupyter notebook
  - `screenshot-5-menu-positioning.png` - Shows menu position adaptation

**Screenshot Content Guidelines:**
1. Screenshot 1: GitHub repository page with sidebar button visible
2. Screenshot 2: Dropdown menu open showing all 8 tools
3. Screenshot 3: Example tool in action (GitHub.dev or CodeSandbox)
4. Screenshot 4: Another tool example (nbviewer for data science)
5. Screenshot 5: Menu positioning edge case (optional)

### Promotional Tiles

#### Small Promo Tile (Required)
- **Filename**: `tile-small-440x280.png`
- **Size**: 440×280 pixels
- **Format**: PNG (24-bit, no alpha transparency recommended)
- **Content**: Extension icon + "GitHub Switcher" text + "8 Developer Tools, One Click"

#### Large Promo Tile (Optional but Recommended)
- **Filename**: `tile-large-920x680.png`
- **Size**: 920×680 pixels
- **Format**: PNG (24-bit)
- **Content**: Same branding as small tile with more feature highlights

#### Marquee Promo Tile (Optional)
- **Filename**: `tile-marquee-1400x560.png`
- **Size**: 1400×560 pixels
- **Format**: PNG (24-bit)
- **Content**: Wide format showcase for featured placement

## Design Guidelines

### Color Scheme
Use the extension's brand colors:
- Primary: GitHub dark (#0D1117) or GitHub blue (#1F6FEB)
- Accent: Tool colors (VS Code blue, CodeSandbox yellow, etc.)
- Background: White or light gray (#F6F8FA)

### Typography
- Main heading: Bold, 24-32pt
- Subheading: Regular, 16-20pt
- Body text: Regular, 12-14pt
- Font: GitHub's font stack (system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", etc.)

### Image Quality
- Use high-resolution displays for screenshots (Retina/2x)
- Avoid compression artifacts
- Ensure text is readable
- Remove sensitive information (real repo names if preferred)

## Tools for Creating Assets

### Screenshot Tools
- **macOS**: Cmd+Shift+4 (select area), Cmd+Shift+5 (screenshot UI)
- **Windows**: Snipping Tool or Win+Shift+S
- **Chrome DevTools**: Device toolbar for responsive screenshots

### Design Tools
- **Figma**: Free, browser-based design tool (recommended)
- **Canva**: Template-based design (has promo tile templates)
- **Photoshop/Sketch**: Professional tools
- **GIMP**: Free, open-source alternative

### Image Optimization
```bash
# Install ImageOptim (macOS) or use online tools
# Or use pngquant/optipng for CLI
pngquant --quality=85-95 input.png -o output.png
```

## Capture Instructions

### Taking Screenshots

1. **Open Chrome with extension loaded**
   ```bash
   cd /Users/zhouyang/Coding/GitHub-Switcher
   pnpm build
   # Load build/chrome-mv3-prod/ in chrome://extensions/
   ```

2. **Navigate to a popular GitHub repo** (e.g., `github.com/microsoft/vscode`)

3. **Screenshot 1 - Sidebar Button**
   - Zoom to 100%
   - Ensure sidebar button is visible on left side
   - Capture full viewport or crop to show header + code area
   - Highlight button with red circle/arrow (optional)

4. **Screenshot 2 - Dropdown Menu**
   - Click sidebar button to open menu
   - Ensure all 8 tools are visible
   - Capture button + menu + surrounding context
   - Show cursor hovering over a tool (optional)

5. **Screenshot 3-5 - Tools in Action**
   - Click a tool link (e.g., GitHub.dev)
   - Wait for tool to load
   - Capture the opened tool interface
   - Show URL bar to prove it's the tool

### Editing Screenshots

1. **Resize to 1280×800**:
   ```bash
   # Using ImageMagick
   magick input.png -resize 1280x800^ -gravity center -extent 1280x800 output.png
   
   # Or use Preview (macOS): Tools → Adjust Size
   ```

2. **Add annotations** (optional):
   - Arrows pointing to key features
   - Red circles highlighting UI elements
   - Text labels for clarity
   - Use tools like Skitch, Snagit, or Figma

3. **Optimize file size**:
   - Target: <500KB per image
   - Use PNG for UI screenshots (better quality)
   - Use JPEG for photos/complex images (smaller size)

## Creating Promo Tiles

### Figma Template (Recommended)

1. Create new Figma file: 440×280 frame
2. Add extension icon (128px) on left side
3. Add text on right side:
   - "GitHub Switcher" (bold, 32pt)
   - "8 Developer Tools, One Click" (regular, 18pt)
4. Add tool logos in a grid (GitHub.dev, CodeSandbox, StackBlitz, etc.)
5. Export as PNG (2x resolution)

### Canva Template

1. Go to canva.com
2. Search for "App Store Screenshot" template
3. Customize with extension branding
4. Download as PNG (highest quality)

### Quick CLI Option

If you already have assets:
```bash
# Resize icon to create simple tile
magick assets/icon/icon-512.png -resize 280x280 -gravity center \
  -background "#1F6FEB" -extent 440x280 assets/store/tile-small-440x280.png
```

## Checklist Before Upload

- [ ] All screenshots are 1280×800 or 640×400 pixels
- [ ] Screenshots show extension in actual use on GitHub
- [ ] No sensitive information visible (private repos, tokens, etc.)
- [ ] Small promo tile (440×280) created
- [ ] Large promo tile (920×680) created (optional)
- [ ] All images optimized (<5MB, ideally <500KB)
- [ ] Images are clear and readable at 100% zoom
- [ ] Branding is consistent across all assets
- [ ] Text in images is in English (or localized)

## References

- [Chrome Web Store Image Best Practices](https://developer.chrome.com/docs/webstore/images/)
- [Chrome Web Store Branding Guidelines](https://developer.chrome.com/docs/webstore/branding/)
- [Figma Chrome Extension Template](https://www.figma.com/community/search?model_type=files&q=chrome%20extension)

## Need Help?

If you need help creating these assets:
1. Check the Chrome Web Store guidelines linked above
2. Look at similar extensions for inspiration (search "GitHub" in Chrome Web Store)
3. Use free design tools like Figma or Canva
4. Consider hiring a designer on Fiverr/Upwork (~$20-50 for a simple tile)
