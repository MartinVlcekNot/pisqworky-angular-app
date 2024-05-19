import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumStrictComponent } from './input-num-strict.component';

describe('InputNumStrictComponent', () => {
  let component: InputNumStrictComponent;
  let fixture: ComponentFixture<InputNumStrictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputNumStrictComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputNumStrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
