import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";
import { OrganizationRoutingModule } from "./organization-routing.module";
import { OrganizationLayoutComponent } from "../layouts/organization-layout/organization-layout.component";
import { FacultyFormComponent } from "./components/faculty/faculty-form/faculty-form.component";
import { FacultyDeleteDialogComponent } from "./components/faculty/faculty-delete-dialog/faculty-delete-dialog.component";



@NgModule({
  
    imports: [
      CommonModule,
      RouterModule,
      MaterialModule,OrganizationRoutingModule,    OrganizationLayoutComponent,FacultyFormComponent,FacultyDeleteDialogComponent

        // Importa las rutas del módulo
    ]// Componente principal del módulo
  })
  export class OrganizationModule { }