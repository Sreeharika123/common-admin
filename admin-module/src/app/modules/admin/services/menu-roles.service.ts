import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuRolesService {
  constructor(private http: HttpClient) { }
  //service to get menus based on roleID
  getMenusbyRoleID(roleID: number) {
    return this.http.get(`${environment.apiUrl}` + '/MenuRoles/Get?roleID=' + roleID);
  }
  //service to save or update menus by roleID
  saveOrUpdateMenus(roleID: number, menuData: any,fromScreen:string) {
    return this.http.post(
      `${environment.apiUrl}` + '/MenuRoles/Post?roleID=' + roleID,
      { menuRolesDetailsCollection: menuData , fromScreen:fromScreen }
    );
  }
}
