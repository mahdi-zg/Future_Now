import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth/auth.service';
import { StorageService } from '../auth/services/storage/storage.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;

    const token = StorageService.getToken();
    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 403 && !this.isRefreshing) {
          this.isRefreshing = true;
          const refreshToken = StorageService.getRefreshToken();

          if (refreshToken) {
            return this.authService.refreshToken(refreshToken).pipe(
              switchMap((res) => {
                this.isRefreshing = false;
                StorageService.saveToken(res.accessToken); // ✅ met à jour le nouveau token
                return next.handle(this.addTokenHeader(req, res.accessToken));
              }),
              catchError((err) => {
                this.isRefreshing = false;
                StorageService.logout();
                return throwError(() => err);
              })
            );
          }
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }
}
