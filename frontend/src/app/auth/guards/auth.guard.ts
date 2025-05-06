import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = localStorage.getItem('user');
    const isLoggedIn = user !== null;

    // 🔹 Empêcher l'accès à /login si l'utilisateur est déjà connecté
    if (isLoggedIn && state.url === '/login') {
      this.router.navigateByUrl('/dashboard');
      return false;
    }

    // 🔹 Empêcher l'accès aux autres pages si l'utilisateur n'est pas connecté
    if (!isLoggedIn && state.url !== '/login') {
      alert('Access denied: You must be logged in.');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
