import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { SubscriptionPostParams, SubscriptionPostResponse, SubscriptionResponse } from '../interfaces/subscription';
import { Observable } from 'rxjs';
import { USE_TENANT_TOKEN } from '../../context/tenant-token.context';
import { AllTenantsResponse } from '../interfaces/tenants';
import { GetAllEventsResponse, GetByIDEventResponse } from '../interfaces/events';
import { GetPurcharseByUserResponse, PostPurchaseByIDResponse, PostPurchaseParam, PostPurchaseResponse, VerifyPaymentResponse } from '../interfaces/purchase';

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

  getAllEvents(page:number=1, limit:number=10,facultyId?:string):Observable<GetAllEventsResponse>{
    const params=new HttpParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    params.set('facultyId', facultyId || '')
    return this.Http.get<GetAllEventsResponse>(`${this.ApiUrl}/public/event`,{
      params: params,
    })
  }

   getEventsId(page:1, limit:10,eventId:string):Observable<GetByIDEventResponse>{
    const params=new HttpParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
 
    return this.Http.get<GetByIDEventResponse>(`${this.ApiUrl}/public/event/${eventId}`,{
      params: params,
    })
  }

  getPurchaseByUser(): Observable<GetPurcharseByUserResponse> {
    return this.Http.get<GetPurcharseByUserResponse>(`${this.ApiUrl}/purchase/user/my-purchases`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, false) 
    });
  }

  //Purchases 

  postPurchase(purchase:PostPurchaseParam):Observable<PostPurchaseResponse>{
    return this.Http.post<PostPurchaseResponse>(`${this.ApiUrl}/purchase`, purchase, {
      context: new HttpContext().set(USE_TENANT_TOKEN, false) 
    });
  }

  postPurchaseById(paymentId:string):Observable<PostPurchaseByIDResponse>{
    return this.Http.post<PostPurchaseByIDResponse>(`${this.ApiUrl}/payment/purchase/${paymentId}`, {}, {
      context: new HttpContext().set(USE_TENANT_TOKEN, false) 
    });
  }
  VeryfyPayment(paymentId: string): Observable<VerifyPaymentResponse> {
    return this.Http.get<VerifyPaymentResponse>(`${this.ApiUrl}/payment/${paymentId}/verify`, {
      context: new HttpContext().set(USE_TENANT_TOKEN, false) 
    });
  }
 
}
