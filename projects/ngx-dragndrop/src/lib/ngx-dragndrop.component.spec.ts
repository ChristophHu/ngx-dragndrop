import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDragndropComponent } from './ngx-dragndrop.component';

describe('NgxDragndropComponent', () => {
  let component: NgxDragndropComponent;
  let fixture: ComponentFixture<NgxDragndropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDragndropComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxDragndropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
