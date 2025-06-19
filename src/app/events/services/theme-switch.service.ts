import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitchService {
  private renderer: Renderer2;
  private landingRoutes = ['/home', '/eventos', '/facultades', '/', '/evento/'];

  constructor(
    rendererFactory: RendererFactory2,
    private router: Router
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateThemeBasedOnRoute(event.url);
    });
    
    // Inicializar en la ruta actual
    this.updateThemeBasedOnRoute(this.router.url);
  }

  private updateThemeBasedOnRoute(url: string): void {
    const isLandingPage = this.isLandingRoute(url);
    
    if (isLandingPage) {
      this.renderer.addClass(document.body, 'tailwind-enabled');
    } else {
      this.renderer.removeClass(document.body, 'tailwind-enabled');
    }
  }

  private isLandingRoute(url: string): boolean {
    // Verificar si la ruta actual es parte de la landing
    return this.landingRoutes.some(route => {
      if (route.endsWith('/')) {
        return url === route || url.startsWith(route);
      }
      return url === route;
    });
  }
}