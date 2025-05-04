import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { SubscriptionPostParams, SubscriptionPostResponse, SubscriptionResponse } from '../interfaces/subscription';
import { Observable } from 'rxjs';
import { USE_TENANT_TOKEN } from '../../context/tenant-token.context';
import { AllTenantsResponse } from '../interfaces/tenants';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private ApiUrl:string=environment.apiUrl
  constructor(private Http:HttpClient, private router:Router) { }

  getSubscriptions():Observable<SubscriptionResponse>{
    return this.Http.get<SubscriptionResponse>(`${this.ApiUrl}/subscription`)
  }
  createSubscription(subscription: SubscriptionPostParams): Observable<SubscriptionPostResponse> {
    return this.Http.post<SubscriptionPostResponse>(
      `${this.ApiUrl}/subscription`,
      subscription,
      {
        context: new HttpContext().set(USE_TENANT_TOKEN, false) // Solo auth-token
      }
    );
  }

  getAllTenants():Observable<AllTenantsResponse>{
    return this.Http.get<AllTenantsResponse>(`${this.ApiUrl}/tenant`,{
      context: new HttpContext().set(USE_TENANT_TOKEN, false) 
    })
  }
}
