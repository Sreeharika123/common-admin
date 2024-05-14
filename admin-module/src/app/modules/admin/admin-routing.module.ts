import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuRolesComponent } from './components/menu-roles/menu-roles.component';
import { MenusComponent } from './components/menus/menus.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { RolesComponent } from './components/roles/roles.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  { path: 'menus', component: MenusComponent, data: { title: 'Menus' } },
  { path: 'menuroles', component: MenuRolesComponent, data: { title: 'MenuRoles' } },
  { path: 'userroles', component: UserRolesComponent, data: { title: 'UserRoles' } },
  { path:'roles',component:RolesComponent, data:{title: 'Roles'}},
  { path:'changepassword',component:ChangePasswordComponent, data:{title: 'Change Password'}},
  { path: 'users', component: UsersComponent ,data: { title: 'Users' }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
