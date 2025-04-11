import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Event {
  id: number;
  title: string;
  date: Date;
  location: string;
  faculty: string;
  imageUrl: string;
  price: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  @Input() events: Event[] = [];
  @Output() eventSelected = new EventEmitter<number>();
  
  currentIndex = 0;
  interval: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.interval = setInterval(() => {
      this.next();
    }, 5000); // Cambiar cada 5 segundos
  }

  stopAutoSlide(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  select(index: number): void {
    this.currentIndex = index;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.events.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.events.length) % this.events.length;
  }

  selectEvent(eventId: number): void {
    this.eventSelected.emit(eventId);
  }
}