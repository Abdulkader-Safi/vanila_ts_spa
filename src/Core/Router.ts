// router/Router.ts

type RouteParams = Record<string, string>;

type Route = {
  path: string;
  component: (params: RouteParams) => Promise<HTMLElement>;
  pattern?: RegExp;
  paramNames?: string[];
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

  addRoute(
    path: string,
    component: (params: RouteParams) => Promise<HTMLElement>
  ) {
    const paramNames: string[] = [];
    const regexPath = path
      .replace(/\/:([^\/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "/([^/]+)";
      })
      .replace(/\//g, "\\/");

    const pattern = new RegExp(`^${regexPath}$`);
    this.routes.push({ path, component, pattern, paramNames });
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

    // Try to match against route patterns
    for (const route of this.routes) {
      if (!route.pattern) continue;
      const match = currentPath.match(route.pattern);
      if (match) {
        const params: RouteParams = {};

        // Extract parameters from the match
        if (route.paramNames) {
          route.paramNames.forEach((paramName, index) => {
            params[paramName] = match[index + 1];
          });
        }

        this.root.innerHTML = "";
        const element = await route.component(params);
        this.currentView = element;
        this.root.appendChild(element);
        return;
      }
    }

    // No match found
    this.root.innerHTML = "<h1>404 Not Found</h1>";
    this.currentView = null;
  }
}
