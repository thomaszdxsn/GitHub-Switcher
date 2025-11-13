import type { GeneratedToolLink, MenuPosition } from '../lib/types';

/**
 * ToolDropdown component - renders the dropdown menu with tool links
 * Native DOM implementation (no React)
 */

export class ToolDropdown {
  private menuContainer: HTMLDivElement | null = null;
  private menu: HTMLUListElement | null = null;
  private onCloseCallback: (() => void) | null = null;

  /**
   * Creates the dropdown menu element
   */
  private createMenu(toolLinks: GeneratedToolLink[]): HTMLUListElement {
    const menu = document.createElement('ul');
    menu.className = '__github-switcher-dropdown-menu';
    menu.id = '__github-switcher-menu';

    // ARIA attributes for accessibility
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Third-party tools');

    toolLinks
      .filter((link) => link.enabled)
      .forEach((link) => {
        const li = document.createElement('li');
        li.className = '__github-switcher-menu-item';
        li.setAttribute('role', 'none');

        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = '__github-switcher-menu-link';
        anchor.textContent = link.tool.name;
        anchor.setAttribute('role', 'menuitem');
        anchor.setAttribute('tabindex', '0');

        // Add note if present
        if (link.tool.note) {
          const note = document.createElement('span');
          note.className = '__github-switcher-menu-note';
          note.textContent = ` (${link.tool.note})`;
          anchor.appendChild(note);
        }

        li.appendChild(anchor);
        menu.appendChild(li);
      });

    return menu;
  }

  /**
   * Injects CSS styles into document head
   */
  private injectStyles(): void {
    // Check if styles already injected
    if (document.getElementById('__github-switcher-dropdown-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = '__github-switcher-dropdown-styles';
    style.textContent = `
      .__github-switcher-dropdown-menu {
        position: fixed;
        background: #ffffff;
        border: 1px solid #d0d7de;
        border-radius: 8px;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
        list-style: none;
        margin: 0;
        padding: 8px 0;
        min-width: 220px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      
      /* 小三角形指示器 - 指向左侧按钮 */
      .__github-switcher-dropdown-menu::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 20px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 8px solid #d0d7de;
      }
      
      .__github-switcher-dropdown-menu::after {
        content: '';
        position: absolute;
        left: -7px;
        top: 20px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 8px solid #ffffff;
      }

      .__github-switcher-menu-item {
        margin: 0;
        padding: 0;
      }

      .__github-switcher-menu-link {
        display: block;
        padding: 10px 16px;
        color: #24292f;
        text-decoration: none;
        font-size: 14px;
        transition: background-color 0.1s ease;
      }

      .__github-switcher-menu-link:hover {
        background-color: #f6f8fa;
      }

      .__github-switcher-menu-link:active {
        background-color: #eaeef2;
      }

      .__github-switcher-menu-note {
        color: #656d76;
        font-size: 12px;
        font-style: italic;
      }

      @media (prefers-color-scheme: dark) {
        .__github-switcher-dropdown-menu {
          background: #22272e;
          border-color: #444c56;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.5);
        }
        
        .__github-switcher-dropdown-menu::before {
          border-right-color: #444c56;
        }
        
        .__github-switcher-dropdown-menu::after {
          border-right-color: #22272e;
        }

        .__github-switcher-menu-link {
          color: #adbac7;
        }

        .__github-switcher-menu-link:hover {
          background-color: #2d333b;
        }

        .__github-switcher-menu-link:active {
          background-color: #373e47;
        }

        .__github-switcher-menu-note {
          color: #768390;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Sets the callback function to be called when menu should close
   */
  public onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  /**
   * Shows the dropdown menu at the specified position
   */
  public show(toolLinks: GeneratedToolLink[], position: MenuPosition): void {
    if (this.menuContainer) {
      // Already showing, just update position
      if (this.menu) {
        this.menu.style.top = `${position.top}px`;
        this.menu.style.left = `${position.left}px`;
      }
      return;
    }

    this.injectStyles();

    this.menu = this.createMenu(toolLinks);

    // Apply position directly to menu element
    this.menu.style.top = `${position.top}px`;
    this.menu.style.left = `${position.left}px`;

    // Use menu as container (no wrapper div needed)
    this.menuContainer = this.menu as unknown as HTMLDivElement;
    document.body.appendChild(this.menu);

    // Add click handler to close menu when clicking a tool
    this.menu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        // Link clicked, close menu
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
      }
    });

    // Add outside click handler
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  /**
   * Handles clicks outside the menu to close it
   */
  private handleOutsideClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;

    // Check if click is outside menu and button
    if (
      this.menuContainer &&
      !this.menuContainer.contains(target) &&
      !target.closest('.__github-switcher-button')
    ) {
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    }
  };

  /**
   * Hides the dropdown menu
   */
  public hide(): void {
    if (this.menu?.parentNode) {
      this.menu.parentNode.removeChild(this.menu);
    }
    this.menuContainer = null;
    this.menu = null;

    // Remove outside click handler
    document.removeEventListener('click', this.handleOutsideClick);
  }

  /**
   * Unmounts the dropdown from the DOM
   */
  public unmount(): void {
    this.hide();
  }

  /**
   * Checks if the menu is currently visible
   */
  public isVisible(): boolean {
    return this.menuContainer !== null;
  }

  /**
   * Gets the menu container element (for position updates)
   */
  public getMenuElement(): HTMLDivElement | null {
    return this.menu as unknown as HTMLDivElement;
  }
}
