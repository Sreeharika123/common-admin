import { TestBed } from '@angular/core/testing';

import { MenuRolesService } from './menu-roles.service';

describe('MenuRolesService', () => {
  let service: MenuRolesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuRolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
