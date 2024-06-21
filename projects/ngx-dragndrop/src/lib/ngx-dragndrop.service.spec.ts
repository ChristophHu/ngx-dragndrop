import { TestBed } from '@angular/core/testing';

import { NgxDragndropService } from './ngx-dragndrop.service';

describe('NgxDragndropService', () => {
  let service: NgxDragndropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxDragndropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
