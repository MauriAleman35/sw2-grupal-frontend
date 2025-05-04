// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpContextToken
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { USE_TENANT_TOKEN } from '../context/tenant-token.context';


@Injectable()
export class AuthTenantInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.auth.getToken();
    const tenantToken = this.auth.getTenantToken();
    const shouldIncludeTenant = req.context.get(USE_TENANT_TOKEN);

    const headers: Record<string, string> = {};

    if (authToken) headers['auth-token'] = authToken;
    if (shouldIncludeTenant && tenantToken) headers['tenant-token'] = tenantToken;

    const cloned = req.clone({ setHeaders: headers });
    return next.handle(cloned);
  }
}
