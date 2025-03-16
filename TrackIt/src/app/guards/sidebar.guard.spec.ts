import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sidebarGuard } from './sidebar.guard';

describe('sidebarGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sidebarGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
