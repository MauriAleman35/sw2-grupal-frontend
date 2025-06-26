import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgDashboardComponent } from './page/org-dashboard/org-dashboard.component';
import { OrgEventsComponent } from './page/org-events/org-events.component';
import { OrgSectionComponent } from './page/org-section/org-section.component';

import { OrganizationLayoutComponent } from '../layouts/organization-layout/organization-layout.component';
import { TenantGuard } from './guard/TenantGuard';
import { OrgFacultyComponent } from './page/org-faculty/org-faculty.component';
import { EventFormComponent } from './components/events/event-form/event-form.component';
import { SectionFormComponent } from './components/sections/section-form/section-form.component';
import { OrgTicketComponent } from './page/org-ticket/org-ticket.component';
import { OrgGenerateVerificationLinkComponent } from './page/org-generate/org-generate-verification-link.component';
import { OrgVerificationComponent } from './page/org-verification/org-verification.component';




const routes: Routes = [
  {
    path: ':tenantName',
    component: OrganizationLayoutComponent,
    canActivate: [TenantGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OrgDashboardComponent },
      {path:'ticket',component:OrgTicketComponent},

      { path: 'faculty', component: OrgFacultyComponent },
      { path: 'events', component: OrgEventsComponent },
      { path: 'events/create', component: EventFormComponent }, 
      { path: 'events/edit/:id', component: EventFormComponent }, 
      { path: 'section/create', component: SectionFormComponent },
      { path: 'section/edit/:id', component: SectionFormComponent },
      { path: 'section/event/:eventId', component: OrgSectionComponent }, 
      { path: 'section', component: OrgSectionComponent },

      { path: 'generate', component:OrgGenerateVerificationLinkComponent},
     
    ]
  },{
    path: ':tenantName/verification',component:OrgVerificationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }