/**
 * SidebarButton component - renders the fixed-position sidebar button
 * Native DOM implementation (no React)
 */

export class SidebarButton {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private onToggleCallback: (() => void) | null = null;

  /**
   * Creates the container element for the button
   */
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = '__github-switcher-container';
    return container;
  }

  /**
   * Creates the button element
   */
  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = '__github-switcher-button';
    button.textContent = 'Switcher';
    button.type = 'button';

    // ARIA attributes for accessibility
    button.setAttribute('aria-label', 'Open third-party tools menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', '__github-switcher-menu');
    button.setAttribute('aria-haspopup', 'menu');

    return button;
  }

  /**
   * Injects CSS styles into document head
   */
  private injectStyles(): void {
    // Check if styles already injected
    if (document.getElementById('__github-switcher-button-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = '__github-switcher-button-styles';
    style.textContent = `
      .__github-switcher-container {
        position: fixed;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 9999;
      }

      .__github-switcher-button {
        width: 30px;
        padding: 12px 6px;
        background: #24292f;
        color: #ffffff;
        border: 1px solid #444d56;
        border-left: none;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        opacity: 0.6;
        transition: opacity 0.2s ease, background-color 0.2s ease;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      }

      .__github-switcher-button:hover {
        opacity: 1;
        background: #2d333b;
      }

      .__github-switcher-button:active {
        background: #373e47;
      }

      .__github-switcher-button:focus {
        outline: 2px solid #0969da;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Sets the callback function to be called when button is clicked
   */
  public onToggle(callback: () => void): void {
    this.onToggleCallback = callback;
  }

  /**
   * Mounts the button to the DOM
   */
  public mount(): void {
    if (this.container) {
      return;
    }

    this.injectStyles();
    this.container = this.createContainer();
    this.button = this.createButton();

    // Add click handler
    this.button.addEventListener('click', () => {
      if (this.onToggleCallback) {
        this.onToggleCallback();
      }
    });

    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  /**
   * Unmounts the button from the DOM
   */
  public unmount(): void {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.button = null;
  }

  /**
   * Gets the button element for positioning calculations
   */
  public getButtonElement(): HTMLButtonElement | null {
    return this.button;
  }

  /**
   * Updates button ARIA attributes for accessibility
   */
  public setExpanded(expanded: boolean): void {
    if (this.button) {
      this.button.setAttribute('aria-expanded', String(expanded));
    }
  }
}
