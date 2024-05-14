import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { MenuRolesComponent } from './components/menu-roles/menu-roles.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenusComponent } from './components/menus/menus.component';
import { AddMenusComponent } from './components/menus/add-menus/add-menus.component';
import { RolesComponent } from './components/roles/roles.component';
import { AddRolesComponent } from './components/roles/add-roles/add-roles.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { UsersComponent } from './components/users/users.component';
import { AddUsersComponent } from './components/users/add-users/add-users.component';




@NgModule({
  declarations: [
    MenuRolesComponent,
    UserRolesComponent,
    MenusComponent,
    AddMenusComponent,
    RolesComponent,
    AddRolesComponent,
    ChangePasswordComponent,
    UsersComponent,
    AddUsersComponent
  ],
  imports: [
    CommonModule,
    NgbTypeaheadModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule,

  ]
})
export class AdminModule { }
