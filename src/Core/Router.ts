// router/Router.ts

type Route = {
  path: string;
  component: () => Promise<HTMLElement>;
};

export class Router {
  private routes: Route[] = [];

  constructor(private root: HTMLElement) {
    window.addEventListener("popstate", () => this.render());
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
    const currentPath = window.location.pathname;
    const match = this.routes.find((r) => r.path === currentPath);
    if (match) {
      this.root.innerHTML = "";
      const element = await match.component();
      this.root.appendChild(element);
    } else {
      this.root.innerHTML = "<h1>404 Not Found</h1>";
    }
  }
}
