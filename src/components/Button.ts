// Button.ts - Reusable button component

import { Component, type ComponentProps } from "../Core/Component";

interface ButtonProps extends ComponentProps {
  label?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
}

export class Button extends Component<ButtonProps> {
  render(): HTMLElement {
    const {
      label = "Button",
      variant = "primary",
      size = "medium",
      disabled = false,
      onClick,
    } = this.props;

    // Tailwind CSS classes
    const baseClasses =
      "font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    };
    const sizeClasses = {
      small: "px-3 py-1 text-sm",
      medium: "px-4 py-2 text-base",
      large: "px-6 py-3 text-lg",
    };
    const disabledClasses = disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    const button = this.createElement(
      "button",
      {
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`,
        type: "button",
        disabled: String(disabled),
      },
      [label]
    );

    // Attach event listener if onClick is provided
    if (onClick) {
      this.addEventListener(button, "click", (e) => {
        if (!this.props.disabled) {
          e.preventDefault();
          this.props.onClick?.();
        }
      });
    }

    return button;
  }
}
