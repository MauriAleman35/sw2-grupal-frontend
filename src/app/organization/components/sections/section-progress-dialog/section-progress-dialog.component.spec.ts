import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionProgressDialogComponent } from './section-progress-dialog.component';

describe('SectionProgressDialogComponent', () => {
  let component: SectionProgressDialogComponent;
  let fixture: ComponentFixture<SectionProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionProgressDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
