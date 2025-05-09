import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacultyDeleteResponse, FacultyParams, FacultyPostResponse, FacultyResponse, FacultyUpdateResponse} from '../interfaces/faculty';
import { USE_TENANT_TOKEN } from '../../context/tenant-token.context';
import { Event, EventsResponse, GetByIDResponse } from '../interfaces/events';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private ApiUrl:string=environment.apiUrl;

  constructor(private Http:HttpClient) { }

  //Facultades
  getAllFaculty():Observable<FacultyResponse>{
    return this.Http.get<FacultyResponse>(`${this.ApiUrl}/faculty`, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }

  createFaculty(Faculty:FacultyParams):Observable<FacultyPostResponse>{
    return this.Http.post<FacultyPostResponse>(`${this.ApiUrl}/faculty`,Faculty, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }

   updateFaculty(id:string,Faculty:Partial<FacultyParams>):Observable<FacultyUpdateResponse>{
    return this.Http.patch<FacultyUpdateResponse>(`${this.ApiUrl}/faculty/${id}`,Faculty, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }
  deleteFaculty(id:string):Observable<FacultyDeleteResponse>{
    return this.Http.delete<FacultyDeleteResponse>(`${this.ApiUrl}/faculty/${id}`, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }

  //Eventos
  getAllEvents():Observable<EventsResponse>{
    return this.Http.get<EventsResponse>(`${this.ApiUrl}/event`, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }
  getByIdEvent(id:string):Observable<GetByIDResponse>{
    return this.Http.get<GetByIDResponse>(`${this.ApiUrl}/event/${id}`, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )

  }
  createEvent(event:Event):Observable<FacultyPostResponse>{
     const formData = new FormData();
    formData.append('title', event.title);
    formData.append('description', event.description);
    formData.append('start_date', event.start_date);
    formData.append('end_date', event.end_date);
    formData.append('address', event.address);
    formData.append('facultyId', event.facultyId);

    if (event.image) {
       formData.append('image', event.image);
    }

    return this.Http.post<FacultyPostResponse>(`${this.ApiUrl}/event`,event, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }
  //Mejorar con el type de la respuesta
   updateEvent(id:string,Event:Partial<any>):Observable<any>{
    return this.Http.patch<any>(`${this.ApiUrl}/faculty/${id}`,Event, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
   }
    deleteEvent(id:string):Observable<any>{
    return this.Http.delete<any>(`${this.ApiUrl}/event/${id}`, {
            context: new HttpContext().set(USE_TENANT_TOKEN, true) 
          }
    )
  }
}
