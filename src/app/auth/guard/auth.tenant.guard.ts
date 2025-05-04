import { Injectable } from "@angular/core";
import {  CanActivate, Router, } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({providedIn: 'root'})
export class tenantGuard implements CanActivate{
    constructor(private auth: AuthService, private router: Router) {}

    canActivate():boolean  {
        if(!this.auth.hasValidTenant()){
            this.router.navigate(['/auth/login']);
            return false;
        }
        return true;
    }
}