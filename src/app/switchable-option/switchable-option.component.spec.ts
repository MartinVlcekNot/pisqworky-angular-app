import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchableOptionComponent } from './switchable-option.component';

describe('SwitchableOptionComponent', () => {
  let component: SwitchableOptionComponent;
  let fixture: ComponentFixture<SwitchableOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwitchableOptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SwitchableOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
