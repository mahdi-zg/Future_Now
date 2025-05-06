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

  // 🔹 Fonction pour créer les headers avec le token
  private createAuthorizationHeader(): HttpHeaders {
    let authHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + StorageService.getToken());
    return authHeaders;
  }

  // 🔹 Récupérer les informations de l'utilisateur par ID
  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/${userId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  // 🔹 Mettre à jour les informations utilisateur
  updateUserProfile(userId: number, updatedData: any): Observable<any> {
    return this.http.put(`${BASE_URL}/${userId}`, updatedData, {
      headers: this.createAuthorizationHeader()
    });
  }

    // 🔹 1️⃣ Créer un projet

    createProject(projectData: any, userId: number): Observable<any> {
      return this.http.post(`${BASE_URL}/createProject/${userId}`, projectData, {
        headers: this.createAuthorizationHeader()
      });
    }
  
    // 🔹 2️⃣ Récupérer un projet par ID
    getProjectById(projectId: number): Observable<any> {
      return this.http.get(`${BASE_URL}/getProject/${projectId}`, {
        headers: this.createAuthorizationHeader()
      });
    }
  
    // 🔹 3️⃣ Récupérer tous les projets d'un utilisateur
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
  
    // 2️⃣ Récupérer toutes les cartes d'un projet
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
uploadCard(projectId: number, formData: FormData): Observable<any> {
  return this.http.post(`${environment.apiBaseUrl}/api/cards/upload/${projectId}`, formData, {
    headers: this.createAuthorizationHeader()
  });
}

}