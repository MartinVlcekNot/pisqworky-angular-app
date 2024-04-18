import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBoxShComponent } from './input-box-sh.component';

describe('InputBoxShComponent', () => {
  let component: InputBoxShComponent;
  let fixture: ComponentFixture<InputBoxShComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputBoxShComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputBoxShComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
