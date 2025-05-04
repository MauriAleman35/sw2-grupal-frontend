import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TenantGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = this.authService.getTenantToken();
    const routeTenantName = route.params['tenantName'];
    const storedTenantName = localStorage.getItem('current-tenant-name');
    const storedTenantId = localStorage.getItem('current-tenant-id');

    if (!token || !storedTenantName || !storedTenantId) {
      return this.router.parseUrl('/MyUnits');
    }

    try {
      const decoded: any = jwtDecode(token);

      // Comparar token y datos guardados
      const tokenId = decoded?.memberTenantId;

      if (
        tokenId === storedTenantId &&
        routeTenantName === storedTenantName.replace(/\./g, '-')
      ) {
        return true;
      }

      return this.router.parseUrl('/MyUnits');
    } catch (err) {
      console.error('Error al decodificar token:', err);
      return this.router.parseUrl('/MyUnits');
    }
  }
}
