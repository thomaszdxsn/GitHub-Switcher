# Manual Testing Guide - File-Path-Aware Tools Feature

## Pre-requisites
- Chrome/Edge/Brave browser
- Extension loaded in developer mode
- Test GitHub repository with various file types

## Test Scenarios

### T040-T043: User Story 1 - githistory Tool

#### T040: githistory Enabled on File Pages
**Steps:**
1. Navigate to any GitHub file page (e.g., `github.com/microsoft/vscode/blob/main/README.md`)
2. Click the GitHub Switcher sidebar button
3. Verify githistory tool is visible and NOT grayed out
4. Check that githistory icon and text have full opacity

**Expected:**
- githistory tool is enabled (not disabled styling)
- Tool appears clickable

---

#### T041: githistory Click Opens Correct URL
**Steps:**
1. On file page `github.com/owner/repo/blob/main/src/index.ts`
2. Click githistory tool in dropdown
3. Verify new tab opens with URL: `github.githistory.xyz/owner/repo/blob/main/src/index.ts`

**Expected:**
- New tab opens
- URL matches pattern with correct owner, repo, ref, and file path

---

#### T041a: githistory Preserves Query/Hash
**Steps:**
1. Navigate to file with query params: `github.com/owner/repo/blob/main/README.md?plain=1#L20`
2. Click githistory tool
3. Verify URL includes `?plain=1#L20` at the end

**Expected:**
- Query parameters and hash preserved in target URL

---

#### T042: githistory Disabled on Repository Home
**Steps:**
1. Navigate to repo homepage (e.g., `github.com/microsoft/vscode`)
2. Click GitHub Switcher button
3. Find githistory tool in menu
4. Verify it's grayed out (opacity: 0.5)
5. Try clicking it - should not navigate

**Expected:**
- githistory has class `__github-switcher-menu-link--disabled`
- `aria-disabled="true"` attribute present
- Click does nothing (preventDefault works)

---

#### T043: githistory Disabled on Directory Pages
**Steps:**
1. Navigate to directory page (e.g., `github.com/microsoft/vscode/tree/main/src`)
2. Open dropdown menu
3. Verify githistory is disabled (grayed out)

**Expected:**
- Same disabled appearance as T042

---

### T046-T049: User Story 2 - nbviewer Tool

#### T046: nbviewer and githistory Both Enabled on .ipynb Files
**Steps:**
1. Navigate to Jupyter notebook file (e.g., `github.com/owner/repo/blob/main/example.ipynb`)
2. Open dropdown
3. Verify BOTH nbviewer AND githistory are enabled (not grayed out)

**Expected:**
- nbviewer: enabled
- githistory: enabled
- Both clickable

---

#### T047: nbviewer Click Opens Correct URL
**Steps:**
1. On .ipynb file page
2. Click nbviewer tool
3. Verify new tab with URL: `nbviewer.org/github/owner/repo/blob/main/example.ipynb`

**Expected:**
- Correct nbviewer URL format

---

#### T048: nbviewer Disabled on Non-.ipynb Files
**Steps:**
1. Navigate to markdown file (e.g., README.md)
2. Open dropdown
3. Verify nbviewer is disabled (grayed out)
4. Verify githistory is enabled (not grayed out)

**Expected:**
- nbviewer: disabled
- githistory: enabled

---

#### T049: nbviewer Works with Uppercase Extensions
**Steps:**
1. Create/find file with uppercase extension (e.g., `Example.IPYNB` or `Test.Ipynb`)
2. Open dropdown
3. Verify nbviewer is enabled

**Expected:**
- Extension matching is case-insensitive
- nbviewer enabled for .IPYNB, .Ipynb, .ipynb

---

## Test Report Template

```markdown
## Test Results - [Date]

### Browser: [Chrome/Edge/Brave] [Version]

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| T040 | githistory enabled on file page | ✅/❌ | |
| T041 | githistory correct URL | ✅/❌ | |
| T041a | githistory preserves query/hash | ✅/❌ | |
| T042 | githistory disabled on repo home | ✅/❌ | |
| T043 | githistory disabled on directory | ✅/❌ | |
| T046 | nbviewer + githistory on .ipynb | ✅/❌ | |
| T047 | nbviewer correct URL | ✅/❌ | |
| T048 | nbviewer disabled on .md | ✅/❌ | |
| T049 | nbviewer case-insensitive | ✅/❌ | |

### Issues Found
[List any issues or bugs discovered]

### Screenshots
[Attach screenshots if needed]
```

---

## Quick Verification Commands

After loading the extension:

1. **Open DevTools Console** - Check for errors:
   ```javascript
   // Should see: [GitHub Switcher] Repository detected: owner/repo
   // Or: [GitHub Switcher] File detected: owner/repo/blob/ref/filepath
   ```

2. **Inspect Menu Elements**:
   ```javascript
   // Check disabled state
   document.querySelectorAll('.__github-switcher-menu-link--disabled')
   // Should show disabled tools
   
   // Check ARIA attributes
   document.querySelector('a[aria-disabled="true"]')
   ```

3. **Test URL Generation** (in console on file page):
   ```javascript
   // This should match the clicked tool's destination
   console.log(window.location.href)
   ```
