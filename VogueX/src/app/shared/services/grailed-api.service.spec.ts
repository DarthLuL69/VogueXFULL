import { TestBed } from '@angular/core/testing';

import { GrailedApiService } from './grailed-api.service';

describe('GrailedApiService', () => {
  let service: GrailedApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrailedApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
