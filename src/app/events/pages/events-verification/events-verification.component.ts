import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { EventsService } from '../../services/events.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-identity-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './events-verification.component.html',
  styleUrls: ['./events-verification.component.css']
})
export class EventsVerificationComponent implements OnInit, OnDestroy {
  @ViewChild('ciFrontalInput') ciFrontalInput!: ElementRef;
  @ViewChild('ciBackInput') ciBackInput!: ElementRef;
  @ViewChild('selfieInput') selfieInput!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  eventId: string = '';
  quantity: number = 0;
  returnUrl: string = '';
  
  currentStep = 1; // 1: instrucciones, 2: documento frontal, 3: documento reverso, 4: selfie, 5: procesando, 6: completado
  selectedOption = 'camera'; // 'camera' o 'upload'
  
  ciFrontalFile: File | null = null;
  ciBackFile: File | null = null;
  selfieFile: File | null = null;
  
  ciFrontalPreview: string | null = null;
  ciBackPreview: string | null = null;
  selfiePreview: string | null = null;
  
  processing = false;
  verificationSuccess = false;
  error = false;
  errorMessage = '';
  
  // Variables para la cámara
  stream: MediaStream | null = null;
  isCameraOpen = false;
  isMobile = false;
  hasCameraPermission = false;
  cameraError = '';
  captureCountdown = 0;
  countdownInterval: any = null;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private eventsService: EventsService
  ) {}
  
  ngOnInit(): void {
    // Detectar si es dispositivo móvil
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    this.route.queryParams.subscribe(params => {
      this.eventId = params['eventId'] || '';
      this.quantity = parseInt(params['quantity'] || '0', 10);
      this.returnUrl = params['returnUrl'] || '/';
      
      // Verificamos si no hay eventId o si quantity es 0 o menor
      if (!this.eventId || this.quantity <= 0) {
        this.handleError('Parámetros de verificación inválidos. Verifica que el ID del evento y la cantidad sean correctos.');
      } else {
        console.log(`Verificación iniciada: Evento ID=${this.eventId}, Cantidad=${this.quantity}`);
      }
    });
    
    // Configurar opción por defecto según el dispositivo
    if (this.isMobile) {
      this.selectedOption = 'camera'; // En móviles es más natural usar la cámara
    } else {
      this.selectedOption = 'upload'; // En escritorio puede ser más fácil subir archivos
    }
  }
  
  ngOnDestroy(): void {
    this.stopCamera();
    this.stopCountdown();
  }
  
  nextStep(): void {
    // Cerrar la cámara antes de cambiar de paso
    this.stopCamera();
    
    if (this.currentStep < 6) {
      this.currentStep++;
      
      // Si el siguiente paso requiere cámara y esa es la opción seleccionada, iniciarla
      if ((this.currentStep >= 2 && this.currentStep <= 4) && this.selectedOption === 'camera') {
        setTimeout(() => {
          this.startCamera();
        }, 300);
      }
    }
    
    // Si llegamos al paso de procesamiento, enviar los documentos
    if (this.currentStep === 5 && this.areFilesReady()) {
      this.processVerification();
    }
    
    // Desplazarse hacia arriba al cambiar de paso
    window.scrollTo(0, 0);
  }
  
  prevStep(): void {
    // Cerrar la cámara antes de cambiar de paso
    this.stopCamera();
    this.stopCountdown();
    
    if (this.currentStep > 1) {
      this.currentStep--;
      
      // Si el paso anterior requiere cámara y esa es la opción seleccionada, iniciarla
      if ((this.currentStep >= 2 && this.currentStep <= 4) && this.selectedOption === 'camera') {
        setTimeout(() => {
          this.startCamera();
        }, 300);
      }
    }
    
    // Desplazarse hacia arriba al cambiar de paso
    window.scrollTo(0, 0);
  }
  
  changeOption(option: string): void {
    if (option === this.selectedOption) return;
    
    this.selectedOption = option;
    
    if (option === 'camera') {
      // Iniciar cámara si se selecciona esa opción
      this.startCamera();
    } else {
      // Detener cámara si se selecciona la opción de subir archivo
      this.stopCamera();
    }
  }
  
  // MÉTODOS DE CÁMARA
  async startCamera(): Promise<void> {
    if (this.isCameraOpen) return;
    
    // Limpiar errores previos
    this.cameraError = '';
    
    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.cameraError = 'Tu navegador no soporta el acceso a la cámara';
      this.snackBar.open(this.cameraError, 'Cerrar', { duration: 5000 });
      this.selectedOption = 'upload';
      return;
    }
    
    try {
      // Solicitar acceso a la cámara
      const facingMode = this.currentStep === 4 ? 'user' : 'environment';
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.isCameraOpen = true;
        this.hasCameraPermission = true;
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      this.cameraError = 'No se pudo acceder a la cámara. Por favor, permite el acceso o usa la opción para subir una imagen.';
      this.snackBar.open(this.cameraError, 'Cerrar', { duration: 5000 });
      this.selectedOption = 'upload';
    }
  }
  
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
    
    this.isCameraOpen = false;
  }
  
  switchCamera(): void {
    this.stopCamera();
    setTimeout(() => {
      this.startCamera();
    }, 300);
  }
  
  capturePhoto(): void {
    if (!this.isCameraOpen || !this.videoElement || !this.canvas) {
      this.snackBar.open('La cámara no está disponible', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Iniciar cuenta regresiva
    this.startCountdown();
  }
  
  startCountdown(): void {
    this.stopCountdown(); // Detener cualquier cuenta regresiva anterior
    this.captureCountdown = 3;
    
    this.countdownInterval = setInterval(() => {
      this.captureCountdown--;
      
      if (this.captureCountdown <= 0) {
        this.stopCountdown();
        this.takeSnapshot();
      }
    }, 1000);
  }
  
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.captureCountdown = 0;
  }
  
  takeSnapshot(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvas.nativeElement;
    
    // Ajustar el tamaño del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el fotograma actual del video en el canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir la imagen a base64 y preparar el archivo
      canvas.toBlob((blob) => {
        if (blob) {
          // Crear un archivo a partir del blob
          const now = new Date();
          const fileName = `photo_${now.getTime()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          
          // Asignar el archivo según el paso actual
          if (this.currentStep === 2) {
            this.ciFrontalFile = file;
            this.ciFrontalPreview = canvas.toDataURL('image/jpeg');
            this.snackBar.open('Foto frontal del CI capturada', 'Cerrar', { duration: 2000 });
          } else if (this.currentStep === 3) {
            this.ciBackFile = file;
            this.ciBackPreview = canvas.toDataURL('image/jpeg');
            this.snackBar.open('Foto trasera del CI capturada', 'Cerrar', { duration: 2000 });
          } else if (this.currentStep === 4) {
            this.selfieFile = file;
            this.selfiePreview = canvas.toDataURL('image/jpeg');
            this.snackBar.open('Selfie capturada', 'Cerrar', { duration: 2000 });
          }
        }
      }, 'image/jpeg', 0.95);
    }
  }
  
  // MÉTODOS DE CARGA DE ARCHIVOS
  openFileSelector(type: 'ciFrontal' | 'ciBack' | 'selfie'): void {
    if (type === 'ciFrontal' && this.ciFrontalInput) {
      this.ciFrontalInput.nativeElement.click();
    } else if (type === 'ciBack' && this.ciBackInput) {
      this.ciBackInput.nativeElement.click();
    } else if (type === 'selfie' && this.selfieInput) {
      this.selfieInput.nativeElement.click();
    }
  }
  
  handleFileChange(event: Event, type: 'ciFrontal' | 'ciBack' | 'selfie'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Verificar tamaño y tipo de archivo
      if (file.size > 10 * 1024 * 1024) { // Limitar a 10MB
        this.snackBar.open('El archivo es demasiado grande. Máximo 10MB.', 'Cerrar', { duration: 3000 });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Por favor selecciona un archivo de imagen válido.', 'Cerrar', { duration: 3000 });
        return;
      }
      
      // Asignar archivo según el tipo
      if (type === 'ciFrontal') {
        this.ciFrontalFile = file;
        this.createImagePreview(file, 'ciFrontal');
      } else if (type === 'ciBack') {
        this.ciBackFile = file;
        this.createImagePreview(file, 'ciBack');
      } else if (type === 'selfie') {
        this.selfieFile = file;
        this.createImagePreview(file, 'selfie');
      }
    }
  }
  
  createImagePreview(file: File, type: 'ciFrontal' | 'ciBack' | 'selfie'): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'ciFrontal') {
        this.ciFrontalPreview = e.target?.result as string;
      } else if (type === 'ciBack') {
        this.ciBackPreview = e.target?.result as string;
      } else if (type === 'selfie') {
        this.selfiePreview = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
  
  areFilesReady(): boolean {
    return !!(this.ciFrontalFile && this.ciBackFile && this.selfieFile);
  }
  
  // MÉTODOS DE VERIFICACIÓN Y NAVEGACIÓN
  processVerification(): void {
    if (!this.areFilesReady()) {
      this.snackBar.open('Por favor, sube todas las imágenes requeridas', 'Cerrar', { duration: 3000 });
      return;
    }
    
    if (!this.eventId) {
      this.handleError('ID del evento no disponible. No se puede procesar la verificación.');
      return;
    }
    
    this.processing = true;
    
    console.log(`Enviando verificación para el evento: ${this.eventId}`);
    
    this.eventsService.identityVerificationProcess(
      this.ciFrontalFile!, 
      this.ciBackFile!, 
      this.selfieFile!,
      this.eventId
    ).subscribe({
      next: (response) => {
        console.log('Verificación procesada:', response);
        
        if (response.data && response.data.faceMatch) {
          this.verificationSuccess = true;
          this.currentStep = 6; // Avanzar al paso final
          
          // Guardar en localStorage que la verificación fue exitosa para este eventId
          localStorage.setItem(`verified_event_${this.eventId}`, 'true');
          
          // Agregamos un flag para indicar que la verificación está completa para este evento
          localStorage.setItem('verification_complete', 'true');
          
          setTimeout(() => {
            // Redirigir de vuelta al flujo de compra después de 3 segundos
            this.navigateBack();
          }, 3000);
        } else {
          this.handleError('La verificación no fue exitosa. Las imágenes no coinciden o son de baja calidad.');
        }
        
        this.processing = false;
      },
      error: (error) => {
        console.error('Error en la verificación de identidad:', error);
        this.handleError('Ocurrió un error al procesar tu verificación. Por favor intenta nuevamente.');
        this.processing = false;
      }
    });
  }
  
  handleError(message: string): void {
    this.error = true;
    this.errorMessage = message;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  
  // CLAVE: Método modificado para redirigir correctamente después de verificación
  navigateBack(): void {
    console.log("Redirigiendo a:", this.returnUrl);
    
    // Crear una URL con parámetros de verificación
    const urlWithParams = new URL(window.location.origin + this.returnUrl);
    
    // Añadir parámetros que indican que venimos de una verificación exitosa
    urlWithParams.searchParams.set('verification_complete', 'true');
    urlWithParams.searchParams.set('eventId', this.eventId);
    urlWithParams.searchParams.set('fromVerification', 'true');
    urlWithParams.searchParams.set('timestamp', new Date().getTime().toString());
    
    console.log("URL completa de redirección:", urlWithParams.toString());
    
    // Navegar a la URL con los parámetros
    window.location.href = urlWithParams.toString();
  }
  
  retryVerification(): void {
    // Reiniciar el estado
    this.error = false;
    this.errorMessage = '';
    this.ciFrontalFile = null;
    this.ciBackFile = null;
    this.selfieFile = null;
    this.ciFrontalPreview = null;
    this.ciBackPreview = null;
    this.selfiePreview = null;
    this.currentStep = 1;
    this.stopCamera();
  }
  
  // Obtener el texto adecuado según el paso actual
  getCurrentStepText(): string {
    switch (this.currentStep) {
      case 2: return 'Parte frontal del CI';
      case 3: return 'Parte trasera del CI';
      case 4: return 'Selfie';
      default: return '';
    }
  }
  
  // Obtener recomendaciones según el paso actual
  getCurrentRecommendations(): string[] {
    switch (this.currentStep) {
      case 2:
      case 3:
        return [
          'Asegúrate que el documento sea legible',
          'Toda la información debe ser visible',
          'Evita reflejos de luz o sombras',
          'La imagen debe estar enfocada'
        ];
      case 4:
        return [
          'Asegúrate que tu rostro sea claramente visible',
          'Mira directamente a la cámara',
          'Utiliza un fondo sencillo y buena iluminación',
          'No uses lentes de sol, gorras u otros accesorios que cubran tu rostro'
        ];
      default:
        return [];
    }
  }
  
  // NUEVOS MÉTODOS PARA REEMPLAZAR LÓGICA COMPLEJA EN EL HTML
  resetCiFrontal(): void {
    this.ciFrontalFile = null;
    this.ciFrontalPreview = null;
  }
  
  resetCiBack(): void {
    this.ciBackFile = null;
    this.ciBackPreview = null;
  }
  
  resetSelfie(): void {
    this.selfieFile = null;
    this.selfiePreview = null;
  }
  
  resetCurrentImage(): void {
    if (this.currentStep === 2) {
      this.resetCiFrontal();
    } else if (this.currentStep === 3) {
      this.resetCiBack();
    } else if (this.currentStep === 4) {
      this.resetSelfie();
    }
  }
  
  getCurrentImagePreview(): string | null {
    if (this.currentStep === 2) {
      return this.ciFrontalPreview;
    } else if (this.currentStep === 3) {
      return this.ciBackPreview;
    } else if (this.currentStep === 4) {
      return this.selfiePreview;
    }
    return null;
  }
  
  openCurrentFileSelector(): void {
    if (this.currentStep === 2) {
      this.openFileSelector('ciFrontal');
    } else if (this.currentStep === 3) {
      this.openFileSelector('ciBack');
    } else if (this.currentStep === 4) {
      this.openFileSelector('selfie');
    }
  }
  
  isCurrentStepImageMissing(): boolean {
    if (this.currentStep === 2) {
      return !this.ciFrontalFile;
    } else if (this.currentStep === 3) {
      return !this.ciBackFile;
    } else if (this.currentStep === 4) {
      return !this.selfieFile;
    }
    return false;
  }
}