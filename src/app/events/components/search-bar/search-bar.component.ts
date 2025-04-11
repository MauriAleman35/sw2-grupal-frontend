import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Faculty {
  id: number;
  name: string;
}

interface SearchFilters {
  searchTerm: string;
  facultyId: number | null;
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
export class SearchBarComponent {
  @Input() faculties: Faculty[] = [];
  @Output() search = new EventEmitter<SearchFilters>();
  @Output() reset = new EventEmitter<void>();

  searchTerm: string = '';
  selectedFaculty: number | null = null;
  selectedDate: Date | null = null;

  applyFilters(): void {
    this.search.emit({
      searchTerm: this.searchTerm,
      facultyId: this.selectedFaculty,
      date: this.selectedDate
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedFaculty = null;
    this.selectedDate = null;
    this.reset.emit();
  }
}
