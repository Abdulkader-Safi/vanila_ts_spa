# Component Building Guide

This guide shows you how to easily build components using the improved component system.

## Two Ways to Create Components

### 1. Using `createComponent()` (Easiest - Recommended for Simple Components)

No need to extend a class! Just provide a render function:

```typescript
import { createComponent } from "./Core/Component";

interface MyButtonProps {
  label: string;
  onClick?: () => void;
}

export const MyButton = createComponent<MyButtonProps>(
  (props, { h, onCleanup, onMount }) => {
    return h(
      "button",
      {
        class: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
        on: {
          click: () => props.onClick?.(),
        },
      },
      props.label
    );
  }
);

// Use it:
const button = new MyButton({ label: "Click me", onClick: () => alert("Hi!") });
document.body.appendChild(button.init());
```

### 2. Extending Component Class (For Complex Components)

For components with state, lifecycle methods, or complex logic:

```typescript
import { Component } from "./Core/Component";
import { Store } from "./Core/Store";

interface CounterProps {
  initialValue?: number;
}

export class Counter extends Component<CounterProps> {
  private store: Store<number>;
  private countElement: HTMLSpanElement | null = null;

  constructor(props: CounterProps) {
    super(props);
    this.store = new Store(props.initialValue || 0);
  }

  render(): HTMLElement {
    this.countElement = this.h(
      "span",
      { class: "font-bold" },
      this.store.get()
    );

    return this.h(
      "div",
      { class: "flex gap-2" },
      this.h(
        "button",
        { on: { click: () => this.store.set(this.store.get() - 1) } },
        "-"
      ),
      this.countElement,
      this.h(
        "button",
        { on: { click: () => this.store.set(this.store.get() + 1) } },
        "+"
      )
    );
  }

  protected mount(): void {
    const unsubscribe = this.store.subscribe((value) => {
      if (this.countElement) {
        this.countElement.textContent = value.toString();
      }
    });
    this.onCleanup(unsubscribe);
  }
}
```

## The `h()` Helper Function

The `h()` helper creates elements with a clean, JSX-like syntax:

```typescript
// Basic element
this.h("div", null, "Hello World");

// With class
this.h("div", { class: "text-xl font-bold" }, "Title");

// With event handlers (auto-cleanup!)
this.h(
  "button",
  {
    class: "btn",
    on: {
      click: (e) => console.log("Clicked!"),
      mouseenter: (e) => console.log("Hover!"),
    },
  },
  "Click me"
);

// With inline styles
this.h("div", { style: { color: "red", fontSize: "20px" } }, "Styled");

// With custom attributes
this.h("input", { attrs: { type: "text", placeholder: "Enter name" } });

// Nested elements
this.h(
  "div",
  { class: "container" },
  this.h("h1", null, "Title"),
  this.h("p", null, "Paragraph"),
  this.h("button", { on: { click: () => {} } }, "Action")
);

// Dynamic children (null/undefined filtered out)
this.h(
  "ul",
  null,
  items.map((item) => this.h("li", null, item.name))
);
```

## Props

Props are strongly-typed using TypeScript interfaces:

```typescript
interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: "default" | "highlighted";
}

export const Card = createComponent<CardProps>((props, { h }) => {
  const { title, description, variant = "default" } = props;

  return h(
    "div",
    {
      class: variant === "highlighted" ? "card highlighted" : "card",
      on: { click: () => props.onClick?.() },
    },
    h("h2", null, title),
    description && h("p", null, description)
  );
});
```

## Lifecycle & Cleanup

### Automatic Event Cleanup

Event listeners added via `h()` or `addEventListener()` are automatically cleaned up:

```typescript
render(): HTMLElement {
  return this.h(
    "button",
    {
      on: {
        click: () => {}, // Auto-cleaned on unmount
      },
    },
    "Click"
  );
}
```

### Manual Cleanup

For subscriptions, timers, or other resources:

```typescript
export class Timer extends Component<{}> {
  render(): HTMLElement {
    const display = this.h("div", null, "0");

    // Manual cleanup
    const interval = setInterval(() => {
      display.textContent = (
        parseInt(display.textContent || "0") + 1
      ).toString();
    }, 1000);

    this.onCleanup(() => clearInterval(interval));

    return display;
  }
}
```

### Mount Lifecycle

Use `mount()` for setup after component is rendered:

```typescript
protected mount(): void {
  // Called after render() and added to DOM
  const unsubscribe = store.subscribe(this.handleUpdate);
  this.onCleanup(unsubscribe);
}

protected unmount(): void {
  // Called before removal from DOM
  // Usually handled via onCleanup(), but available if needed
}
```

## State Management

Use the `Store` class for reactive state:

```typescript
import { Store } from "./Core/Store";

export class TodoList extends Component<{}> {
  private todos = new Store<string[]>([]);
  private listElement: HTMLUListElement | null = null;

  render(): HTMLElement {
    this.listElement = this.h("ul", { class: "todo-list" });

    return this.h(
      "div",
      null,
      this.h("h2", null, "Todos"),
      this.listElement,
      this.h(
        "button",
        {
          on: {
            click: () => this.todos.set([...this.todos.get(), "New Todo"]),
          },
        },
        "Add"
      )
    );
  }

  protected mount(): void {
    const unsubscribe = this.todos.subscribe((todos) => {
      if (!this.listElement) return;

      this.listElement.innerHTML = "";
      todos.forEach((todo) => {
        this.listElement!.appendChild(this.h("li", null, todo));
      });
    });

    this.onCleanup(unsubscribe);
  }
}
```

## Complete Example

Here's a complete, real-world component:

```typescript
import { createComponent } from "./Core/Component";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = createComponent<AlertProps>((props, { h, onCleanup }) => {
  const { type = "info", message, dismissible = false } = props;

  const typeStyles = {
    info: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
  };

  return h(
    "div",
    {
      class: `p-4 border rounded-lg ${typeStyles[type]}`,
      attrs: { role: "alert" },
    },
    h("span", null, message),
    dismissible &&
      h(
        "button",
        {
          class: "ml-4 font-bold",
          on: {
            click: () => props.onDismiss?.(),
          },
        },
        "×"
      )
  );
});

// Usage:
const alert = new Alert({
  type: "success",
  message: "Profile saved successfully!",
  dismissible: true,
  onDismiss: () => alert.destroy(),
});
```

## Tips

1. **Use `createComponent()` for simple components** - No classes needed!
2. **Use class extension for stateful components** - When you need lifecycle hooks or complex state
3. **Always use `h()` for creating elements** - Cleaner syntax with auto-cleanup
4. **Event handlers are automatically cleaned up** - When using `h()` or `addEventListener()`
5. **Use `onCleanup()` for manual resource cleanup** - Timers, subscriptions, etc.
6. **Props are immutable** - Don't modify `this.props` directly
7. **Use Store for reactive state** - Automatic updates on state changes
