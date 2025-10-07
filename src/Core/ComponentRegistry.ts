// ComponentRegistry.ts - Global registry for reusable components

import type { Component, ComponentProps } from "./Component";

type ComponentConstructor<P extends ComponentProps = ComponentProps> = new (
  props: P
) => Component<P>;

class ComponentRegistry {
  private components: Map<string, ComponentConstructor<any>> = new Map();

  /**
   * Register a component with a custom tag name
   * @param tagName - Custom tag name (e.g., 'c-button', 'app-card')
   * @param componentClass - Component class constructor
   */
  register<P extends ComponentProps>(
    tagName: string,
    componentClass: ComponentConstructor<P>
  ): void {
    if (this.components.has(tagName)) {
      console.warn(
        `Component "${tagName}" is already registered. Overwriting...`
      );
    }
    this.components.set(tagName, componentClass);
  }

  /**
   * Check if a component is registered
   */
  has(tagName: string): boolean {
    return this.components.has(tagName);
  }

  /**
   * Get a component constructor by tag name
   */
  get<P extends ComponentProps>(
    tagName: string
  ): ComponentConstructor<P> | undefined {
    return this.components.get(tagName);
  }

  /**
   * Create a component instance with props
   */
  create<P extends ComponentProps>(
    tagName: string,
    props: P
  ): Component<P> | null {
    const ComponentClass = this.components.get(tagName);
    if (!ComponentClass) {
      console.error(`Component "${tagName}" is not registered`);
      return null;
    }
    return new ComponentClass(props);
  }

  /**
   * Parse attributes from a DOM element and convert to props
   */
  parseProps(element: Element): ComponentProps {
    const props: ComponentProps = {};

    // Parse all attributes
    for (const attr of Array.from(element.attributes)) {
      let value: any = attr.value;

      // Try to parse as JSON for complex types
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      // Parse boolean attributes
      else if (value === "true" || value === "false") {
        value = value === "true";
      }
      // Parse numbers
      else if (!Number.isNaN(Number(value)) && value !== "") {
        value = Number(value);
      }

      // Convert kebab-case to camelCase
      const propName = attr.name.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
      );
      props[propName] = value;
    }

    // Handle slot/children content
    if (element.innerHTML.trim()) {
      props.children = element.innerHTML;
    }

    return props;
  }

  /**
   * Render all registered components in a container
   */
  renderComponents(container: HTMLElement): void {
    // Find all custom component tags
    this.components.forEach((_, tagName) => {
      const elements = container.querySelectorAll(tagName);

      for (const element of elements) {
        const props = this.parseProps(element);
        const component = this.create(tagName, props);

        if (component) {
          const rendered = component.init();
          element.replaceWith(rendered);
        }
      }
    });
  }

  /**
   * Get all registered component tag names
   */
  getRegisteredTags(): string[] {
    return Array.from(this.components.keys());
  }
}

// Singleton instance
const registry = new ComponentRegistry();

/**
 * Register a component globally
 * @param tagName - Custom HTML tag name (must contain a hyphen, e.g., 'c-button')
 * @param componentClass - Component class
 */
export function registerComponent<P extends ComponentProps>(
  tagName: string,
  componentClass: ComponentConstructor<P>
): void {
  // Validate tag name format (must contain hyphen for custom elements)
  if (!tagName.includes("-")) {
    throw new Error(
      `Invalid component tag name "${tagName}". Custom element names must contain a hyphen (-).`
    );
  }

  registry.register(tagName, componentClass);
}

/**
 * Create and render a component instance
 */
export function createComponent<P extends ComponentProps>(
  tagName: string,
  props: P
): HTMLElement | null {
  const component = registry.create(tagName, props);
  return component ? component.init() : null;
}

export { registry };
