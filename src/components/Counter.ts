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

    // Store count element reference
    this.countElement = this.h(
      "span",
      {
        class: "text-2xl font-bold text-gray-900 dark:text-white min-w-[3rem] text-center",
      },
      this.store.get().toString()
    );

    // Build component tree with h() helper
    return this.h(
      "div",
      { class: "inline-flex flex-col gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg" },
      this.h(
        "div",
        { class: "text-sm font-medium text-gray-700 dark:text-gray-300" },
        label
      ),
      this.h(
        "div",
        { class: "flex items-center gap-4" },
        this.h(
          "button",
          {
            class: "px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors",
            on: {
              click: () => this.store.set(this.store.get() - 1),
            },
          },
          "-"
        ),
        this.countElement,
        this.h(
          "button",
          {
            class: "px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors",
            on: {
              click: () => this.store.set(this.store.get() + 1),
            },
          },
          "+"
        )
      ),
      this.h(
        "button",
        {
          class: "px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors",
          on: {
            click: () => this.store.set(this.props.initialValue || 0),
          },
        },
        "Reset"
      )
    );
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
