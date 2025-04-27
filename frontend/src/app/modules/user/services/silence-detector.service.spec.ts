import { TestBed } from '@angular/core/testing';

import { SilenceDetectorService } from './silence-detector.service';

describe('SilenceDetectorService', () => {
  let service: SilenceDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SilenceDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
