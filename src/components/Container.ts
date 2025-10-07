// Container.ts - A simple container component that renders its children

import { Component, type ComponentProps } from "../Core/Component";

interface ContainerProps extends ComponentProps {
  children?: string;
}

export class Container extends Component<ContainerProps> {
  render(): HTMLElement {
    const { children = "" } = this.props;

    const container = this.createElement("div", {
      className:
        "p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
    });

    // The 'children' prop is automatically populated with the inner HTML
    // of the custom tag in the view.
    container.innerHTML = children;

    return container;
  }
}
