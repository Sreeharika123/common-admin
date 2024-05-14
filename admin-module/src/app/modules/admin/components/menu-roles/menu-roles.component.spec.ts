import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRolesComponent } from './menu-roles.component';

describe('MenuRolesComponent', () => {
  let component: MenuRolesComponent;
  let fixture: ComponentFixture<MenuRolesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuRolesComponent]
    });
    fixture = TestBed.createComponent(MenuRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
