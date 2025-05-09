import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

interface FacultyFormData {
  mode: 'create' | 'edit';
  faculty?: any;
}

@Component({
  selector: 'app-faculty-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './faculty-form.component.html',
  styleUrls: ['./faculty-form.component.css']
})
export class FacultyFormComponent implements OnInit {
  facultyForm!: FormGroup;
  isEditMode: boolean = false;
  dialogTitle: string = 'Crear Nueva Facultad';
  submitButtonText: string = 'Crear';
  
  // Colores predefinidos para elegir
  colorOptions: string[] = [
    '#d4a017', // Dorado (color principal)
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#8b5cf6', // Púrpura
    '#ef4444', // Rojo
    '#f59e0b', // Naranja
    '#6b7280', // Gris
    '#1e40af'  // Azul oscuro
  ];
  
  selectedColor: string = this.colorOptions[0];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FacultyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FacultyFormData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.dialogTitle = this.isEditMode ? 'Editar Facultad' : 'Crear Nueva Facultad';
    this.submitButtonText = this.isEditMode ? 'Guardar Cambios' : 'Crear';
    
    if (this.isEditMode && data.faculty) {
      this.selectedColor = data.faculty.color || this.colorOptions[0];
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const faculty = this.isEditMode ? this.data.faculty : null;
    
    this.facultyForm = this.fb.group({
      name: [faculty?.name || '', [Validators.required, Validators.maxLength(100)]],

      location: [faculty?.location || '', [Validators.required, Validators.maxLength(250)]],
     
      color: [faculty?.color || this.colorOptions[0], [Validators.required]]
    });
  }

  // Método para obtener las iniciales del nombre de la facultad
  getFacultyInitials(): string {
    const name = this.facultyForm.get('name')?.value;
    if (!name) return 'FI';
    
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Método para obtener el nombre de la facultad o un valor por defecto
  getFacultyName(): string {
    return this.facultyForm.get('name')?.value || 'Nombre de la Facultad';
  }

  // Método para obtener el código de la facultad o un valor por defecto
  getFacultyCode(): string {
    return this.facultyForm.get('code')?.value || 'Código';
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.facultyForm.get('color')?.setValue(color);
  }

  onSubmit(): void {
    if (this.facultyForm.valid) {
      this.dialogRef.close(this.facultyForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}