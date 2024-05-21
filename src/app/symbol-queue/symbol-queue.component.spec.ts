import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolQueueComponent } from './symbol-queue.component';

describe('SymbolQueueComponent', () => {
  let component: SymbolQueueComponent;
  let fixture: ComponentFixture<SymbolQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SymbolQueueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SymbolQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
