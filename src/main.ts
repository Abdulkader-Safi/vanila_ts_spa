import { Router } from "./Core/Router";
import { View } from "./Core/View";
import { Store } from "./Core/Store";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Root element with id 'app' not found.");
}
const router = new Router(root);

// Create a counter store

router.addRoute("/", async () => {
  const counterStore = new Store<number>(0);

  const view = await View("home.html", {
    name: "Safi",
    users: [{ name: "John" }, { name: "Jane" }, { name: "Doe" }],
  });

  // Set up counter functionality
  const countElement = view.querySelector<HTMLSpanElement>("#count");
  const incrementBtn = view.querySelector<HTMLButtonElement>("#increment");
  const decrementBtn = view.querySelector<HTMLButtonElement>("#decrement");
  const resetBtn = view.querySelector<HTMLButtonElement>("#reset");

  if (countElement && incrementBtn && decrementBtn && resetBtn) {
    // Subscribe to state changes
    counterStore.subscribe((value) => {
      countElement.innerText = value.toString();
    });

    // Initialize with current value
    countElement.innerText = counterStore.get().toString();

    // Add event listeners
    incrementBtn.addEventListener("click", () => {
      counterStore.set(counterStore.get() + 1);
    });

    decrementBtn.addEventListener("click", () => {
      counterStore.set(counterStore.get() - 1);
    });

    resetBtn.addEventListener("click", () => {
      counterStore.set(0);
    });
  }

  return view;
});

router.addRoute("/about", async () => {
  return View("about.html", {
    name: "Safi",
    users: [{ name: "John" }, { name: "Jane" }, { name: "Doe" }],
    user: {
      isAdmin: true,
    },
  });
});

router.start();
