// Component.ts - Base class for reusable components

export interface ComponentProps {
  [key: string]: any;
}

export abstract class Component<P extends ComponentProps = ComponentProps> {
  protected props: P;
  protected element: HTMLElement | null = null;
  protected cleanup: (() => void)[] = [];

  constructor(props: P) {
    this.props = props;
  }

  /**
   * Abstract render method - must be implemented by child classes
   * Returns the HTML element representing the component
   */
  abstract render(): HTMLElement;

  /**
   * Lifecycle method called after component is mounted to DOM
   * Use this for setting up event listeners, subscriptions, etc.
   */
  protected mount?(): void;

  /**
   * Lifecycle method called before component is removed from DOM
   * Use this for cleanup - removing listeners, unsubscribing, etc.
   */
  protected unmount?(): void;

  /**
   * Register a cleanup function to be called on unmount
   */
  protected onCleanup(fn: () => void): void {
    this.cleanup.push(fn);
  }

  /**
   * Initialize the component (render + mount)
   * Returns the rendered element
   */
  public init(): HTMLElement {
    this.element = this.render();

    // Add cleanup event listener
    this.element.addEventListener("cleanup", () => {
      this.destroy();
    });

    // Call mount lifecycle if defined
    if (this.mount) {
      this.mount();
    }

    return this.element;
  }

  /**
   * Destroy the component (cleanup + unmount)
   */
  public destroy(): void {
    // Call unmount lifecycle if defined
    if (this.unmount) {
      this.unmount();
    }

    // Run all registered cleanup functions
    for (const fn of this.cleanup) {
      fn();
    }
    this.cleanup = [];
  }

  /**
   * Update component props and re-render
   */
  public update(newProps: Partial<P>): void {
    this.props = { ...this.props, ...newProps };

    if (this.element?.parentNode) {
      const newElement = this.render();
      this.element.parentNode.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }

  /**
   * Helper method to create an element with attributes
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Record<string, string> = {},
    children: (HTMLElement | string)[] = []
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        element.className = value;
      } else if (key.startsWith("on") && typeof value === "function") {
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value as any);
      } else {
        element.setAttribute(key, value);
      }
    }

    // Append children
    for (const child of children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }

    return element;
  }

  /**
   * Helper to add event listener with automatic cleanup
   */
  protected addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    element.addEventListener(type, listener as EventListener);
    this.onCleanup(() => {
      element.removeEventListener(type, listener as EventListener);
    });
  }
}
