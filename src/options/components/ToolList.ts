import Sortable from 'sortablejs';
import { getToolDescription, TOOLS, type ToolEntry } from '../../lib/config';
import { getToolOrder } from '../../lib/optionsStateManager';
import type { UserPreferences } from '../../lib/types';

/**
 * Tool List Component
 * Renders the list of tools with drag handles, names, descriptions, and toggle switches
 */
export class ToolList {
  private container: HTMLElement | null = null;
  private currentPreferences: UserPreferences | null = null;
  private onToggleCallback: ((toolId: number, enabled: boolean) => void) | null = null;
  private onDragEndCallback: ((newOrder: number[]) => void) | null = null;
  private sortableInstance: Sortable | null = null;

  /**
   * Mounts the component to the DOM
   * @param containerElement - Container element to render into
   * @param preferences - User preferences
   */
  public mount(containerElement: HTMLElement, preferences: UserPreferences): void {
    this.container = containerElement;
    this.currentPreferences = preferences;
    this.render();
    this.initializeSortable();
  }

  /**
   * Updates the component with new preferences
   * @param preferences - Updated user preferences
   */
  public update(preferences: UserPreferences): void {
    this.currentPreferences = preferences;
    this.render();
    this.initializeSortable(); // Re-initialize after re-render
  }

  /**
   * Sets the callback for toggle events
   * @param callback - Function to call when a tool is toggled
   */
  public onToggle(callback: (toolId: number, enabled: boolean) => void): void {
    this.onToggleCallback = callback;
  }

  /**
   * Sets the callback for drag end events
   * @param callback - Function to call when drag order changes
   */
  public onDragEnd(callback: (newOrder: number[]) => void): void {
    this.onDragEndCallback = callback;
  }

  /**
   * Renders the tool list
   */
  private render(): void {
    if (!this.container || !this.currentPreferences) {
      return;
    }

    // Clear container
    this.container.innerHTML = '';

    // Get tool order
    const toolOrder = getToolOrder(this.currentPreferences);

    // Render tools in order
    for (const toolId of toolOrder) {
      const tool = TOOLS.find((t) => t.order === toolId);
      if (!tool) continue;

      const toolItem = this.createToolItem(tool, this.currentPreferences);
      this.container.appendChild(toolItem);
    }
  }

  /**
   * Initializes SortableJS for drag & drop functionality
   */
  private initializeSortable(): void {
    if (!this.container) return;

    // Destroy previous instance if exists
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
      this.sortableInstance = null;
    }

    // Create new Sortable instance
    this.sortableInstance = new Sortable(this.container, {
      handle: '.__github-switcher-tool-drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: (_evt) => {
        // Extract new order from DOM
        const newOrder: number[] = [];
        const items = this.container?.querySelectorAll('.__github-switcher-tool-item');

        items?.forEach((item) => {
          const toolId = Number.parseInt((item as HTMLElement).dataset.toolId || '0', 10);
          if (toolId > 0) {
            newOrder.push(toolId);
          }
        });

        // Call callback if provided
        if (this.onDragEndCallback && newOrder.length === 9) {
          this.onDragEndCallback(newOrder);
        }
      },
    });
  }

  /**
   * Creates a single tool item element
   */
  private createToolItem(tool: ToolEntry, preferences: UserPreferences): HTMLElement {
    const item = document.createElement('div');
    item.className = '__github-switcher-tool-item';
    item.dataset.toolId = String(tool.order);

    // Drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = '__github-switcher-tool-drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.setAttribute('aria-label', 'Drag to reorder');
    item.appendChild(dragHandle);

    // Tool icon
    const icon = document.createElement('img');
    icon.className = '__github-switcher-tool-icon';
    icon.src = chrome.runtime.getURL(`assets/${tool.iconPath}`);
    icon.alt = `${tool.name} icon`;
    item.appendChild(icon);

    // Tool info container
    const infoContainer = document.createElement('div');
    infoContainer.className = '__github-switcher-tool-info';

    // Tool name
    const nameElement = document.createElement('h3');
    nameElement.className = '__github-switcher-tool-name';
    nameElement.textContent = tool.name;
    infoContainer.appendChild(nameElement);

    // Tool description
    const description = getToolDescription(tool.order);
    const descElement = document.createElement('p');
    descElement.className = '__github-switcher-tool-description';
    descElement.textContent = description;
    infoContainer.appendChild(descElement);

    item.appendChild(infoContainer);

    // Toggle switch
    const toggleLabel = document.createElement('label');
    toggleLabel.className = '__github-switcher-tool-toggle';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = preferences.enabledTools.includes(tool.order);
    toggleInput.setAttribute('aria-label', `Enable/disable ${tool.name}`);

    // Disable toggle if it's the last enabled tool
    if (preferences.enabledTools.length === 1 && preferences.enabledTools.includes(tool.order)) {
      toggleInput.disabled = true;
      toggleInput.title = 'At least one tool must remain enabled';
    }

    toggleInput.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      if (this.onToggleCallback) {
        this.onToggleCallback(tool.order, enabled);
      }
    });

    const toggleSlider = document.createElement('span');
    toggleSlider.className = '__github-switcher-tool-toggle-slider';

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSlider);
    item.appendChild(toggleLabel);

    return item;
  }

  /**
   * Unmounts the component
   */
  public unmount(): void {
    // Destroy Sortable instance
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
      this.sortableInstance = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
    this.container = null;
    this.currentPreferences = null;
    this.onToggleCallback = null;
    this.onDragEndCallback = null;
  }
}
