import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangepasswordService {
  endpoint: string = environment.apiUrl;
  constructor(private httpclient:HttpClient) { }
  updatePassword(passowrdDetails:any)
  {
    const headers = { 'content-type': 'application/json' };
    return this.httpclient.put(`${this.endpoint}/ChangePassword/put`,passowrdDetails,{ headers: headers,})
  }
}
