import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthTenantInterceptor } from './app/interceptors/auth-tenant.interceptors';


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptorsFromDi()),

    // 👇 REGISTRO explícito del interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTenantInterceptor,
      multi: true,
    }
  ]
}).catch((err) => console.error(err));