import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private headers = { 'content-type': 'application/json' };
  constructor(private http: HttpClient) { }
  /** service call for get users information */
  getUsersService(queryParams: any) {
    return this.http.get(`${environment.apiUrl}/Users/Get`, { params: queryParams });
  }
  /** service call for insert or update user information */
  saveRupdateUserService(userId: number = 0, userData: any) {
    return userId > 0 ? this.http.put(`${environment.apiUrl}/Users/Put?userId=${userId}`, userData, { headers: this.headers }) : this.http.post(`${environment.apiUrl}/Users/Post`, userData, { headers: this.headers });
  }
  /** service call for edit user information */
  editUserService(userId: number) {
    return this.http.get(`${environment.apiUrl}/Users/EditAdminUsers?userId=${userId}`);
  }
  /** service call for change user status */
  userStatuschangeService(userId: number, platFormObject: any) {
    return this.http.delete(`${environment.apiUrl}/Users/Delete?userId=${userId}`, { body: platFormObject });
  }

}
