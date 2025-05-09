// organization/services/event-form.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventFormService {
  // BehaviorSubjects para los formularios
  private basicInfoFormSubject = new BehaviorSubject<FormGroup>(null!);
  private schedulingFormSubject = new BehaviorSubject<FormGroup>(null!);
  private locationFormSubject = new BehaviorSubject<FormGroup>(null!);
  private mediaFormSubject = new BehaviorSubject<FormGroup>(null!);
  
  // BehaviorSubject para el archivo de imagen
  private imageFileSubject = new BehaviorSubject<File | null>(null);
  
  // BehaviorSubjects para la validez de los formularios
  private basicInfoValidSubject = new BehaviorSubject<boolean>(false);
  private schedulingValidSubject = new BehaviorSubject<boolean>(false);
  private locationValidSubject = new BehaviorSubject<boolean>(false);
  private mediaValidSubject = new BehaviorSubject<boolean>(false);
  
  // Observables públicos
  basicInfoForm$ = this.basicInfoFormSubject.asObservable();
  schedulingForm$ = this.schedulingFormSubject.asObservable();
  locationForm$ = this.locationFormSubject.asObservable();
  mediaForm$ = this.mediaFormSubject.asObservable();
  imageFile$ = this.imageFileSubject.asObservable();
  
  // Observables públicos para la validez
  basicInfoValid$ = this.basicInfoValidSubject.asObservable();
  schedulingValid$ = this.schedulingValidSubject.asObservable();
  locationValid$ = this.locationValidSubject.asObservable();
  mediaValid$ = this.mediaValidSubject.asObservable();

  constructor() {}

  // Métodos para establecer los formularios
  setBasicInfoForm(form: FormGroup): void {
    this.basicInfoFormSubject.next(form);
    this.basicInfoValidSubject.next(form.valid);
  }

  setSchedulingForm(form: FormGroup): void {
    this.schedulingFormSubject.next(form);
    this.schedulingValidSubject.next(form.valid);
  }

  setLocationForm(form: FormGroup): void {
    this.locationFormSubject.next(form);
    this.locationValidSubject.next(form.valid);
  }

  setMediaForm(form: FormGroup): void {
    this.mediaFormSubject.next(form);
    this.mediaValidSubject.next(form.valid);
  }
  
  // Método para establecer el archivo de imagen
  setImageFile(file: File | null): void {
    this.imageFileSubject.next(file);
  }
  
  // Método para notificar cambios en la validez de los formularios
  notifyFormValidityChange(formName: string, isValid: boolean): void {
    switch (formName) {
      case 'basicInfo':
        this.basicInfoValidSubject.next(isValid);
        break;
      case 'scheduling':
        this.schedulingValidSubject.next(isValid);
        break;
      case 'location':
        this.locationValidSubject.next(isValid);
        break;
      case 'media':
        this.mediaValidSubject.next(isValid);
        break;
    }
  }
  
  // Método para resetear todos los formularios
  resetForms(): void {
    const basicInfoForm = this.basicInfoFormSubject.value;
    const schedulingForm = this.schedulingFormSubject.value;
    const locationForm = this.locationFormSubject.value;
    const mediaForm = this.mediaFormSubject.value;
    
    if (basicInfoForm) basicInfoForm.reset();
    if (schedulingForm) schedulingForm.reset();
    if (locationForm) locationForm.reset();
    if (mediaForm) mediaForm.reset();
    
    this.imageFileSubject.next(null);
    
    this.basicInfoValidSubject.next(false);
    this.schedulingValidSubject.next(false);
    this.locationValidSubject.next(false);
    this.mediaValidSubject.next(false);
  }
}