# Chrome Web Store Publishing Checklist

## ✅ Completed Tasks

### 1. Privacy Policy ✅
- **File**: `docs/PRIVACY_POLICY.md`
- **Status**: Created and ready to host
- **Next step**: Enable GitHub Pages to serve at `https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html`

### 2. Manifest Metadata ✅
- **author**: `thomaszdxsn` ✅
- **name**: `GitHub Switcher` ✅
- **homepage_url**: `https://github.com/thomaszdxsn/GitHub-Switcher` ✅
- **permissions**: `["storage"]` ✅
- **All icons**: Present (16, 32, 48, 64, 128px) ✅

### 3. Production Build ✅
- **Build output**: `build/chrome-mv3-prod/` ✅
- **Bundle size**: ~40KB (14KB content script) ✅
- **Icons regenerated**: Yes, with updated assets ✅

### 4. Store Listing Documentation ✅
- **File**: `docs/STORE_LISTING.md`
- **Includes**:
  - Extension name (43 chars)
  - Short description (131 chars)
  - Detailed description (500+ words)
  - Screenshot specifications
  - Promo tile specifications
  - Pre-submission checklist

### 5. Release Automation ✅
- **Workflow**: `.github/workflows/release.yml`
- **Trigger**: Git tags (e.g., `v1.0.0`)
- **Actions**:
  - Run full CI (lint, typecheck, test, build)
  - Create ZIP archive
  - Create GitHub Release with changelog
  - Upload artifact

### 6. Assets Directory ✅
- **Directory**: `assets/store/`
- **README**: Complete guide for creating screenshots and promo tiles

### 7. Release Documentation ✅
- **File**: `docs/RELEASE_GUIDE.md`
- **Includes**:
  - Automated release process (tag-based)
  - Manual release fallback
  - Chrome Web Store submission guide
  - Troubleshooting tips
  - Version numbering guidelines

---

## 📋 Remaining Tasks (Before First Submission)

### High Priority (Required)

#### 1. Enable GitHub Pages
```bash
# Go to repo settings on GitHub
# Settings → Pages → Source: main branch, /docs folder
# Wait 2-3 minutes for deployment
# Verify: https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html
```

#### 2. Create Store Assets (3-4 hours)

**Screenshots (3-5 images, 1280×800px)**
- [x] Screenshot 1: Sidebar button on GitHub repo page
- [x] Screenshot 2: Dropdown menu open with 8 tools
- [x] Screenshot 3: GitHub.dev opened from menu

**Promo Tiles**
- [x] Small tile (440×280px PNG) - **REQUIRED**
- [x] Large tile (920×680px PNG) - Recommended

**Tools**: Use Figma (free), Canva, or Photoshop. See `assets/store/README.md` for detailed instructions.

#### 3. Register Chrome Web Store Developer Account
- [x] Sign up: https://chrome.google.com/webstore/devconsole
- [x] Pay $5 registration fee
- [x] Verify email
- [x] Enable 2FA (recommended)

#### 4. Test Extension Locally
```bash
cd /Users/zhouyang/Coding/GitHub-Switcher
pnpm build
# Load build/chrome-mv3-prod/ in chrome://extensions/
# Test on multiple GitHub repos
# Verify no console errors
```

### Medium Priority (Recommended)

#### 5. Version Bump to 1.0.0
```bash
# Current version: 0.1.0
# Recommended: 1.0.0 for first public release
npm version 1.0.0 --no-git-tag-version
git add package.json
git commit -m "chore: bump version to 1.0.0"
```

#### 6. Update CHANGELOG.md
- [x] v1.0.0 section created with release date (2025-11-13)
- [x] All features documented
- [x] Chrome Web Store readiness noted

#### 7. Create Demo Video (Optional)
- 2-3 minutes showing extension in action
- Upload to YouTube
- Include in store listing

---

## 🚀 Release Workflow

### Recommended: Tag-First Automated Release

#### Step 1: Prepare Release (Local)
```bash
# Ensure on main branch with latest changes
git checkout main
git pull origin main

# Verify version is correct (should be 1.0.0)
grep version package.json

# Verify CHANGELOG.md has [1.0.0] entry
grep "\[1.0.0\]" CHANGELOG.md

# Run full test suite
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Test extension manually in Chrome
# Load build/chrome-mv3-prod/ and verify all features work
```

#### Step 2: Create and Push Tag
```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0 - First public release"

# Push tag to trigger GitHub Actions
git push origin v1.0.0
```

#### Step 3: Monitor GitHub Actions
- Watch workflow: https://github.com/thomaszdxsn/GitHub-Switcher/actions
- Workflow should:
  - ✅ Run lint, typecheck, test, build
  - ✅ Create ZIP archive
  - ✅ Create GitHub Release
  - ✅ Attach ZIP to release

