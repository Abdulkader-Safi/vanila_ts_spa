import { registry } from "./ComponentRegistry";

export async function View(
  templatePath: string,
  context: Record<string, unknown> = {}
): Promise<HTMLElement> {
  // Use Vite's import.meta.glob to load templates
  const templates = import.meta.glob("/src/view/**/*.html", {
    query: "?raw",
    eager: false,
  });

  const fullPath = `/src/view/${templatePath}`;
  const templateLoader = templates[fullPath];

  if (!templateLoader) {
    alert(`Template not found: ${templatePath}`);
    throw new Error(`Template not found: ${templatePath}`);
  }

  const module = (await templateLoader()) as { default: string };
  let html = module.default;

  // Handle XML-style loops: <each data="items">...</each>
  html = html.replace(
    /<each\s+data="(\w+)">([\s\S]*?)<\/each>/g,
    (_, key, block) => {
      const items = context[key];
      if (!items || !Array.isArray(items)) {
        console.warn(`"${key}" is not an array or is undefined.`);
        return "";
      }

      return items
        .map((item) => {
          // Replace XML-style text tags and Handlebars-style variables
          let itemBlock = block;

          // Replace <text data="prop" /> with item value
          itemBlock = itemBlock.replace(
            /<text\s+data="(\w+)"\s*\/>/g,
            (_match: string, prop: string) => {
              return prop in item ? String(item[prop as keyof typeof item]) : "";
            }
          );

          // Also support Handlebars-style {{ prop }}
          itemBlock = itemBlock.replace(
            /{{\s*(\w+)\s*}}/g,
            (_match: string, prop: string) => {
              return prop in item ? String(item[prop as keyof typeof item]) : "";
            }
          );

          return itemBlock;
        })
        .join("");
    }
  );

  // Handle loops: {{#each items}}...{{/each}}
  html = html.replace(
    /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
    (_, key, block) => {
      const items = context[key];
      if (!items || !Array.isArray(items)) {
        console.warn(`"${key}" is not an array or is undefined.`);
        return "";
      }

      return items
        .map((item) => {
          // Replace variables inside the loop block
          return block.replace(/{{\s*(\w+)\s*}}/g, (_match: string, prop: string) => {
            return prop in item ? String(item[prop as keyof typeof item]) : "";
          });
        })
        .join("");
    }
  );

  // Handle XML-style conditionals: <if data="condition">...</if>
  html = html.replace(
    /<if\s+data="([\w.]+)">([\s\S]*?)<\/if>/g,
    (_, condition, block) => {
      const conditionBlocks = [];
      let elseBlock = "";

      // Split block into parts: if, else if, else (support both <elseif> and <elseif />)
      const parts = block.split(
        /<(elseif\s+data="[\w.]+"(?:\s*\/)?|else(?:\s*\/)?)>/
      );

      // First part is the "if" block
      conditionBlocks.push({ condition, content: parts[0] });

      for (let i = 1; i < parts.length; i += 2) {
        const tag = parts[i];
        const content = parts[i + 1] || "";

        if (tag.startsWith("elseif")) {
          const elseIfMatch = tag.match(/elseif\s+data="([\w.]+)"/);
          if (elseIfMatch) {
            conditionBlocks.push({ condition: elseIfMatch[1], content });
          }
        } else if (tag.startsWith("else")) {
          elseBlock = content;
        }
      }

      // Evaluate conditions in order
      for (const block of conditionBlocks) {
        const value = getValueFromContext(context, block.condition);
        if (value) {
          return block.content;
        }
      }

      // No condition matched, return else block
      return elseBlock;
    }
  );

  // Handle conditionals: {{#if condition}}...{{else if condition}}...{{else}}...{{/if}}
  html = html.replace(
    /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g,
    (_, condition, block) => {
      const conditionBlocks = [];
      let elseBlock = "";

      // Split block into parts: if, else if, else
      const parts = block.split(/{{\s*(else if\s+[\w.]+|else)\s*}}/);

      // First part is the "if" block
      conditionBlocks.push({ condition, content: parts[0] });

      for (let i = 1; i < parts.length; i += 2) {
        const tag = parts[i];
        const content = parts[i + 1] || "";

        if (tag.startsWith("else if")) {
          const elseIfCondition = tag.slice(8).trim();
          conditionBlocks.push({ condition: elseIfCondition, content });
        } else if (tag === "else") {
          elseBlock = content;
        }
      }

      // Evaluate conditions in order
      for (const block of conditionBlocks) {
        const value = getValueFromContext(context, block.condition);
        if (value) {
          return block.content;
        }
      }

      // No condition matched, return else block
      return elseBlock;
    }
  );

  // Handle XML-style text tags: <text data="name" />
  html = html.replace(/<text\s+data="(\w+)"\s*\/>/g, (_, key) => {
    return context[key] !== undefined ? String(context[key]) : "";
  });

  // Handle single variables: {{ name }}
  html = html.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    return context[key] !== undefined ? String(context[key]) : "";
  });

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  const element = wrapper.firstElementChild as HTMLElement;

  if (!element) {
    throw new Error(`No valid element found in template: ${templatePath}`);
  }

  // Render all registered components within the element
  registry.renderComponents(element);

  return element;
}

// Helper function to access nested properties (supports dot notation)
function getValueFromContext(ctx: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (obj, key) => {
        if (obj && typeof obj === "object" && key in obj) {
          return (obj as Record<string, unknown>)[key];
        }
        return undefined;
      },
      ctx
    );
}
