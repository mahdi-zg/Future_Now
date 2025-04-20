import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/auth/services/storage/storage.service';
import { environment } from 'src/environments/environment.prod';
const BASE_URL = `${environment.apiBaseUrl}/api/user`;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {}

  private createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', 'Bearer ' + StorageService.getToken());
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/${userId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  updateUserProfile(userId: number, updatedData: any): Observable<any> {
    return this.http.put(`${BASE_URL}/${userId}`, updatedData, {
      headers: this.createAuthorizationHeader()
    });
  }

  createProject(projectData: any, userId: number): Observable<any> {
    return this.http.post(`${BASE_URL}/createProject/${userId}`, projectData, {
      headers: this.createAuthorizationHeader()
    });
  }

  getProjectById(projectId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/getProject/${projectId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  getProjectsByUser(userId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/getProjects/${userId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/deleteProject/${projectId}`, {
      headers: this.createAuthorizationHeader(),
      responseType: 'json'
    });
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    return this.http.put(`${BASE_URL}/updateProject/${projectId}`, projectData, {
      headers: this.createAuthorizationHeader()
    });
  }

  addCardsToProject(projectId: number, cards: any[]): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/api/cards/project/${projectId}`, cards, {
      headers: this.createAuthorizationHeader()
    });
  }

  getCardsByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/cards/project/${projectId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/api/cards/${cardId}`, {
      headers: this.createAuthorizationHeader()
    });
  }
}