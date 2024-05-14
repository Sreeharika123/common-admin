import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenusComponent } from './add-menus.component';

describe('AddMenusComponent', () => {
  let component: AddMenusComponent;
  let fixture: ComponentFixture<AddMenusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMenusComponent]
    });
    fixture = TestBed.createComponent(AddMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
