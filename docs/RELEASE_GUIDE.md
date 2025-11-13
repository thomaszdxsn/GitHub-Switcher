# Release Guide

Complete guide for releasing GitHub-Switcher to Chrome Web Store and creating GitHub releases.

## Prerequisites

### One-Time Setup

1. **Chrome Web Store Developer Account** ($5 one-time fee)
   - Sign up at: https://chrome.google.com/webstore/devconsole
   - Verify email and enable 2FA
   - Pay $5 registration fee

2. **GitHub Pages (for Privacy Policy)**
   - Go to repo Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, folder: `/docs`
   - Save and wait for deployment (~2 minutes)
   - Verify at: https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html

3. **Store Assets** (see `assets/store/README.md`)
   - [ ] 3-5 screenshots (1280×800 PNG)
   - [ ] Small promo tile (440×280 PNG)
   - [ ] Large promo tile (920×680 PNG, optional)

---

## Release Process

### Option A: Automated Release (Recommended)

Use this workflow for v1.0.0 and all future releases.

#### Step 1: Prepare Release

```bash
# Ensure you're on main branch with latest changes
git checkout main
git pull origin main

# Update version in package.json
# Example: 0.1.0 → 1.0.0
npm version 1.0.0 --no-git-tag-version

# Verify CHANGELOG.md has entry for [1.0.0]
# Should have release date and changes listed

# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.0"
git push origin main
```

#### Step 2: Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tag to trigger GitHub Actions
git push origin v1.0.0
```

**What happens next:**
1. GitHub Actions workflow (`.github/workflows/release.yml`) triggers
2. Runs full CI pipeline (lint, typecheck, test, build)
3. Creates ZIP archive from `build/chrome-mv3-prod/`
4. Extracts changelog for v1.0.0
5. Creates GitHub Release with:
   - Tag: v1.0.0
   - Title: Auto-generated from tag
   - Body: Changelog excerpt + auto-generated notes
   - Attachment: `github-switcher-v1.0.0.zip`

#### Step 3: Verify GitHub Release

1. Go to: https://github.com/thomaszdxsn/GitHub-Switcher/releases
2. Check release was created successfully
3. Download ZIP and verify contents

#### Step 4: Submit to Chrome Web Store

**Manual submission required** (Chrome Web Store API is complex and not recommended for initial releases).

1. Log in to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item" (or select existing extension for updates)
3. Upload `github-switcher-v1.0.0.zip` from GitHub Release
4. Fill in store listing (see below)
5. Submit for review

---

### Option B: Manual Release (Fallback)

Use this if GitHub Actions fails or for testing.

#### Step 1: Build Production Bundle

```bash
# Ensure clean working directory
git status

# Build extension
pnpm build

# Verify build output
ls -lh build/chrome-mv3-prod/
```

#### Step 2: Create ZIP Archive

```bash
cd build/chrome-mv3-prod/
zip -r ../../github-switcher-v1.0.0.zip .
cd ../..

