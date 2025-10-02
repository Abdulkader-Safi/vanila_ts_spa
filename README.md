# Vanilla TypeScript SPA

## 📚 Description

A simple client-side SPA (Single Page Application) framework using **vanilla TypeScript**.  
Great for learning, experimenting, or building small-scale apps without heavy dependencies.

---

## ⚙️ Features

- Simple client-side routing with automatic link interception
- Dynamic template rendering
- Dual templating syntax: Handlebars-style (`{{ }}`) and XML-style (`<text />`, `<each>`, `<if>`)
- Reactive state management with Store (global & local)
- Automatic cleanup of event listeners and subscriptions
- Written in clean TypeScript

---

## 🚀 Usage

### 1. Install Dependencies

```bash
npm install
```

> This project uses Vite for local development.

### 2. Run the App

```bash
npm run dev
```

### 3. Open in Browser

Go to: [http://localhost:5173](http://localhost:5173)

---

## 🧩 How It Works

### Router Setup

You define routes using the `Router` class. Each route maps a path to an async component.

The router automatically intercepts all internal links (starting with `/`) and handles navigation without page reloads.

```ts
import { Router } from "./Core/Router";
import { View } from "./Core/View";
import { Store } from "./Core/Store";

const root = document.querySelector<HTMLDivElement>("#app")!;
const router = new Router(root);

// Create a global store (persists across navigation)
const counterStore = new Store(0);

router.addRoute("/", async () => {
  const view = await View("home.html", { name: "Safi" });

  // Set up state management
  const countElement = view.querySelector("#count");
  const incrementBtn = view.querySelector("#increment");

  // Subscribe to state changes
  const unsubscribe = counterStore.subscribe((value) => {
    countElement.innerText = value.toString();
  });

  // Add event listener
  const handleIncrement = () => counterStore.set(counterStore.get() + 1);
  incrementBtn.addEventListener("click", handleIncrement);

  // Clean up when navigating away
  view.addEventListener("cleanup", () => {
    unsubscribe();
    incrementBtn.removeEventListener("click", handleIncrement);
  });

  return view;
});

router.start();
```

### View Function

Use the `View(templatePath, context)` function to load an HTML template and inject dynamic data.

The `templatePath` parameter should point to an HTML file located in the `src/view` folder.

**Templating Syntax:**

The framework supports two templating syntaxes that can be used interchangeably or mixed together:

**Handlebars-style Syntax:**
- Variables: `{{ variable }}`
- Conditionals: `{{#if condition}} ... {{else if condition}} ... {{else}} ... {{/if}}`
- Loops: `{{#each list}} ... {{/each}}`

**XML-style Syntax:**
- Variables: `<text data="variable" />`
- Conditionals: `<if data="condition"> ... <elseif data="condition" /> ... <else /> ... </if>`
- Loops: `<each data="list"> ... </each>`

Example:

```ts
View("about.html", {
  name: "Safi",
  users: [{ name: "Alice" }, { name: "Bob" }],
});
```

### State Management

Use the `Store` class for reactive state management. The store notifies subscribers when the state changes.

```ts
import { Store } from "./Core/Store";

// Create a store with initial state
const counterStore = new Store(0);

// Subscribe to state changes
const unsubscribe = counterStore.subscribe((value) => {
  console.log("New value:", value);
});

// Update state
counterStore.set(counterStore.get() + 1); // or use updater function
counterStore.set((prev) => prev + 1);

// Unsubscribe when done
unsubscribe();
```

**Key Features:**

- Generic `Store<T>` for type safety
- Subscribe/unsubscribe pattern
- Supports updater functions
- No page refresh - only subscribed components update

**Global vs Local State:**

- **Global Store** (outside route): State persists across navigation
- **Local Store** (inside route): State resets when navigating away

```ts
// Global - persists across pages
const globalCounter = new Store(0);

router.addRoute("/", async () => {
  // Local - resets on navigation
  const localCounter = new Store(0);
  // ...
});
```

**Automatic Cleanup:**

The router dispatches a `cleanup` event when navigating away. Use it to prevent memory leaks:

```ts
view.addEventListener("cleanup", () => {
  unsubscribe();
  element.removeEventListener("click", handler);
});
```

---

## 🧪 Mini Example

```ts
router.addRoute("/about", async () => {
  return View("about.html", {
    name: "Safi",
    users: [{ name: "John" }, { name: "Jane" }],
    user: {
      isAdmin: true,
    },
  });
});
```

And in `src/view/about.html` (Handlebars-style):

```html
<h1>Hello, {{name}}</h1>

{{#if user.isAdmin}}
<p>You are an admin</p>
{{else}}
<p>You are a guest</p>
{{/if}}

<ul>
  {{#each users}}
  <li>{{name}}</li>
  {{/each}}
</ul>
```

Or using XML-style syntax:

```html
<h1>Hello, <text data="name" /></h1>

<if data="user.isAdmin">
  <p>You are an admin</p>
<else />
  <p>You are a guest</p>
</if>

<ul>
  <each data="users">
    <li><text data="name" /></li>
  </each>
</ul>
```

Or mix both styles:

```html
<h1>Hello, {{name}}</h1>

<each data="users">
  <li>{{ name }}</li>
</each>
```

---

## ❓ Is It SEO-Friendly?

No — this is a **client-side rendered SPA**.  
That means search engines might not index your content effectively.

### If You Want SEO:

You'd need to add:

- Server-Side Rendering (SSR), or
- Static Site Generation (pre-rendered HTML)

---

## 📁 File Structure

```
├── src/
|   ├── Core/
│   |   ├── Router.ts   # Custom router class
|   |   ├── View.ts     # Template engine
|   |   └── Store.ts    # Reactive state management
|   ├── view/
│   |   ├── home.html   # Home page template
│   |   └── about.html  # About page template
|   └── main.ts         # App entry point
├── public/             # Static assets
└── index.html          # Mount point
```

---

## ✅ Good For

- Learning routing and templating
- Building mini apps and demos
- Understanding SPA basics with TypeScript

---

## TODO

- [ ] add Server-Side Rendering (SSR)
- [ ] Support Router Parameters (/user/`:id`)
- [ ] Reusable Component across views
- [ ] Data fetching layer (like useEffect)
- [ ] Middleware / Guards
- [x] Global / Local State Management
- [x] Automatic cleanup system for subscriptions and event listeners
- [x] Link interception for SPA navigation
- [ ] i18n Internationalization
