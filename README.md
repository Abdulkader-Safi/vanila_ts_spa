# Vanilla TypeScript SPA

## 📚 Description

A simple client-side SPA (Single Page Application) framework using **vanilla TypeScript**.  
Great for learning, experimenting, or building small-scale apps without heavy dependencies.

---

## ⚙️ Features

- Simple client-side routing with automatic link interception
- **Route parameters** support (e.g., `/user/:id`, `/post/:slug`)
- Dynamic template rendering
- Dual templating syntax: Handlebars-style (`{{ }}`) and XML-style (`<text />`, `<each>`, `<if>`)
- Reactive state management with Store (global & local)
- Automatic cleanup of event listeners and subscriptions
- **Tailwind CSS v4** integration with Vite plugin
- Dark mode support
- **Progressive Web App (PWA)** support with offline capabilities
- Optimized performance with code splitting and caching strategies
- Service Worker with automatic updates
- Written in clean TypeScript

---

## 🚀 Usage

### 1. Clone the project

```bash
git clone https://github.com/Abdulkader-Safi/vanilla_ts_spa.git
# change directory to the project
cd vanilla_ts_spa
```

### 2. Install Dependencies

```bash
npm install
# or using Bun
bun install
```

> This project uses Vite for local development and Tailwind CSS v4 for styling.

### 3. Run the App

```bash
npm run dev
# or using Bun
bun run dev
```

### 3. Open in Browser

Go to: [http://localhost:5173](http://localhost:5173)

---

## 🎨 Styling with Tailwind CSS

This project uses **Tailwind CSS v4** (beta) for modern, utility-first styling.

### Setup

Tailwind is already configured and ready to use. The setup includes:

- `@tailwindcss/vite` plugin in `vite.config.ts`
- Tailwind imported in `src/style/style.css`
- Zero configuration needed - templates are auto-detected

### Using Tailwind Classes

Simply add Tailwind utility classes to your HTML templates:

```html
<div class="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-700">
  <h1 class="text-2xl font-bold">Hello World</h1>
</div>
```

### Dark Mode

The project supports dark mode out of the box. Use `dark:` prefix for dark mode styles:

```html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  Content adapts to dark mode
</div>
```

---

## 📱 Progressive Web App (PWA)

This project is configured as a Progressive Web App, allowing it to be installed on mobile devices and work offline.

### PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Works without internet connection using Service Worker
- **Auto-Update**: Service worker automatically updates in the background
- **Optimized Caching**: Smart caching strategies for assets, images, and API calls
- **Fast Loading**: Cached resources load instantly on repeat visits

### Performance Optimizations

The project includes several performance optimizations:

1. **Code Splitting**: Each route can be lazy-loaded, reducing initial bundle size
2. **Terser Minification**: Production builds are optimized with console.log removal
3. **Manual Chunking**: Vendor code separated for better caching
4. **CSS Code Splitting**: Styles loaded on-demand
5. **Service Worker Caching**:
   - Images cached for 30 days (CacheFirst)
   - JS/CSS cached with StaleWhileRevalidate (7 days)
   - Fonts cached for 1 year
   - Maximum cache size: 3MB per file

### Building for Mobile

For optimal mobile performance with many pages (50+):

1. **Use Lazy Loading**:

```typescript
// Split routes into separate chunks
router.addRoute("/page1", async () =>
  (await import("./pages/Page1")).default()
);
router.addRoute("/page2", async () =>
  (await import("./pages/Page2")).default()
);
```

1. **Add Route Prefetching** for better UX on likely navigation paths

1. **Optimize Images**:

   - Use WebP format
   - Add lazy loading: `<img loading="lazy">`
   - Compress images before deployment

1. **Template Caching**: The View function automatically caches loaded templates

### Installation

To add PWA icons, place these files in the `public/` folder:

- `pwa-64x64.png`
- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-icon-512x512.png`
- `apple-touch-icon.png`
- `mask-icon.svg`
- `favicon.ico`

You can generate these using [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/).

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

router.addRoute("/", async (params) => {
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

### Route Parameters

The router supports dynamic route parameters using the `:paramName` syntax. Route components receive a `params` object containing the extracted values.

```ts
// Define a route with parameters
router.addRoute("/user/:id", async (params) => {
  // params.id contains the value from the URL
  return View("user.html", {
    userId: params.id,
    title: `User Profile - ${params.id}`,
  });
});

// Multiple parameters
router.addRoute("/post/:category/:slug", async (params) => {
  return View("post.html", {
    category: params.category,
    slug: params.slug,
  });
});
```

**Example URLs:**

- `/user/123` → `params = { id: "123" }`
- `/post/tech/my-article` → `params = { category: "tech", slug: "my-article" }`

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
router.addRoute("/about", async (params) => {
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

### If You Want SEO

You'd need to add:

- Server-Side Rendering (SSR), or
- Static Site Generation (pre-rendered HTML)

---

## 📁 File Structure

```bash
├── src/
│   ├── Core/
│   │   ├── Router.ts      # Custom router class
│   │   ├── View.ts        # Template engine
│   │   └── Store.ts       # Reactive state management
│   ├── view/
│   │   ├── home.html      # Home page template
│   │   └── about.html     # About page template
│   ├── style/
│   │   └── style.css      # Tailwind CSS imports
│   └── main.ts            # App entry point
├── public/                # Static assets
├── vite.config.ts         # Vite + Tailwind configuration
└── index.html             # Mount point
```

---

## ✅ Good For

- Learning routing and templating
- Building mini apps and demos
- Understanding SPA basics with TypeScript
- Learning modern CSS with Tailwind CSS v4
- Practicing reactive state management patterns

---

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Bun** - Fast JavaScript runtime and package manager

---

## TODO

- [ ] add Server-Side Rendering (SSR)
- [x] Support Router Parameters (/user/`:id`)
- [ ] Data fetching layer (like useEffect)
- [ ] Middleware / Guards
- [x] Global / Local State Management
- [x] Automatic cleanup system for subscriptions and event listeners
- [x] Link interception for SPA navigation
- [x] Tailwind CSS v4 integration
- [x] Progressive Web App (PWA) support
- [x] Service Worker with offline capabilities
- [x] Performance optimizations (code splitting, caching)
- [ ] i18n Internationalization
- [ ] Virtual DOM for better performance
