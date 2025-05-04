import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse } from '../interfaces/login.interface';
import { postCreateUserParams, UserCreateResponse } from '../interfaces/user-create.interface';
import { GetTenantsResponse } from '../interfaces/user-tenants';
import { USE_TENANT_TOKEN } from '../../context/tenant-token.context';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl=environment.apiUrl;
  private user$=new BehaviorSubject<any>(null); 

  constructor(private http:HttpClient, private router:Router) {
    const user=localStorage.getItem('user');
    if (user) this.user$.next(JSON.parse(user));
   }

  login(credentiales:{email:string,password:string}){
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login-saas`,credentiales).pipe(
      tap((res)=>{

        //Mejorar de acuerdo al flujo del backend
        localStorage.setItem('user',JSON.stringify(res.data.user));
        localStorage.setItem('auth-token',res.data.token);
        if (res.data.tenantToken) {
          localStorage.setItem('tenant-token', res.data.tenantToken);
          this.router.navigate(['/events']);
        }
        this.router.navigate(['/']);
        this.user$.next(res.data.user);
     
      })

    )
  } 
  createUser(user:postCreateUserParams){
    const formData=new FormData();
    formData.append('email',user.email);
    formData.append('fullname',user.fullname);    
    formData.append('lastname',user.lastname);
    formData.append('phone',user.phone);
    formData.append('password',user.password);
    formData.append('gender',user.gender);

    return this.http.post<UserCreateResponse>(`${this.baseUrl}/user/create`,formData);

  }
  getTenantByUser():Observable<GetTenantsResponse>{
    return this.http.get<GetTenantsResponse>(`${this.baseUrl}/tenant`,{
            context: new HttpContext().set(USE_TENANT_TOKEN, false) // Solo auth-token
          })
  }
  logout() {
    localStorage.clear();
    this.user$.next(null);
    this.router.navigate(['/']);
  }

  getUser(): Observable<any> {
    return this.user$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth-token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getTenantToken(): string | null {
    return localStorage.getItem('tenant-token');
  }

  hasValidTenant(): boolean {
    const token = this.getTenantToken();
    if (!token) return false;

  // Podés validarlo con jwt-decode si querés revisar expiración
    return true;
  }


}
