// SimpleButton.ts - Example of simplified component creation

import { createComponent } from "../Core/Component";

interface SimpleButtonProps {
  label?: string;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  [key: string]: unknown;
}

/**
 * Example of creating a component with the simplified createComponent function
 * No need to extend a class - just provide a render function!
 */
export const SimpleButton = createComponent<SimpleButtonProps>((props, { h }) => {
  const { label = "Click me", variant = "primary", id } = props;

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return h(
    "button",
    {
      class: `px-4 py-2 rounded font-semibold transition-colors ${variantClasses[variant]}`,
      attrs: id ? { id: id as string } : undefined,
      on: {
        click: () => {
          if (props.onClick) {
            props.onClick();
          } else {
            alert("clicked");
          }
        },
      },
    },
    label
  );
});
