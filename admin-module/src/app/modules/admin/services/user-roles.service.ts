import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRolesService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient) {}

  // service call to get UserRoles
  getEditRoles(UserRoleId: any) {
    const headers = { 'content-type': 'application/json' };
    return this.http.get(
      `${environment.apiUrl}/UserRoles/Edit?userID=` + UserRoleId, { headers: headers, });
  }

  // service call to save UserRoles
  saveUserRoles(UserRoleId: any, RoleID: any) {
    const headers = { 'content-type': 'application/json' };
    return this.http.post(
      `${environment.apiUrl}/UserRoles/Post?userRoleId=` + UserRoleId,RoleID, { headers: headers, });
  }
}
