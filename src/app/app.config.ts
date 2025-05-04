import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';


import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { AuthGuard } from './auth/guard/auth.guard';
import { TenantGuard } from './organization/guard/TenantGuard';
const routes: Routes = [
  { path: '', loadChildren: () => import('./events/events.module').then(e => e.EventsModule) },
  {path:'auth', loadChildren: () => import('./auth/auth.module').then(a => a.AuthModule)},
  {path:'tenant', loadChildren: () => import('./organization/organization.module').then(t => t.OrganizationModule)},
];

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideClientHydration()]
};
