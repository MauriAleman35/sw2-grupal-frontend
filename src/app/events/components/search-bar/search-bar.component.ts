import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Faculty } from '../../../organization/interfaces/events';

interface SearchFilters {
  searchTerm: string;
  facultyId: string;
  date: Date | null;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnChanges {
  @Input() faculties: Faculty[] = [];
  @Output() search = new EventEmitter<SearchFilters>();
  @Output() reset = new EventEmitter<void>();

  searchTerm: string = '';
  selectedFaculty: string = '';
  selectedDate: Date | null = null;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['faculties'] && this.faculties.length > 0) {
      console.log('Facultades disponibles en búsqueda:', this.faculties);
    }
  }

  applyFilters(): void {
    console.log('Aplicando filtros:', {
      searchTerm: this.searchTerm,
      facultyId: this.selectedFaculty,
      date: this.selectedDate
    });
    
    this.search.emit({
      searchTerm: this.searchTerm,
      facultyId: this.selectedFaculty,
      date: this.selectedDate
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedFaculty = '';
    this.selectedDate = null;
    this.reset.emit();
  }
}