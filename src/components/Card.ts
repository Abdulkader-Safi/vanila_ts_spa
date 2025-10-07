// Card.ts - Reusable card component with slot support

import { Component, type ComponentProps } from "../Core/Component";

interface CardProps extends ComponentProps {
  title?: string;
  subtitle?: string;
  children?: string;
  shadow?: "none" | "small" | "medium" | "large";
}

export class Card extends Component<CardProps> {
  render(): HTMLElement {
    const {
      title,
      subtitle,
      children = "",
      shadow = "medium",
    } = this.props;

    const shadowClasses = {
      none: "",
      small: "shadow-sm",
      medium: "shadow-md",
      large: "shadow-lg",
    };

    const card = this.createElement(
      "div",
      {
        className: `bg-white dark:bg-slate-800 rounded-lg overflow-hidden ${shadowClasses[shadow]} border border-gray-200 dark:border-gray-700`,
      }
    );

    // Card header (if title or subtitle provided)
    if (title || subtitle) {
      const header = this.createElement(
        "div",
        {
          className: "px-6 py-4 border-b border-gray-200 dark:border-gray-700",
        }
      );

      if (title) {
        const titleElement = this.createElement(
          "h3",
          {
            className: "text-xl font-semibold text-gray-900 dark:text-white",
          },
          [title]
        );
        header.appendChild(titleElement);
      }

      if (subtitle) {
        const subtitleElement = this.createElement(
          "p",
          {
            className: "text-sm text-gray-600 dark:text-gray-400 mt-1",
          },
          [subtitle]
        );
        header.appendChild(subtitleElement);
      }

      card.appendChild(header);
    }

    // Card body (children/slot content)
    if (children) {
      const body = this.createElement(
        "div",
        {
          className: "px-6 py-4",
        }
      );
      body.innerHTML = children;
      card.appendChild(body);
    }

    return card;
  }
}
