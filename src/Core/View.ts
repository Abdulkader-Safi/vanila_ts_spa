export async function View(
  templatePath: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  context: Record<string, any> = {}
): Promise<HTMLElement> {
  const filePath = `/${templatePath}`; // Maps to /public in Vite

  const response = await fetch(filePath);
  if (!response.ok) {
    alert(`Failed to load template: ${templatePath}`);
    throw new Error(`Failed to load template: ${templatePath}`);
  }

  let html = await response.text();

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
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    return block.replace(/{{\s*(\w+)\s*}}/g, (_: any, prop: string) => {
            return prop in item ? String(item[prop]) : "";
          });
        })
        .join("");
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

  // Handle single variables: {{ name }}
  html = html.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    return context[key] !== undefined ? String(context[key]) : "";
  });

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  document.body.appendChild(wrapper);
  return wrapper.firstElementChild as HTMLElement;
}

// Helper function to access nested properties (supports dot notation)
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getValueFromContext(ctx: Record<string, any>, path: string) {
  return path
    .split(".")
    .reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
      ctx
    );
}
