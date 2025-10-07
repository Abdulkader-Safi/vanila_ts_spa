// Component.ts - Base class for reusable components

export interface ComponentProps {
  [key: string]: unknown;
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
   * Helper method to create an element with attributes and children
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
   * Simplified element builder with JSX-like syntax
   */
  protected h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props?: {
      class?: string;
      style?: Partial<CSSStyleDeclaration>;
      attrs?: Record<string, string>;
      on?: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;
    } | null,
    ...children: (HTMLElement | string | number | null | undefined)[]
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (props) {
      // Handle className
      if (props.class) {
        element.className = props.class;
      }

      // Handle inline styles
      if (props.style) {
        Object.assign(element.style, props.style);
      }

      // Handle custom attributes
      if (props.attrs) {
        for (const [key, value] of Object.entries(props.attrs)) {
          element.setAttribute(key, value);
        }
      }

      // Handle event listeners with auto-cleanup
      if (props.on) {
        for (const [event, handler] of Object.entries(props.on)) {
          if (handler) {
            this.addEventListener(element, event as keyof HTMLElementEventMap, handler);
          }
        }
      }
    }

    // Append children (filter out null/undefined)
    for (const child of children) {
      if (child == null) continue;

      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(document.createTextNode(child.toString()));
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

// Simplified component creation using factory function
type RenderFn<P extends ComponentProps = ComponentProps> = (props: P, ctx: ComponentContext) => HTMLElement;

interface ComponentContext {
  h: <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props?: {
      class?: string;
      style?: Partial<CSSStyleDeclaration>;
      attrs?: Record<string, string>;
      on?: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;
    } | null,
    ...children: (HTMLElement | string | number | null | undefined)[]
  ) => HTMLElementTagNameMap[K];
  onCleanup: (fn: () => void) => void;
  onMount?: (fn: () => void) => void;
}

/**
 * Create a component using a simple render function
 * This is easier than extending the Component class for simple components
 *
 * @example
 * const MyButton = createComponent<{ label: string }>((props, { h }) => {
 *   return h('button', { class: 'btn', on: { click: () => alert('Clicked!') } }, props.label);
 * });
 */
export function createComponent<P extends ComponentProps = ComponentProps>(
  renderFn: RenderFn<P>
): new (props: P) => Component<P> {
  return class extends Component<P> {
    private mountCallback?: () => void;

    render(): HTMLElement {
      const ctx: ComponentContext = {
        h: this.h.bind(this),
        onCleanup: this.onCleanup.bind(this),
        onMount: (fn: () => void) => {
          this.mountCallback = fn;
        },
      };

      return renderFn(this.props, ctx);
    }

    protected mount(): void {
      if (this.mountCallback) {
        this.mountCallback();
      }
    }
  };
}
