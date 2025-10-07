// Counter.ts - Stateful counter component

import { Component, type ComponentProps } from "../Core/Component";
import { Store } from "../Core/Store";

interface CounterProps extends ComponentProps {
  initialValue?: number;
  label?: string;
}

export class Counter extends Component<CounterProps> {
  private store: Store<number>;
  private countElement: HTMLSpanElement | null = null;

  constructor(props: CounterProps) {
    super(props);
    this.store = new Store(props.initialValue || 0);
  }

  render(): HTMLElement {
    const { label = "Count" } = this.props;

    const container = this.createElement(
      "div",
      {
        className: "inline-flex flex-col gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg",
      }
    );

    // Label
    const labelElement = this.createElement(
      "div",
      {
        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
      },
      [label]
    );
    container.appendChild(labelElement);

    // Counter display
    const display = this.createElement(
      "div",
      {
        className: "flex items-center gap-4",
      }
    );

    // Decrement button
    const decrementBtn = this.createElement(
      "button",
      {
        className: "px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors",
      },
      ["-"]
    );
    this.addEventListener(decrementBtn, "click", () => {
      this.store.set(this.store.get() - 1);
    });

    // Count display
    this.countElement = this.createElement(
      "span",
      {
        className: "text-2xl font-bold text-gray-900 dark:text-white min-w-[3rem] text-center",
      },
      [this.store.get().toString()]
    );

    // Increment button
    const incrementBtn = this.createElement(
      "button",
      {
        className: "px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors",
      },
      ["+"]
    );
    this.addEventListener(incrementBtn, "click", () => {
      this.store.set(this.store.get() + 1);
    });

    // Reset button
    const resetBtn = this.createElement(
      "button",
      {
        className: "px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors",
      },
      ["Reset"]
    );
    this.addEventListener(resetBtn, "click", () => {
      this.store.set(this.props.initialValue || 0);
    });

    display.appendChild(decrementBtn);
    display.appendChild(this.countElement);
    display.appendChild(incrementBtn);
    container.appendChild(display);
    container.appendChild(resetBtn);

    return container;
  }

  protected mount(): void {
    // Subscribe to store changes
    const unsubscribe = this.store.subscribe((value) => {
      if (this.countElement) {
        this.countElement.textContent = value.toString();
      }
    });

    // Register cleanup
    this.onCleanup(unsubscribe);
  }
}
