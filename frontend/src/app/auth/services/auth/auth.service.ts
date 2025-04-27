import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

const BASE_URL = environment.apiBaseUrl;
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  register(signupRequest: any): Observable<any> {
    return this.http.post(BASE_URL + "/api/auth/signup", signupRequest);
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post(BASE_URL + "/api/auth/login", loginRequest);
}

refreshToken(refreshToken: string): Observable<any> {
  return this.http.post(BASE_URL + "/api/auth/refresh-token", {}, {
    headers: { Authorization: `Bearer ${refreshToken}` }
  });
}

}