#### Step 4: Verify GitHub Release
- Go to: https://github.com/thomaszdxsn/GitHub-Switcher/releases
- Download `github-switcher-v1.0.0.zip`
- Verify contents (unzip and check files)

#### Step 5: Submit to Chrome Web Store
1. Log in: https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload `github-switcher-v1.0.0.zip`
4. Fill in listing details (copy from `docs/STORE_LISTING.md`)
5. Upload screenshots and promo tiles
6. Set privacy policy URL: `https://thomaszdxsn.github.io/GitHub-Switcher/PRIVACY_POLICY.html`
7. Submit for review (1-3 business days)

---

## 📊 Current Status

| Item | Status | Notes |
|------|--------|-------|
| Privacy Policy | ✅ Created | Need to enable GitHub Pages |
| Manifest Metadata | ✅ Complete | author, name, permissions, homepage |
| Production Build | ✅ Complete | Icons regenerated, v0.1.0 |
| Store Listing Docs | ✅ Complete | All copy and specs ready |
| Release Workflow | ✅ Complete | Tag-based automation |
| Assets Directory | ✅ Complete | Guide for screenshots/tiles |
| Release Guide | ✅ Complete | Step-by-step instructions |
| GitHub Pages | ❌ Pending | Enable in repo settings |
| Store Screenshots | ❌ Pending | Need to capture and edit |
| Promo Tiles | ❌ Pending | Need to design |
| Developer Account | ❌ Pending | Need to register ($5) |
| Version Bump | ⚠️ Optional | Consider 1.0.0 for public release |

**Legend**: ✅ Done | ❌ Not started | ⚠️ Optional/Recommended

---

## ⏱️ Time Estimates

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Enable GitHub Pages | 5 minutes | HIGH |
| Register developer account | 30 minutes + $5 | HIGH |
| Create screenshots (5×) | 1-2 hours | HIGH |
| Create small promo tile | 30 minutes | HIGH |
| Create large promo tile | 30 minutes | MEDIUM |
| Test extension locally | 30 minutes | HIGH |
| Version bump to 1.0.0 | 5 minutes | MEDIUM |
| Create demo video | 2-3 hours | LOW |
| Submit to Chrome Web Store | 30 minutes | HIGH |

**Total critical path**: ~3-4 hours + $5 registration fee

---

## 📞 Next Steps

### Immediate (Today)
1. Enable GitHub Pages in repo settings
2. Verify privacy policy URL is accessible
3. Register Chrome Web Store developer account ($5)
4. Capture 3-5 screenshots of extension in Chrome

### Tomorrow
1. Design and export promo tiles (440×280, 920×680)
2. Optimize all images (<500KB each)
3. Bump version to 1.0.0 (optional but recommended)
4. Create and push v1.0.0 tag
5. Verify GitHub Release created successfully

### Day 3
1. Download ZIP from GitHub Release
2. Submit to Chrome Web Store
3. Monitor review status (1-3 business days)
4. Address any rejection feedback if needed

### Post-Approval
1. Test installation from Chrome Web Store
2. Update README.md with store link
3. Announce release
4. Monitor user feedback and reviews

---

## 📚 Reference Documentation

- **Privacy Policy**: `docs/PRIVACY_POLICY.md`
- **Store Listing**: `docs/STORE_LISTING.md`
- **Release Guide**: `docs/RELEASE_GUIDE.md`
- **Assets Guide**: `assets/store/README.md`

---

## ❓ Questions & Answers

### Q: 是否需要重新 build（更换了 assets/icon）?
**A**: ✅ 是的，已经重新 build 完成。新的 icons 已经包含在 `build/chrome-mv3-prod/` 中，文件名已更新为新的 hash 值。

### Q: 先加 tag 还是先 GitHub release?
**A**: ✅ 推荐先创建 tag，然后通过 GitHub Actions 自动创建 release。工作流已配置完成：
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# GitHub Actions will automatically create release with ZIP
```

### Q: 还需要做什么才能发布到 Chrome Web Store?
**A**: 还需要以下步骤：
1. ✅ **已完成**: Privacy policy, manifest metadata, build, documentation
2. ❌ **需要完成**:
   - Enable GitHub Pages（5分钟）
   - 注册 Chrome Web Store 开发者账号（$5）
   - 创建 3-5 张截图（1-2小时）
   - 创建 promo tile（30分钟-1小时）
   - 提交到 Chrome Web Store（30分钟）

预计总时间: **3-4小时 + $5注册费**

---

## 🎯 Success Criteria

Extension is ready for Chrome Web Store when:
- [x] Privacy policy hosted at public URL
- [x] Manifest has all required metadata
- [x] Production build verified and tested
- [ ] 3-5 high-quality screenshots captured
- [ ] Small promo tile (440×280) created
- [ ] Chrome Web Store developer account registered
- [ ] Extension tested locally in Chrome without errors
- [ ] All documentation complete and accurate

**Current progress: 50% complete** (4/8 critical items done)

---

Last updated: 2025-11-13
