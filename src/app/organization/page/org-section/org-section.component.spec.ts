import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSectionComponent } from './org-section.component';

describe('OrgSectionComponent', () => {
  let component: OrgSectionComponent;
  let fixture: ComponentFixture<OrgSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
