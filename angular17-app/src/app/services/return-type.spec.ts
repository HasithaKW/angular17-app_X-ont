import { TestBed } from '@angular/core/testing';

import { ReturnType } from './return-type';

describe('ReturnType', () => {
  let service: ReturnType;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReturnType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
