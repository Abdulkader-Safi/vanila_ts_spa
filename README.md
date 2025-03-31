# Vanilla TypeScript SPA

## 📚 Description

A simple client-side SPA (Single Page Application) framework using **vanilla TypeScript**.  
Great for learning, experimenting, or building small-scale apps without heavy dependencies.

---

## ⚙️ Features

- Simple client-side routing
- Dynamic template rendering
- Minimal custom templating syntax (`{{ }}`, `{{#if}}`, `{{#each}}`)
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

```ts
import { Router } from "./Core/Router"
import { View } from "./Core/View"

const root = document.querySelector<HTMLDivElement>("#app")!
const router = new Router(root)

router.addRoute("/", async () => {
	return View("home.html", { name: "Safi" })
})

router.start()
```

### View Function

Use the `View(templatePath, context)` function to load an HTML template and inject dynamic data.

The `templatePath` parameter should point to an HTML file located in the `public` folder.

It supports:

- `{{ variable }}`
- `{{#if condition}} ... {{else}} ... {{/if}}`
- `{{#each list}} ... {{/each}}`

Example:

```ts
View("about.html", {
	name: "Safi",
	users: [{ name: "Alice" }, { name: "Bob" }],
})
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
	})
})
```

And in `about.html`:

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
|   |   └── View.ts     # Template engine
|   └── main.ts         # App entry point
├── public/
│   ├── home.html
│   └── about.html
└── index.html      # Mount point
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
- [ ] Global / Local State Management
- [ ] i18n Internationalization
