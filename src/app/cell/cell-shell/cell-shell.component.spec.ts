import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellShellComponent } from './cell-shell.component';

describe('CellShellComponent', () => {
  let component: CellShellComponent;
  let fixture: ComponentFixture<CellShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CellShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CellShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
