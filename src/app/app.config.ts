import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';


import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
const routes: Routes = [
  { path: '', loadChildren: () => import('./events/events.module').then(e => e.EventsModule) },
  {path:'auth', loadChildren: () => import('./auth/auth.module').then(a => a.AuthModule)},
];

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideClientHydration()]
};
