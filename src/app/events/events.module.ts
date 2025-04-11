import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";

import { EventsRoutingModule } from "./events-routing.module";
import { CarouselComponent } from "./components/carrousel/carousel.component";
import { EventCardComponent } from "./components/event-card/event-card.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";

@NgModule({
  
    imports: [
      CommonModule,
      RouterModule,
      MaterialModule,
        EventsRoutingModule,CarouselComponent,EventCardComponent,SearchBarComponent
        // Importa las rutas del módulo
    ]// Componente principal del módulo
  })
  export class EventsModule { }