// components/index.ts - Register all reusable components

import { registerComponent } from "../Core/ComponentRegistry";
import { Button } from "./Button";
import { Card } from "./Card";
import { Counter } from "./Counter";
import { SimpleButton } from "./SimpleButton";

/**
 * Register all components with their custom tag names
 * Call this function once at app startup (in main.ts)
 */
export function registerComponents(): void {
  registerComponent("c-button", Button);
  registerComponent("c-card", Card);
  registerComponent("c-counter", Counter);
  registerComponent("c-simple-button", SimpleButton);
}

// Export components for programmatic usage
export { Button, Card, Counter, SimpleButton };
