import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsTermsConditionsComponent } from './events-terms-conditions.component';

describe('EventsTermsConditionsComponent', () => {
  let component: EventsTermsConditionsComponent;
  let fixture: ComponentFixture<EventsTermsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsTermsConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsTermsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
