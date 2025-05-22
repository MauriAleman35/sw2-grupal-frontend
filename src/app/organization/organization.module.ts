import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";
import { OrganizationRoutingModule } from "./organization-routing.module";

// Layouts - Componentes Standalone
import { OrganizationLayoutComponent } from "../layouts/organization-layout/organization-layout.component";

// Faculty - Componentes Standalone
import { FacultyFormComponent } from "./components/faculty/faculty-form/faculty-form.component";
import { FacultyDeleteDialogComponent } from "./components/faculty/faculty-delete-dialog/faculty-delete-dialog.component";

// Events - Componentes Standalone
import { EventLocationComponent } from "./components/events/event-location/event-location.component";
import { EventMediaComponent } from "./components/events/event-media/event-media.component";
import { EventReviewComponent } from "./components/events/event-review/event-review.component";

// Sections - Componentes NO Standalone
import { OrgSectionComponent } from "./page/org-section/org-section.component";
import { SectionCardComponent } from "./components/sections/section-card/section-card.component";
import { SectionTableComponent } from "./components/sections/section-table/section-table.component";
import { SectionFormComponent } from "./components/sections/section-form/section-form.component";
import { parseISO } from "date-fns";
import { TicketConfirmationDialogComponent } from "./components/sections/section-tickets/section-tickets.component";
import { SectionProgressDialogComponent } from "./components/sections/section-progress-dialog/section-progress-dialog.component";


@NgModule({
  declarations: [
    // SOLO los componentes NO standalone van aquí
    OrgSectionComponent,
    SectionCardComponent,
    SectionTableComponent,
    SectionFormComponent,    TicketConfirmationDialogComponent,SectionProgressDialogComponent

  ],
  imports: [
    // Angular Modules
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    // Custom Modules
    MaterialModule,
    OrganizationRoutingModule,
    
    // Componentes Standalone
    OrganizationLayoutComponent,
    FacultyFormComponent,
    FacultyDeleteDialogComponent,
    EventLocationComponent,
    EventMediaComponent,
    EventReviewComponent
  ]
})
export class OrganizationModule { }