import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";
import { OrganizationRoutingModule } from "./organization-routing.module";
import { OrganizationLayoutComponent } from "../layouts/organization-layout/organization-layout.component";
import { FacultyFormComponent } from "./components/faculty/faculty-form/faculty-form.component";
import { FacultyDeleteDialogComponent } from "./components/faculty/faculty-delete-dialog/faculty-delete-dialog.component";
import { EventLocationComponent } from "./components/events/event-location/event-location.component";
import { EventMediaComponent } from "./components/events/event-media/event-media.component";
import { EventReviewComponent } from "./components/events/event-review/event-review.component";



@NgModule({
  
    imports: [
      CommonModule,
      RouterModule,
      MaterialModule,OrganizationRoutingModule,    OrganizationLayoutComponent,FacultyFormComponent,FacultyDeleteDialogComponent,
  EventLocationComponent,
  EventMediaComponent,
  EventReviewComponent,
        // Importa las rutas del módulo
    ]// Componente principal del módulo
  })
  export class OrganizationModule { }