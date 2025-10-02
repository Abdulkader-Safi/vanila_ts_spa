import { Router } from "./Core/Router";
import { View } from "./Core/View";
import { Store } from "./Core/Store";
import "./style/style.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Root element with id 'app' not found.");
}
const router = new Router(root);

// Create a global counter store
const counterStore = new Store<number>(0);

router.addRoute("/", async (params) => {
  // Create local a counter store
  // const counterStore = new Store<number>(0);

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
    // Subscribe to state changes and store the unsubscribe function
    const unsubscribe = counterStore.subscribe((value) => {
      countElement.innerText = value.toString();
    });

    // Initialize with current value
    countElement.innerText = counterStore.get().toString();

    // Create event handlers
    const handleIncrement = () => counterStore.set(counterStore.get() + 1);
    const handleDecrement = () => counterStore.set(counterStore.get() - 1);
    const handleReset = () => counterStore.set(0);

    // Add event listeners
    incrementBtn.addEventListener("click", handleIncrement);
    decrementBtn.addEventListener("click", handleDecrement);
    resetBtn.addEventListener("click", handleReset);

    // Clean up when view is removed/navigated away
    view.addEventListener("cleanup", () => {
      unsubscribe();
      incrementBtn.removeEventListener("click", handleIncrement);
      decrementBtn.removeEventListener("click", handleDecrement);
      resetBtn.removeEventListener("click", handleReset);
    });
  }

  return view;
});

router.addRoute("/about/:name", async (params) => {
  return View("about.html", {
    name: params.name,
    users: [{ name: "John" }, { name: "Jane" }, { name: "Doe" }],
    user: {
      isAdmin: true,
    },
  });
});

router.start();
