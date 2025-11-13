# Chrome Web Store Listing Content

## Extension Name (max 45 chars)
```
GitHub Switcher - Developer Tools Launcher
```
*Character count: 43*

## Short Description (max 132 chars)
```
Quick access to 8 developer tools for GitHub repos. Open any repo in GitHub.dev, CodeSandbox, StackBlitz, nbviewer, and more.
```
*Character count: 131*

## Detailed Description (recommended 500+ words)

```markdown
# GitHub Switcher

Enhance your GitHub workflow with instant access to third-party developer tools. A lightweight sidebar button appears on every GitHub repository page, giving you one-click access to 8 powerful development tools.

## ✨ Features

**8 Integrated Developer Tools:**

1. **GitHub.dev** - Edit code directly in VS Code for the Web, no setup required
2. **DeepWiki** - AI-powered documentation explorer and code analyzer
3. **CodeSandbox** - Full-featured online code editor with live preview
4. **StackBlitz** - Instant full-stack development environment in your browser
5. **nbviewer** - Enhanced Jupyter notebook viewer with better rendering
6. **gitdiagram** - Visualize repository structure and dependencies as diagrams
7. **gitingest** - Analyze repository metrics, complexity, and insights
8. **githistory** - Interactive file history and code evolution visualization

**Why Use GitHub Switcher?**

⚡ **Lightning Fast**: One-click access to tools without manually typing URLs or bookmarks
🎯 **Context-Aware**: Automatically detects repository owner/name from the current page
🔒 **Privacy First**: No data collection, no tracking, all processing happens locally in your browser
📱 **Sync Preferences**: Your tool preferences sync across Chrome devices (via Chrome Sync)
♿ **Accessible**: Full keyboard navigation and screen reader support (ARIA compliant)
🌐 **Always Available**: Fixed sidebar button stays accessible while scrolling

**Perfect For:**

- 🧑‍💻 Developers who frequently use GitHub.dev for quick edits
- 📊 Data scientists viewing Jupyter notebooks with nbviewer
- 🎨 Frontend developers testing code in CodeSandbox/StackBlitz
- 📈 Team leads analyzing repository structure with gitdiagram
- 🔍 Code reviewers exploring file history with githistory
- 🤖 AI/ML practitioners using DeepWiki for code exploration

## 🚀 How It Works

1. **Visit any GitHub repository** (e.g., `github.com/microsoft/vscode`)
2. **Click the sidebar button** on the left side of the page (shows "Tools" vertically)
3. **Select a tool** from the dropdown menu
4. **Tool opens automatically** with the correct repository context

That's it! No configuration needed - works out of the box on all GitHub repo pages.

## 🔐 Privacy & Permissions

This extension requires minimal permissions to function:

**Host Permission (`https://github.com/*/*`)**
- Allows injection of the sidebar button on GitHub repository pages
- Reads current URL to extract owner/repo information
- No data transmitted to external servers

**Storage Permission (`storage`)**
- Saves your UI preferences (e.g., which tools to show)
- Stores settings locally using Chrome's secure storage API
- Syncs across your Chrome devices if Chrome Sync is enabled

