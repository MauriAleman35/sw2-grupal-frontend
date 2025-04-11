import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthSinginComponent } from "./pages/auth-singin/auth-singin.component";
import { AuthSingupComponent } from "./pages/auth-singup/auth-singup.component";


const routes: Routes = [
    {
      path: 'login', 
      component:AuthSinginComponent,
    },{
        path:'register',
        component:AuthSingupComponent
    }
    
    ];
    
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
   })
    export class AuthRoutingModule {}