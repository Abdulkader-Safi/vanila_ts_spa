import { Router } from "./Core/Router"
import { View } from "./Core/View"

const root = document.querySelector<HTMLDivElement>("#app")!
const router = new Router(root)

router.addRoute("/", async () => {
	return View("home.html", {
		name: "Safi",
		users: [{ name: "John" }, { name: "Jane" }, { name: "Doe" }],
	})
})

router.addRoute("/about", async () => {
	return View("about.html", {
		name: "Safi",
		users: [{ name: "John" }, { name: "Jane" }, { name: "Doe" }],
		user: {
			isAdmin: true,
		},
	})
})

router.start()
