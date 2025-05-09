import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

 // Importa el módulo de marketing

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from './material.module';
import { FooterComponent } from './events/components/footer/footer.component';
import { HeaderComponent } from './events/components/header/header.component';
import { AuthTenantInterceptor } from './interceptors/auth-tenant.interceptors';
import { SubscriptionErrorComponent } from '../public/pages/subscription.error/subscription-error.component';
import { SubscriptionSuccessComponent } from '../public/pages/subscription.success/subscription-success.component';
import { MatTimepickerModule, provideNativeDateTimeAdapter } from '@dhutaryan/ngx-mat-timepicker';
@NgModule({
  declarations: [
    AppComponent,FooterComponent,HeaderComponent,SubscriptionErrorComponent,SubscriptionSuccessComponent
  ],
  imports: [
    BrowserModule,
    
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,BehaviorSubject,HttpClient, MatTimepickerModule // Asegúrate de importar el módulo de marketing
  ],
  providers: [provideHttpClient(),{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthTenantInterceptor,
    multi: true,
  },provideNativeDateTimeAdapter()],
  bootstrap: [AppComponent]
})
export class AppModule { }
