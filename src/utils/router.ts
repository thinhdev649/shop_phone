// Simple SPA router
type RouteHandler = (params: Record<string, string>) => void;

class Router {
  private routes: Map<RegExp, { handler: RouteHandler; paramNames: string[] }> = new Map();
  private currentPath: string = '/';

  constructor() {
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) this.navigate(href);
      }
    });
  }

  addRoute(path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:\w+/g, (match) => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexPath}$`);
    this.routes.set(regex, { handler, paramNames });
  }

  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  private handleRoute(): void {
    const path = window.location.pathname;
    this.currentPath = path;

    for (const [regex, { handler, paramNames }] of this.routes) {
      const match = path.match(regex);
      if (match) {
        const params: Record<string, string> = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        handler(params);
        return;
      }
    }

    // Default 404 handler
    this.handle404();
  }

  private handle404(): void {
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h1 style="font-size: 72px;">404</h1>
          <p>Page not found</p>
          <a href="/" data-link style="color: #3b82f6;">Go to Homepage</a>
        </div>
      `;
    }
  }

  start(): void {
    this.handleRoute();
  }

  getCurrentPath(): string {
    return this.currentPath;
  }
}

export const router = new Router();
