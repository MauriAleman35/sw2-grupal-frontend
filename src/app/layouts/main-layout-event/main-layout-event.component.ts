import { Component } from '@angular/core';
import { FooterComponent } from '../../events/components/footer/footer.component';
import { HeaderComponent } from '../../events/components/header/header.component';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout-event',
  standalone: true,
  imports: [FooterComponent,HeaderComponent,RouterOutlet,RouterModule],
  templateUrl: './main-layout-event.component.html',
  styleUrl: './main-layout-event.component.css'
})
export class MainLayoutEventComponent {

}