**What We DON'T Do:**
- ❌ Collect or transmit any user data
- ❌ Track browsing history or activity
- ❌ Access private repository content without permission
- ❌ Make network requests to our servers (we don't have any!)
- ❌ Inject ads or promotional content

**100% Local**: All functionality runs entirely in your browser. The extension only generates tool URLs and opens them when you click a menu item.

See our full [Privacy Policy](https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html) for details.

## 🛠️ Technical Details

- **Framework**: Built with Plasmo (Manifest V3 compliant)
- **Bundle Size**: ~14KB uncompressed, ~4.4KB gzipped (lightning fast!)
- **Test Coverage**: 100% coverage on core utilities
- **Browser Support**: Chrome 88+, Edge 88+ (Manifest V3)
- **License**: MIT (open source)

## 📖 Open Source

This extension is fully open source! Review the code, contribute features, or report issues:

- **GitHub Repository**: [github.com/thomaszdxsn/GitHub-Switcher](https://github.com/thomaszdxsn/GitHub-Switcher)
- **Issue Tracker**: [GitHub Issues](https://github.com/thomaszdxsn/GitHub-Switcher/issues)
- **Contributing**: [CONTRIBUTING.md](https://github.com/thomaszdxsn/GitHub-Switcher/blob/main/CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](https://github.com/thomaszdxsn/GitHub-Switcher/blob/main/CHANGELOG.md)

## 💬 Support

Need help? Have a feature request?

- **Report Bugs**: [Open an issue](https://github.com/thomaszdxsn/GitHub-Switcher/issues/new)
- **Feature Requests**: [Start a discussion](https://github.com/thomaszdxsn/GitHub-Switcher/discussions)
- **Contact**: thomaszdxsn@gmail.com

## 🎯 Roadmap

Upcoming features in development:
- Custom tool configuration (add your own tools)
- Tool search and filtering
- Keyboard shortcuts (e.g., `Ctrl+K` to open menu)
- More third-party tool integrations
- Firefox and Safari support

## ⭐ Version History

**v1.0.0** (Current Release)
- Initial release with 8 integrated tools
- Sidebar button with fixed positioning
- Smart menu positioning (adapts to viewport)
- Full keyboard and screen reader accessibility
- GitHub SPA navigation support
- Preference syncing across devices

See [CHANGELOG.md](https://github.com/thomaszdxsn/GitHub-Switcher/blob/main/CHANGELOG.md) for detailed release notes.

---

**Made with ❤️ by developers, for developers.**

If you find this extension helpful, please leave a review and share it with your team! ⭐
```

## Category
**Developer Tools**

## Primary Language
**English**

## Tags/Keywords
- github
- developer tools
- github.dev
- codesandbox
- stackblitz
- productivity
- code editor
- jupyter notebooks
- repository tools
- version control

## Support URL
```
https://github.com/thomaszdxsn/GitHub-Switcher/issues
```

## Homepage URL
```
https://github.com/thomaszdxsn/GitHub-Switcher
```

## Privacy Policy URL
```
https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html
```
*(Must be hosted publicly - see setup instructions below)*

---

## 📸 Screenshot Descriptions

**Screenshot 1: Sidebar Button on GitHub Repository**
> Shows the fixed sidebar button ("Tools" text vertically aligned) on a GitHub repository page. The button is positioned on the left side with high contrast for easy visibility.

**Screenshot 2: Dropdown Menu Open**
> Displays the dropdown menu with all 8 tool options visible. Shows tool names and optional notes (e.g., "optimal for .ipynb files" for nbviewer). Menu positioned below the button with proper spacing.

**Screenshot 3: Tool in Action - GitHub.dev**
> Shows a repository opened in GitHub.dev (VS Code for the Web) after clicking the menu item. Demonstrates the seamless transition from GitHub to the integrated tool.

**Screenshot 4: Tool in Action - nbviewer**
> Shows a Jupyter notebook rendered in nbviewer, demonstrating the specialized tool integration for data science workflows.

**Screenshot 5: Menu Positioning Adaptation**
> Shows how the menu adapts its position when near viewport edges (top-right positioning when button is near bottom of viewport).

---

## 🎨 Promotional Tile Specifications

### Small Promo Tile (Required)
- **Size**: 440×280 pixels
- **Format**: PNG (24-bit)
- **Content**: 
  - Extension icon (centered or left-aligned)
  - Text: "GitHub Switcher" (bold, large font)
  - Subtitle: "8 Developer Tools, One Click"
  - Simple background gradient or solid color
  - Include tool icons (GitHub.dev, CodeSandbox, StackBlitz, etc.)

### Large Promo Tile (Optional but Recommended)
- **Size**: 920×680 pixels
- **Format**: PNG (24-bit)
- **Content**:
  - Same branding as small tile
  - Additional space for feature highlights
  - Screenshots or mockups of the extension in action
  - Call-to-action text: "Install Now" or "Try Free"

### Marquee Promo Tile (Optional - for Featured Placement)
- **Size**: 1400×560 pixels
- **Format**: PNG (24-bit)
- **Content**:
  - Wide format showcasing extension interface
  - Key feature callouts (privacy, speed, accessibility)
  - Professional design matching Chrome Web Store guidelines

---

## 📋 Pre-Submission Checklist

### Required Before Submission
- [ ] Small promo tile (440×280 PNG) created and exported
- [ ] 3-5 screenshots (1280×800 or 640×400) captured and optimized
- [ ] Privacy policy hosted at public URL (GitHub Pages recommended)
- [ ] Extension name, short description, detailed description finalized
- [ ] Support email or URL configured
- [ ] Chrome Web Store Developer account registered ($5 fee paid)
- [ ] Extension tested in Chrome stable (latest version)
- [ ] Manifest includes author field
- [ ] Manifest includes storage permission
- [ ] Build output reviewed for correct version number

### Optional but Recommended
- [ ] Large promo tile (920×680 PNG) created
- [ ] Demo video (2-3 minutes) uploaded to YouTube
- [ ] Localization for additional languages (Chinese, Spanish, etc.)
- [ ] Feature graphic (1400×560 PNG) for homepage placement
- [ ] Beta testing with small user group completed
- [ ] Analytics/feedback mechanism considered (optional)

---

## 🚀 Publishing Process

### Step 1: Prepare Assets
1. Take screenshots at 1280×800 resolution
2. Design promo tiles using Figma/Canva/Photoshop
3. Export all images as optimized PNGs

### Step 2: Host Privacy Policy
1. Enable GitHub Pages in repo settings (Settings → Pages)
2. Set source to `main` branch, `/docs` folder
3. Verify privacy policy accessible at `https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html`

### Step 3: Build Production Bundle
1. Run `pnpm build` to generate `build/chrome-mv3-prod/`
2. Verify manifest.json has correct version and author
3. Test extension locally in Chrome

### Step 4: Create ZIP Archive
```bash
cd build/chrome-mv3-prod/
zip -r github-switcher-v1.0.0.zip .
```

### Step 5: Submit to Chrome Web Store
1. Log in to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item" and upload ZIP file
3. Fill in store listing details (name, description, category, etc.)
4. Upload screenshots and promo tiles
5. Set privacy policy URL
6. Choose visibility (Public/Unlisted)
7. Submit for review (typically 1-3 business days)

### Step 6: Monitor Review Status
- Check email for review updates
- Address any rejection reasons promptly
- Once approved, extension goes live automatically

---

## 📝 Notes

- **Version Numbering**: Consider bumping to `1.0.0` for first public release (instead of `0.1.0`)
- **Review Time**: Typically 1-3 business days, but can take up to 7 days
- **Rejection Reasons**: Common issues include missing privacy policy, unclear permissions, or policy violations
- **Updates**: After approval, updates typically review faster (same day to 24 hours)
- **Pricing**: This extension is free. No monetization or in-app purchases.
