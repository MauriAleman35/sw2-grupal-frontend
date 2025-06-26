import { Injectable } from "@angular/core";
import { environment } from "../../environments/environments";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { VerifyTicketParams, VerifyTicketResponse } from "../interfaces/verify";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrganizationVerificationService {
    private ApiUrl:string=environment.apiUrl;
    constructor(private Http:HttpClient) { }

    VerifyTicket(
    data: VerifyTicketParams,
    authToken: string,
    tenantToken: string
  ): Observable<VerifyTicketResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'auth-token': authToken,
      'tenant-token': tenantToken
    });

    return this.Http.post<VerifyTicketResponse>(
      `${this.ApiUrl}/ticket/validate`,
      data,
      { headers }
    );
  }
}