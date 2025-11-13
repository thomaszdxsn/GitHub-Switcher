# Quick Start: Release GitHub-Switcher v1.0.0

Fast-track guide to releasing the first version to Chrome Web Store.

## ⚡ Quick Commands

```bash
# 1. Bump version (if needed)
npm version 1.0.0 --no-git-tag-version
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.0"
git push origin main

# 2. Create and push tag (triggers auto-release)
git tag -a v1.0.0 -m "Release v1.0.0 - First public release"
git push origin v1.0.0

# 3. Wait for GitHub Actions to complete (~2-3 minutes)
# Then download ZIP from: https://github.com/thomaszdxsn/GitHub-Switcher/releases

# 4. Submit to Chrome Web Store
# Upload ZIP at: https://chrome.google.com/webstore/devconsole
```

---

## 📋 Pre-Release Checklist (5 minutes)

```bash
# Verify you're on main with latest changes
git checkout main
git pull origin main

# Run full test suite
pnpm lint && pnpm typecheck && pnpm test

# Build and test locally
pnpm build
# Load build/chrome-mv3-prod/ in Chrome at chrome://extensions/
# Test on a GitHub repo

# Verify version and changelog
grep '"version"' package.json  # Should show 1.0.0 (or 0.1.0 if not bumped yet)
grep '\[1.0.0\]' CHANGELOG.md  # Should show release entry

# If all checks pass, proceed to release!
```

---

## 🚀 Release Steps (Automated)

### Step 1: Create Tag
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - First public release"
git push origin v1.0.0
```

### Step 2: Monitor GitHub Actions
Open: https://github.com/thomaszdxsn/GitHub-Switcher/actions

Expected workflow steps:
1. ✅ Checkout code
2. ✅ Install dependencies
3. ✅ Run linter
4. ✅ Run type check
5. ✅ Run tests
6. ✅ Build extension
7. ✅ Create ZIP archive
8. ✅ Create GitHub Release

**Duration**: ~2-3 minutes

### Step 3: Verify Release
1. Go to: https://github.com/thomaszdxsn/GitHub-Switcher/releases
2. Check release `v1.0.0` was created
3. Download `github-switcher-v1.0.0.zip`
4. Verify ZIP contents:
   ```bash
   unzip -l github-switcher-v1.0.0.zip
   # Should show: manifest.json, contents.*.js, icon*.png
   ```

---

## 🌐 Chrome Web Store Submission (30 minutes)

### Prerequisites
- [ ] Chrome Web Store developer account registered ($5)
- [ ] GitHub Pages enabled (privacy policy hosted)
- [ ] Screenshots ready (3-5 images, 1280×800px)
- [ ] Small promo tile ready (440×280px PNG)

### Submission Form

#### 1. Upload Package
- Upload: `github-switcher-v1.0.0.zip` (from GitHub Release)

#### 2. Store Listing
**Extension Name** (max 45 chars):
```
GitHub Switcher - Developer Tools Launcher
```

**Short Description** (max 132 chars):
```
Quick access to 8 developer tools for GitHub repos. Open any repo in GitHub.dev, CodeSandbox, StackBlitz, nbviewer, and more.
```

**Detailed Description**:
Copy from: `docs/STORE_LISTING.md` (markdown section)

**Category**: Developer Tools

**Language**: English

#### 3. Privacy Practices
**Privacy Policy URL**:
```
https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html
```

**Permission Justifications**:

For `https://github.com/*/*`:
> Used to inject a sidebar button on GitHub repository pages. The extension reads the current URL to extract repository owner/name for generating tool links. No data is transmitted to external servers.

For `storage`:
> Used to save user preferences (e.g., which tools to show in the dropdown menu) locally in the browser using chrome.storage.sync API. If Chrome Sync is enabled, preferences sync across user's Chrome instances via Chrome's built-in sync mechanism.

**Data Collection**: Select "No" for all questions

#### 4. Assets
- **Small promo tile** (440×280): Upload from `assets/store/tile-small-440x280.png`
- **Screenshots**: Upload 3-5 images from `assets/store/screenshot-*.png`
- **Large promo tile** (920×680): Optional

#### 5. Distribution
- **Visibility**: Public
- **Regions**: All regions
- **Pricing**: Free

