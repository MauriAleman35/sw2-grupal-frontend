import { Component, Output, EventEmitter, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-picker.component.html',
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 400px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    
    .map-container {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
    }
    
    .map-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(245, 245, 245, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .map-overlay button {
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class LocationPickerComponent implements AfterViewInit, OnDestroy {
  @Output() locationSelected = new EventEmitter<{ lat: number, lng: number, address: string }>();
  
  mapLoaded = false;
  private map: any = null;
  private marker: any = null;
  private leaflet: any = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Cargar Leaflet dinámicamente
    this.loadLeaflet();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private loadLeaflet(): void {
    // Verificar si Leaflet ya está cargado
    if (window.L) {
      this.leaflet = window.L;
      this.initMap();
      return;
    }

    // Cargar el CSS de Leaflet
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkElement);

    // Cargar el script de Leaflet
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptElement.onload = () => {
      this.leaflet = window.L;
      this.initMap();
    };
    document.head.appendChild(scriptElement);
  }

  private initMap(): void {
    if (!this.leaflet || this.map || this.retryCount >= this.maxRetries) return;

    try {
      const mapContainer = document.getElementById('leaflet-map');
      if (!mapContainer || mapContainer.clientWidth === 0) {
        // El contenedor no está listo, intentar de nuevo
        this.retryCount++;
        setTimeout(() => this.initMap(), 500);
        return;
      }

      // Coordenadas por defecto (Santa Cruz, Bolivia)
      const defaultLat = -17.78629;
      const defaultLng = -63.18117;

      // Crear mapa con opciones básicas
      this.ngZone.runOutsideAngular(() => {
        this.map = this.leaflet.map('leaflet-map', {
          center: [defaultLat, defaultLng],
          zoom: 15,
          zoomControl: true,
          attributionControl: false
        });

        // Añadir capa de mapa
        this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Crear un icono personalizado para el marcador
        const redIcon = this.leaflet.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41]
        });

        // Añadir marcador
        this.marker = this.leaflet.marker([defaultLat, defaultLng], {
          draggable: true,
          icon: redIcon
        }).addTo(this.map);

        // Eventos del marcador
        this.marker.on('dragend', () => {
          const pos = this.marker.getLatLng();
          this.ngZone.run(() => {
            this.updateLocation(pos.lat, pos.lng);
          });
        });

        // Eventos del mapa
        this.map.on('click', (e: any) => {
          this.marker.setLatLng(e.latlng);
          this.ngZone.run(() => {
            this.updateLocation(e.latlng.lat, e.latlng.lng);
          });
        });

        // Forzar recálculo de tamaño
        setTimeout(() => {
          this.map.invalidateSize(true);
          this.ngZone.run(() => {
            this.mapLoaded = true;
            this.updateLocation(defaultLat, defaultLng);
          });
        }, 300);
      });

    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      this.mapLoaded = false;
    }
  }

  public forceInitMap(): void {
    this.retryCount = 0;
    this.initMap();
  }

  public setCurrentLocation(): void {
    if (!this.mapLoaded || !this.map) {
      this.forceInitMap();
      setTimeout(() => this.getCurrentLocationInternal(), 500);
      return;
    }
    this.getCurrentLocationInternal();
  }

  // NUEVO MÉTODO: Establecer ubicación por coordenadas
  public setLocation(lat: number, lng: number): void {
    console.log('Setting location to:', { lat, lng });
    if (!this.mapLoaded || !this.map || !this.marker) {
      // Si el mapa no está cargado, intenta inicializarlo y vuelve a intentar
      console.log('Map not ready, forcing init...');
      this.forceInitMap();
      setTimeout(() => this.setLocationInternal(lat, lng), 800);
      return;
    }
    this.setLocationInternal(lat, lng);
  }

  // NUEVO MÉTODO: Implementación interna para establecer ubicación
  private setLocationInternal(lat: number, lng: number): void {
    if (!this.map || !this.marker) {
      console.warn('Map or marker not initialized');
      return;
    }
    
    console.log('Setting map view to:', { lat, lng });
    this.map.setView([lat, lng], 15);
    this.marker.setLatLng([lat, lng]);
    this.updateLocation(lat, lng);
  }

  // NUEVO MÉTODO: Geocodificar dirección y actualizar mapa
  public geocodeAndSetLocation(address: string): void {
    if (!address) return;
    
    console.log('Geocodificando dirección:', address);
    
    this.getAddressCoordinates(address).then(coords => {
      if (coords) {
        console.log('Coordenadas obtenidas para la dirección:', coords);
        this.setLocation(coords.lat, coords.lng);
      } else {
        console.warn('No se pudieron obtener coordenadas para:', address);
      }
    });
  }

  // NUEVO MÉTODO: Obtener coordenadas para una dirección
  private async getAddressCoordinates(address: string): Promise<{lat: number, lng: number} | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
      return null;
    }
  }

  private getCurrentLocationInternal(): void {
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (this.map && this.marker) {
          this.map.setView([lat, lng], 15);
          this.marker.setLatLng([lat, lng]);
          this.updateLocation(lat, lng);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación');
      }
    );
  }

  private updateLocation(lat: number, lng: number): void {
    this.getAddress(lat, lng).then(address => {
      this.locationSelected.emit({ lat, lng, address });
    });
  }

  private async getAddress(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await response.json();
      
      const country = data.address?.country || '';
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      let street = data.address?.road || '';
      if (data.address?.house_number) {
        street += ` ${data.address.house_number}`;
      }
      
      return `${country}, ${city}, ${street}`.replace(/^, |, $/g, '');
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      return 'Dirección no disponible';
    }
  }
}