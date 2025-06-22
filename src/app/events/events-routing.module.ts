import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/events-home/home.component";
import { MainLayoutEventComponent } from "../layouts/main-layout-event/main-layout-event.component";
import { EventsTicketsComponent } from "./pages/events-tickets/events-tickets.component";
import { EventsCreateComponent } from "./pages/events-create/events-create.component";
import { EventsTicketsDetailsComponent } from "./pages/events-tickets-details/events-tickets-details.component";
import { EventsDetailComponent } from "./pages/events-detail/events-detail.component";
import { EventsAccountComponent } from "./pages/events-account/events-account.component";
import { SubscriptionSuccessComponent } from "../../public/pages/subscription.success/subscription-success.component";
import { SubscriptionErrorComponent } from "../../public/pages/subscription.error/subscription-error.component";
import { EventsMyTenantsComponent } from "./pages/events-my-tenants/events-my-tenants.component";
import { EventsPaymentComponent } from "./pages/events-payment/events-payment.component";

const routes: Routes = [
  // Rutas con layout principal
  {
    path: '', 
    component: MainLayoutEventComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'events/:slug', component: EventsDetailComponent },
        {path:'events/:slug/payment', component:EventsPaymentComponent},
      { path: 'MyTickets', component: EventsTicketsComponent },
      { path: 'MyTickets/:id', component: EventsTicketsDetailsComponent },
      { path: 'Create-Event', component: EventsCreateComponent },
    
      { path: 'Account', component: EventsAccountComponent },
      {path:'MyUnit',component:EventsMyTenantsComponent}
    ]
  },


  { path: 'suscription/success', component: SubscriptionSuccessComponent },
  { path: 'suscription/error', component: SubscriptionErrorComponent },

  // // Opcional: redireccionar cualquier ruta inválida
  // { path: '**', redirectTo: '', pathMatch: 'full' }
];

    
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
   })
    export class EventsRoutingModule {}