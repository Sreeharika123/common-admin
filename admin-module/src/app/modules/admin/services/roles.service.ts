import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  constructor(private http: HttpClient) { }

  getRoles(queryParams: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Roles/Get`, { params: queryParams });
  }
  editRoles(roleId: number) {
    return this.http.get(`${environment.apiUrl}/Roles/EditRole?roleId=${roleId}`);
  }
  changeRoleStatus(roleId: number, platFormObject: any) {
    return this.http.delete(`${environment.apiUrl}/Roles/Delete?roleId=${roleId}`, { body: platFormObject });
  }
  saveOrUpdate(roleId: number, roleData: Object) {
    const headers = { 'content-type': 'application/json' };
    if (roleId > 0) {
      return this.http.put(`${environment.apiUrl}/Roles/put?roleId=${roleId}`, roleData, { headers: headers });
    } else {
      return this.http.post(`${environment.apiUrl}/Roles/post`, roleData, { headers: headers });
    };
  };

}
