import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, of, shareReplay, take, tap } from 'rxjs';
import { CreateTicketsSection, DatumSectionAll, DatumSectionByEvent, GetByIDResponse, SectionByEventResponse, SectionPostResponse, SectionResponse, UpdateSectionResponse, } from '../interfaces/section';
import { USE_TENANT_TOKEN } from '../../context/tenant-token.context';



@Injectable({
  providedIn: 'root'
})
export class OrganizationSectionService {
  private ApiUrl:string=environment.apiUrl;

  private loadingSubject=new BehaviorSubject<boolean>(false);

  private sectionsSubject=new BehaviorSubject<DatumSectionAll[]>([]);
  private sectionsByEventSubject=new BehaviorSubject<DatumSectionByEvent[]>([]);
  private SectionCache: Map<string, any> = new Map();

  public sections$=this.sectionsSubject.asObservable();
  public sectionsByEvent$=this.sectionsByEventSubject.asObservable();
  public loading$=this.loadingSubject.asObservable();
  
  constructor(private Http:HttpClient) { }
  
  getAllSectionsEvents(force=false):Observable<SectionResponse>{
    
    this.loadingSubject.next(true);

    return this.Http.get<SectionResponse>(`${this.ApiUrl}/section`, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              }).pipe(tap(res=>{
                if(res.statusCode==200){
                   this.sectionsSubject.next(res.data);
                }
                this.loadingSubject.next(false)
                  shareReplay(1)
              }))
  }
  getByIdSection(sectionId:string):Observable<GetByIDResponse>{
    return this.Http.get<GetByIDResponse>(`${this.ApiUrl}/section/${sectionId}`, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              })
  }
  getSectionByEvent(eventId:string,force=false):Observable<SectionByEventResponse>{
    this.loadingSubject.next(true);
    if(this.SectionCache.has(eventId) && !force){
      return of(this.SectionCache.get(eventId));
    }
    return this.Http.get<SectionByEventResponse>(`${this.ApiUrl}/section/event/${eventId}`, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              }).pipe(tap(res=>{
                if(res.statusCode==200){
                  this.sectionsByEventSubject.next(res.data);
                  //this.SectionCache.set(eventId,res);
                }
                this.loadingSubject.next(false)
                    shareReplay(1)
              }))
  }
  createSection(Section:any):Observable<SectionPostResponse>{
    return this.Http.post<SectionPostResponse>(`${this.ApiUrl}/section`,Section, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              }).pipe(tap(res=>{
                if(res.statusCode==200){
                  const currentSections=this.sectionsSubject.getValue();
                  this.sectionsSubject.next([...currentSections,res.data]);
                }
              }))
  }
  deleteSection(sectionId:string):Observable<any>{
    return this.Http.delete<SectionPostResponse>(`${this.ApiUrl}/section/${sectionId}`, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              }).pipe(tap(res=>{
                if(res.statusCode==200){
                  const currentSections=this.sectionsSubject.getValue();
                  const updatedSections=currentSections.filter(section=>section.id!==sectionId);
                  this.sectionsSubject.next(updatedSections);
                }
              }))
  }
 
  createTicketsSection(sectionId: string, quantity: number = 1): Observable<CreateTicketsSection> {
  // Creamos los parámetros de consulta
  const params = new HttpParams().set('quantity', quantity.toString());
  
  return this.Http.post<CreateTicketsSection>(
    `${this.ApiUrl}/section/${sectionId}/tickets`, 
    {}, // Cuerpo vacío
    { 
      context: new HttpContext().set(USE_TENANT_TOKEN, true),
      params: params // Añadimos los parámetros de consulta
    }
  );
}
  updateSection(sectionId:string,section:any):Observable<UpdateSectionResponse>{
    return this.Http.patch<UpdateSectionResponse>(`${this.ApiUrl}/section/${sectionId}`,section, {
                context: new HttpContext().set(USE_TENANT_TOKEN, true) 
              }).pipe(tap(res=>{
                if(res.statusCode==200){
                  const currentSections=this.sectionsSubject.getValue();
                  const updatedSections=currentSections.map(section=>{
                    if(section.id===sectionId){
                      return res.data;
                    }
                    return section;
                  })
                  this.sectionsSubject.next(updatedSections);
                }
              }))
  }
  clearCache():void{
    this.SectionCache.clear();
  }
}
