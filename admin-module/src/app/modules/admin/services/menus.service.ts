import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenusService {

  constructor(private http: HttpClient) { }
  //this service is used to get information.
  getMenus(queryParamss: any): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Menus/Get`, { params: queryParamss }).pipe(map((data: any) => {
      return data;
    })
    );
  }
  //service to add/update menu
  addOrUpdateMenu(menuId: number, menuData: any): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    if (menuId > 0) {
      return this.http.put(`${environment.apiUrl}/Menus/Put?menuId=${menuId}`, menuData, { headers: headers }
      );
    } else {
      return this.http.post(`${environment.apiUrl}/Menus/Post`, menuData, { headers: headers, });
    }
  }
  //service to change menu status
  changeMenuStatus(menuId: number, platFormObject: any) {
    return this.http.delete(`${environment.apiUrl}/Menus/Delete?menuId=${menuId}`, { body: platFormObject });
  }
  //service for edit data
  editMenu(menuId: number) {
    return this.http.get(
      `${environment.apiUrl}/Menus/EditMenu?editMenuId=${menuId}`
    );
  }
}
