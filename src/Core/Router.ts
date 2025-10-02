// router/Router.ts

type Route = {
  path: string;
  component: () => Promise<HTMLElement>;
};

export class Router {
  private routes: Route[] = [];
  private currentView: HTMLElement | null = null;

  constructor(private root: HTMLElement) {
    window.addEventListener("popstate", () => this.render());
    this.interceptLinks();
  }

  private interceptLinks() {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A") {
        const href = target.getAttribute("href");
        if (href?.startsWith("/")) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });
  }

  addRoute(path: string, component: () => Promise<HTMLElement>) {
    this.routes.push({ path, component });
  }

  navigate(path: string) {
    history.pushState({}, "", path);
    this.render();
  }

  start() {
    this.render();
  }

  private async render() {
    // Dispatch cleanup event on the current view before removing it
    if (this.currentView) {
      this.currentView.dispatchEvent(new CustomEvent("cleanup"));
    }

    const currentPath = window.location.pathname;
    const match = this.routes.find((r) => r.path === currentPath);
    if (match) {
      this.root.innerHTML = "";
      const element = await match.component();
      this.currentView = element;
      this.root.appendChild(element);
    } else {
      this.root.innerHTML = "<h1>404 Not Found</h1>";
      this.currentView = null;
    }
  }
}
