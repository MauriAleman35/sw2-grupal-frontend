import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  // Método para convertir dirección en coordenadas usando OpenStreetMap Nominatim
  geocodeAddress(address: string): Observable<{lat: number, lng: number} | null> {
    if (!address || address.trim() === '') {
      return of(null);
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    return this.http.get<any[]>(url).pipe(
      map(response => {
        if (response && response.length > 0) {
          return {
            lat: parseFloat(response[0].lat),
            lng: parseFloat(response[0].lon)
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error en geocodificación', error);
        return of(null);
      })
    );
  }
}