# Verify ZIP contents
unzip -l github-switcher-v1.0.0.zip
```

#### Step 3: Create GitHub Release Manually

1. Go to: https://github.com/thomaszdxsn/GitHub-Switcher/releases/new
2. Choose or create tag: `v1.0.0`
3. Release title: `v1.0.0` or `Release v1.0.0`
4. Description: Copy from `CHANGELOG.md` [1.0.0] section
5. Attach: `github-switcher-v1.0.0.zip`
6. Click "Publish release"

#### Step 4: Submit to Chrome Web Store

Same as Option A, Step 4.

---

## Chrome Web Store Submission

### First-Time Submission

#### 1. Basic Information

- **Extension name**: `GitHub Switcher - Developer Tools Launcher` (43 chars)
- **Short description**: 
  ```
  Quick access to 8 developer tools for GitHub repos. Open any repo in GitHub.dev, CodeSandbox, StackBlitz, nbviewer, and more.
  ```
  (131 chars)
- **Category**: Developer Tools
- **Language**: English

#### 2. Detailed Description

Copy from `docs/STORE_LISTING.md` (the markdown content, not including metadata).

Key points to include:
- Feature list (8 tools)
- Why use GitHub Switcher (benefits)
- Privacy & permissions explanation
- Open source links

#### 3. Store Assets

Upload from `assets/store/`:
- **Small promo tile** (440×280): Required
- **Large promo tile** (920×680): Optional but recommended
- **Screenshots** (1280×800): 3-5 images
  1. Sidebar button on GitHub page
  2. Dropdown menu open
  3. GitHub.dev in action
  4. nbviewer in action
  5. Menu positioning (optional)

#### 4. Privacy Practices

- **Privacy policy URL**: `https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html`
- **Data usage**: Select "No" for all data collection questions
  - Does NOT collect user data
  - Does NOT transmit data
  - Does NOT use data for purposes unrelated to the extension's functionality

**Justification for permissions:**
```
Host Permission (https://github.com/*/*):
Used to inject a sidebar button on GitHub repository pages. The extension reads the current URL to extract repository owner/name for generating tool links. No data is transmitted to external servers.

Storage Permission:
Used to save user preferences (e.g., which tools to show in the dropdown menu) locally in the browser using chrome.storage.sync API. If Chrome Sync is enabled, preferences sync across user's Chrome instances via Chrome's built-in sync mechanism.
```

#### 5. Distribution

- **Visibility**: Public
- **Regions**: All regions (default)
- **Pricing**: Free

#### 6. Review & Submit

- Preview listing to check formatting
- Submit for review
- Monitor email for review status (typically 1-3 business days)

---

### Update Submission (v1.1.0+)

For subsequent releases after v1.0.0 is approved:

#### Quick Update Process

1. **Prepare release** (same as above)
2. **Create tag and trigger GitHub Actions**
3. **Download ZIP from GitHub Release**
4. **Update extension in Chrome Web Store**:
   - Go to Developer Dashboard
   - Select "GitHub Switcher"
   - Click "Package" tab
   - Upload new ZIP
   - Update "What's new in this version" with changelog
   - Submit for review (typically faster: same day to 24 hours)

**What to update:**
- ✅ ZIP package (always)
- ✅ "What's new" section (always)
- ⚠️ Screenshots (only if UI changed significantly)
- ⚠️ Description (only if features changed)
- ❌ Privacy policy (only if permissions changed)

---

## Hotfix Release Process

For urgent bug fixes:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/v1.0.1 v1.0.0

# Fix the bug
# ... make changes ...

# Commit fix
git add .
git commit -m "fix: critical bug description"

# Update version
npm version patch --no-git-tag-version  # 1.0.0 → 1.0.1

# Update CHANGELOG.md with [1.0.1] section

# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"

# Merge to main
git checkout main
git merge hotfix/v1.0.1
git push origin main

# Create and push tag
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1

# Delete hotfix branch
git branch -d hotfix/v1.0.1
```

---

## Troubleshooting

### GitHub Actions Release Fails

**Symptoms**: Workflow runs but fails at build or test step.

**Solutions**:
1. Check workflow logs in Actions tab
2. Run locally: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
3. Fix errors and push fix commit
4. Delete and recreate tag:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

### Chrome Web Store Rejects Submission

**Common rejection reasons:**

1. **Missing Privacy Policy**
   - Verify URL is accessible: https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html
   - Check GitHub Pages is deployed and live

2. **Unclear Permission Justification**
   - Add detailed explanation in "Justification" field (see template above)
   - Explain each permission clearly

3. **Misleading Screenshots**
   - Ensure screenshots show actual extension functionality
   - Don't show features that don't exist
   - Update screenshots if UI changed

4. **Policy Violations**
   - Review [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
   - Common issues: spam, deceptive behavior, keyword stuffing
   - Our extension should NOT have these issues

**Response to rejection:**
1. Read rejection email carefully
2. Address each issue mentioned
3. Update relevant sections
4. Resubmit with explanation of changes

### Version Tag Already Exists

**Symptoms**: `git push origin v1.0.0` fails with "tag already exists".

**Solution:**
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Recreate tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### ZIP File Too Large

**Symptoms**: Chrome Web Store rejects ZIP >20MB.

**Solutions**:
1. Check bundle size: `du -sh build/chrome-mv3-prod/`
2. Our bundle is ~40KB total, should never exceed 1MB
3. If large, check for accidentally included files:
   ```bash
   unzip -l github-switcher-v1.0.0.zip
   ```
4. Verify only built files are included (no source maps, node_modules, etc.)

---

## Post-Release Checklist

After successful Chrome Web Store approval:

- [ ] Extension is live and installable
- [ ] Test installation from store
- [ ] Update README.md with Chrome Web Store link
- [ ] Announce release on GitHub Discussions
- [ ] Share on Twitter/social media (optional)
- [ ] Monitor GitHub Issues for bug reports
- [ ] Monitor Chrome Web Store reviews
- [ ] Plan next release (features, fixes)

---

## Version Numbering Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes, major features
  - Example: v2.0.0 - Complete UI redesign
- **Minor (1.X.0)**: New features, backward compatible
  - Example: v1.1.0 - Add custom tool configuration
- **Patch (1.0.X)**: Bug fixes, no new features
  - Example: v1.0.1 - Fix menu positioning bug

**Version commands:**
```bash
npm version major  # 1.0.0 → 2.0.0
npm version minor  # 1.0.0 → 1.1.0
npm version patch  # 1.0.0 → 1.0.1
```

---

## Release Cadence

**Recommended schedule:**

- **Major releases**: Every 6-12 months (or when breaking changes needed)
- **Minor releases**: Every 1-2 months (new features)
- **Patch releases**: As needed (bug fixes, typically within 1-2 weeks of major/minor)

**Pre-release versions** (optional):
- Beta: `1.1.0-beta.1` (test new features)
- RC: `1.1.0-rc.1` (release candidate, final testing)

---

## Contact & Support

- **GitHub Issues**: https://github.com/thomaszdxsn/GitHub-Switcher/issues
- **Chrome Web Store Support**: [Developer Support](https://support.google.com/chrome_webstore/contact/developer_support)
- **Email**: thomaszdxsn@gmail.com (if configured)

---

## References

- [Chrome Web Store Publish](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions: Creating Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
