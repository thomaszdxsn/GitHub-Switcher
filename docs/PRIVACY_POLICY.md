# Privacy Policy for GitHub-Switcher

**Last updated**: November 13, 2025

## Overview

GitHub-Switcher is committed to protecting your privacy. This extension operates entirely within your browser and does **NOT** collect, transmit, or share any personal data with external servers.

## Data Collection

**We do NOT collect any data.** All processing happens locally in your browser.

## Permissions Explained

### `https://github.com/*/*` (Host Permission)

**Why we need it**: To inject the sidebar button and dropdown menu on GitHub repository pages.

**What we access**: 
- The extension reads the current GitHub URL to determine which repository you're viewing (e.g., `owner/repo`)
- This information is used solely to generate tool links (e.g., `https://github.dev/owner/repo`)
- **No data is sent to external servers or stored remotely**

### `storage` (Storage Permission)

**Why we need it**: To save your preferences locally in your browser.

**What we store**:
- UI preferences (e.g., which tools to show in the dropdown menu)
- User settings (e.g., whether to open tools in new tabs)
- All data is stored using Chrome's `chrome.storage.sync` API

**Sync behavior**:
- If you're signed in to Chrome, your preferences will sync across your Chrome instances
- This sync is handled entirely by Chrome itself, not by our extension
- You can disable Chrome sync in Chrome settings if you prefer local-only storage

## Third-Party Services

When you click a tool link in the dropdown menu, you will be redirected to a third-party service. Each service has its own privacy policy:

- **GitHub.dev**: [Microsoft Privacy Policy](https://privacy.microsoft.com/en-us/privacystatement)
- **DeepWiki**: [DeepWiki Privacy Policy](https://deepwiki.com/privacy)
- **CodeSandbox**: [CodeSandbox Privacy Policy](https://codesandbox.io/legal/privacy)
- **StackBlitz**: [StackBlitz Privacy Policy](https://stackblitz.com/privacy-policy)
- **nbviewer**: [nbviewer Privacy Policy](https://github.com/jupyter/nbviewer)
- **gitdiagram**: [gitdiagram Privacy Policy](https://gitdiagram.com/privacy)
- **gitingest**: [gitingest Privacy Policy](https://gitingest.com/privacy)
- **githistory**: [githistory Privacy Policy](https://github.githistory.xyz/privacy)

**We do not control or take responsibility for these third-party services.** Please review their privacy policies before using them.

## Data Security

Since we don't collect or transmit any data, there is no data to secure on our servers. Your preferences are stored locally in your browser using Chrome's secure storage API.

## Children's Privacy

This extension does not knowingly collect any information from children under 13 years of age. The extension is designed for developers and GitHub users.

## Changes to This Policy

We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. Check the "Last updated" date at the top of this document.

## Open Source

This extension is open source. You can review the code to verify our privacy claims:
- **GitHub Repository**: [https://github.com/thomaszdxsn/GitHub-Switcher](https://github.com/thomaszdxsn/GitHub-Switcher)
- **License**: MIT (see [LICENSE](https://github.com/thomaszdxsn/GitHub-Switcher/blob/main/LICENSE))

## Contact

If you have questions about this privacy policy or the extension's privacy practices:

- **Open an issue**: [GitHub Issues](https://github.com/thomaszdxsn/GitHub-Switcher/issues)
- **Email**: thomaszdxsn@gmail.com (if provided)

## Your Rights

Depending on your location, you may have certain rights regarding your data:

- **Right to access**: You can view your preferences in Chrome's extension storage (developer tools)
- **Right to deletion**: You can clear your preferences by uninstalling the extension or clearing Chrome storage
- **Right to opt-out**: You can disable specific permissions in Chrome's extension settings

Since we don't collect data, these rights primarily relate to data stored locally in your browser.

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Consent

By installing and using this extension, you consent to this privacy policy.
