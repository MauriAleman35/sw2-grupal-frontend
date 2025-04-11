import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/events-home/home.component";
import { MainLayoutEventComponent } from "../layouts/main-layout-event/main-layout-event.component";
import { EventsTicketsComponent } from "./pages/events-tickets/events-tickets.component";
import { EventsCreateComponent } from "./pages/events-create/events-create.component";
import { EventsTicketsDetailsComponent } from "./pages/events-tickets-details/events-tickets-details.component";

const routes: Routes = [
    {
      path: '', 
      component:MainLayoutEventComponent,
      children:[
        {path:'',component:HomeComponent},
        {path:'MyTickets',component:EventsTicketsComponent},
        {path:'MyTickets/:id',component:EventsTicketsDetailsComponent},
        {path:'Create-Event',component:EventsCreateComponent}
      ]  // Este es tu layout principal
    
    }
    
    ];
    
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
   })
    export class EventsRoutingModule {}