#### 6. Submit
- Preview listing
- Click "Submit for review"
- Wait 1-3 business days for approval

---

## 📸 Quick Screenshot Guide (1-2 hours)

### Required Screenshots (1280×800px PNG)

#### Screenshot 1: Sidebar Button
```
1. Open Chrome with extension loaded
2. Navigate to: https://github.com/microsoft/vscode
3. Wait for page to load fully
4. Zoom to 100%
5. Ensure sidebar button is visible on left side
6. Press Cmd+Shift+4 (macOS) or Win+Shift+S (Windows)
7. Capture full viewport
8. Save as: assets/store/screenshot-1-sidebar-button.png
9. Resize to 1280×800 if needed
```

#### Screenshot 2: Dropdown Menu
```
1. Click sidebar button to open menu
2. Ensure all 8 tools are visible
3. Capture sidebar button + open menu
4. Save as: assets/store/screenshot-2-dropdown-menu.png
```

#### Screenshot 3: GitHub.dev
```
1. Click "GitHub.dev" in menu
2. Wait for GitHub.dev to load
3. Capture VS Code interface
4. Save as: assets/store/screenshot-3-github-dev.png
```

#### Screenshot 4-5: Optional
- nbviewer with Jupyter notebook
- Menu positioning edge case

### Image Optimization
```bash
# Resize to 1280×800 (using ImageMagick)
magick input.png -resize 1280x800^ -gravity center -extent 1280x800 output.png

# Or use online tools:
# - TinyPNG.com (compression)
# - Squoosh.app (resize + compress)
```

---

## 🎨 Quick Promo Tile Guide (30 minutes)

### Option 1: Figma (Recommended)
1. Create new file: 440×280 frame
2. Add extension icon (from `assets/icon/icon-512.png`)
3. Add text: "GitHub Switcher" (bold, 32pt)
4. Add subtitle: "8 Developer Tools, One Click"
5. Add tool logos in grid
6. Export as PNG (2x resolution)
7. Save as: `assets/store/tile-small-440x280.png`

### Option 2: Canva
1. Go to canva.com
2. Custom size: 440×280px
3. Search for "App Icon" template
4. Customize with extension branding
5. Download as PNG
6. Save as: `assets/store/tile-small-440x280.png`

### Option 3: Simple CLI
```bash
# Create basic tile from icon
magick assets/icon/icon-512.png -resize 280x280 -gravity west \
  -background "#1F6FEB" -extent 440x280 \
  assets/store/tile-small-440x280.png
```

---

## 🔧 Troubleshooting

### GitHub Actions fails
```bash
# Check logs at: https://github.com/thomaszdxsn/GitHub-Switcher/actions

# If tests fail, run locally:
pnpm test

# If build fails:
pnpm build

# Fix issues, commit, then delete and recreate tag:
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Chrome Web Store rejects submission
Common reasons:
1. **Privacy policy not accessible**
   - Enable GitHub Pages in repo settings
   - Verify URL: https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html

2. **Missing permission justification**
   - Add detailed explanation (see template above)

3. **Low-quality screenshots**
   - Ensure 1280×800 resolution
   - Show actual extension functionality

### Tag already exists
```bash
# Delete local and remote tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Recreate
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## ✅ Post-Release

After Chrome Web Store approval:

```bash
# 1. Update README with store link
# 2. Test installation from store
# 3. Announce release on GitHub
# 4. Monitor reviews and issues
```

---

## 📚 Full Documentation

For detailed instructions, see:
- **Complete guide**: `docs/RELEASE_GUIDE.md`
- **Store listing**: `docs/STORE_LISTING.md`
- **Publishing checklist**: `docs/PUBLISHING_CHECKLIST.md`
- **Assets guide**: `assets/store/README.md`

---

## 🎯 Summary

**To release v1.0.0:**
1. ✅ Create tag: `git tag -a v1.0.0 -m "..." && git push origin v1.0.0`
2. ⏳ Wait for GitHub Actions (~3 minutes)
3. 📥 Download ZIP from GitHub Release
4. 📸 Prepare screenshots and promo tile (1-2 hours)
5. 🌐 Submit to Chrome Web Store (30 minutes)
6. ⏰ Wait for review (1-3 business days)

**Total time**: ~2-3 hours + review time  
**Cost**: $5 one-time developer registration fee

Good luck! 🚀
