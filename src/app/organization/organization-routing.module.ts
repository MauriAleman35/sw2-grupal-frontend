import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgDashboardComponent } from './page/org-dashboard/org-dashboard.component';
import { OrgEventsComponent } from './page/org-events/org-events.component';
import { OrgSectionComponent } from './page/org-section/org-section.component';
import { OrgSettingsComponent } from './page/org-settings/org-settings.component';
import { OrganizationLayoutComponent } from '../layouts/organization-layout/organization-layout.component';
import { TenantGuard } from './guard/TenantGuard';

const routes: Routes = [
  {
    path: ':tenantName',
    component: OrganizationLayoutComponent,
    canActivate: [TenantGuard], // ✅ aquí está el guard
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OrgDashboardComponent },
      { path: 'events', component: OrgEventsComponent },
      { path: 'section', component: OrgSectionComponent },
      { path: 'settings', component: OrgSettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }